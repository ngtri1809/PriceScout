#!/usr/bin/env python3
"""
PriceScout Prophet Training Job
Trains Prophet models for price forecasting and stores predictions in RDS
"""

import os
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import json

import pandas as pd
from sqlalchemy import create_engine, text
from prophet import Prophet
from prophet.diagnostics import cross_validation, performance_metrics
from pydantic_settings import BaseSettings
import toml
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseConfig(BaseSettings):
    host: str
    port: int = 3306
    username: str
    password: str
    database: str
    charset: str = "utf8mb4"
    
    @property
    def url(self) -> str:
        return f"mysql+pymysql://{self.username}:{self.password}@{self.host}:{self.port}/{self.database}?charset={self.charset}"

class ProphetConfig(BaseSettings):
    weekly_seasonality: bool = True
    yearly_seasonality: bool = True
    daily_seasonality: bool = False
    seasonality_mode: str = "multiplicative"
    changepoint_prior_scale: float = 0.05
    seasonality_prior_scale: float = 10.0

class TrainingConfig(BaseSettings):
    min_data_points: int = 30
    forecast_periods: int = 365
    validation_split: float = 0.2
    retrain_frequency_days: int = 7

class ProphetTrainingJob:
    def __init__(self, config_path: str = "config/settings.toml"):
        """Initialize the Prophet training job with configuration."""
        self.config = self._load_config(config_path)
        self.db_config = DatabaseConfig(**self.config["database"])
        self.prophet_config = ProphetConfig(**self.config["prophet"])
        self.training_config = TrainingConfig(**self.config["training"])
        
        # Initialize database connection
        self.engine = create_engine(self.db_config.url)
    
    def _load_config(self, config_path: str) -> Dict[str, Any]:
        """Load configuration from TOML file."""
        try:
            with open(config_path, 'r') as f:
                return toml.load(f)
        except FileNotFoundError:
            logger.error(f"Configuration file not found: {config_path}")
            raise
        except Exception as e:
            logger.error(f"Error loading configuration: {e}")
            raise
    
    def get_products_for_training(self) -> List[Dict[str, Any]]:
        """Get list of products that need training or retraining."""
        try:
            with self.engine.begin() as conn:
                # Get products with sufficient data points
                query = text("""
                    SELECT p.id, p.sku, p.title, COUNT(ph.ds) as data_points,
                           MAX(ph.ds) as latest_date,
                           MAX(mm.created_at) as last_trained
                    FROM products p
                    LEFT JOIN price_history ph ON p.id = ph.product_id
                    LEFT JOIN model_metadata mm ON p.id = mm.product_id AND mm.is_active = 1
                    GROUP BY p.id, p.sku, p.title
                    HAVING data_points >= :min_points
                    ORDER BY p.id
                """)
                
                result = conn.execute(query, {"min_points": self.training_config.min_data_points})
                products = []
                
                for row in result:
                    # Check if retraining is needed
                    needs_retrain = True
                    if row.last_trained:
                        days_since_training = (datetime.now() - row.last_trained).days
                        needs_retrain = days_since_training >= self.training_config.retrain_frequency_days
                    
                    products.append({
                        'id': row.id,
                        'sku': row.sku,
                        'title': row.title,
                        'data_points': row.data_points,
                        'latest_date': row.latest_date,
                        'last_trained': row.last_trained,
                        'needs_retrain': needs_retrain
                    })
                
                return products
                
        except Exception as e:
            logger.error(f"Error getting products for training: {e}")
            return []
    
    def train_product_model(self, product_id: int, model_version: str = None) -> bool:
        """
        Train Prophet model for a specific product.
        
        Args:
            product_id: Product ID to train model for
            model_version: Model version string (defaults to timestamp)
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            if not model_version:
                model_version = f"prophet_v{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            logger.info(f"Training Prophet model for product {product_id} (version: {model_version})")
            
            # Get training data
            training_data = self._get_training_data(product_id)
            if training_data.empty:
                logger.warning(f"No training data found for product {product_id}")
                return False
            
            if len(training_data) < self.training_config.min_data_points:
                logger.warning(f"Insufficient data points for product {product_id}: {len(training_data)} < {self.training_config.min_data_points}")
                return False
            
            # Prepare data for Prophet
            prophet_data = training_data[['ds', 'y']].copy()
            prophet_data.columns = ['ds', 'y']  # Prophet expects these exact column names
            
            # Initialize and configure Prophet
            model = Prophet(
                weekly_seasonality=self.prophet_config.weekly_seasonality,
                yearly_seasonality=self.prophet_config.yearly_seasonality,
                daily_seasonality=self.prophet_config.daily_seasonality,
                seasonality_mode=self.prophet_config.seasonality_mode,
                changepoint_prior_scale=self.prophet_config.changepoint_prior_scale,
                seasonality_prior_scale=self.prophet_config.seasonality_prior_scale
            )
            
            # Train the model
            logger.info(f"Fitting Prophet model with {len(prophet_data)} data points...")
            model.fit(prophet_data)
            
            # Generate forecasts
            future = model.make_future_dataframe(periods=self.training_config.forecast_periods)
            forecast = model.predict(future)
            
            # Prepare forecast data for database
            forecast_data = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].copy()
            forecast_data['product_id'] = product_id
            forecast_data['model_version'] = model_version
            forecast_data['ds'] = pd.to_datetime(forecast_data['ds']).dt.date
            
            # Calculate performance metrics
            performance_metrics_data = self._calculate_performance_metrics(model, prophet_data)
            
            # Store results in database
            success = self._store_training_results(
                product_id, model_version, forecast_data, 
                performance_metrics_data, training_data
            )
            
            if success:
                logger.info(f"✅ Successfully trained model for product {product_id}")
            else:
                logger.error(f"❌ Failed to store training results for product {product_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error training model for product {product_id}: {e}")
            return False
    
    def _get_training_data(self, product_id: int) -> pd.DataFrame:
        """Get training data for a specific product."""
        try:
            with self.engine.begin() as conn:
                query = text("""
                    SELECT ds, price as y
                    FROM price_history
                    WHERE product_id = :product_id
                    ORDER BY ds
                """)
                
                df = pd.read_sql(query, conn, params={"product_id": product_id})
                df['ds'] = pd.to_datetime(df['ds'])
                
                return df
                
        except Exception as e:
            logger.error(f"Error getting training data for product {product_id}: {e}")
            return pd.DataFrame()
    
    def _calculate_performance_metrics(self, model: Prophet, training_data: pd.DataFrame) -> Dict[str, Any]:
        """Calculate performance metrics for the trained model."""
        try:
            # Perform cross-validation
            df_cv = cross_validation(
                model, 
                initial=f'{len(training_data) // 2} days',
                period='7 days',
                horizon='30 days'
            )
            
            # Calculate metrics
            metrics = performance_metrics(df_cv)
            
            return {
                'mae': float(metrics['mae'].mean()),
                'mape': float(metrics['mape'].mean()),
                'rmse': float(metrics['rmse'].mean()),
                'smape': float(metrics['smape'].mean()),
                'coverage': float(metrics['coverage'].mean())
            }
            
        except Exception as e:
            logger.warning(f"Error calculating performance metrics: {e}")
            return {}
    
    def _store_training_results(
        self, 
        product_id: int, 
        model_version: str, 
        forecast_data: pd.DataFrame,
        performance_metrics: Dict[str, Any],
        training_data: pd.DataFrame
    ) -> bool:
        """Store training results in the database."""
        try:
            with self.engine.begin() as conn:
                # Store forecasts
                forecast_data.to_sql('forecasts_staging', conn, if_exists='replace', index=False)
                
                conn.execute(text("""
                    INSERT INTO forecasts(product_id, ds, yhat, yhat_lower, yhat_upper, model_version)
                    SELECT product_id, ds, yhat, yhat_lower, yhat_upper, model_version 
                    FROM forecasts_staging
                    ON DUPLICATE KEY UPDATE
                        yhat = VALUES(yhat),
                        yhat_lower = VALUES(yhat_lower),
                        yhat_upper = VALUES(yhat_upper)
                """))
                
                # Store model metadata
                model_metadata = {
                    'product_id': product_id,
                    'model_version': model_version,
                    'model_type': 'prophet',
                    'training_data_start': training_data['ds'].min().date(),
                    'training_data_end': training_data['ds'].max().date(),
                    'model_params': {
                        'weekly_seasonality': self.prophet_config.weekly_seasonality,
                        'yearly_seasonality': self.prophet_config.yearly_seasonality,
                        'daily_seasonality': self.prophet_config.daily_seasonality,
                        'seasonality_mode': self.prophet_config.seasonality_mode,
                        'changepoint_prior_scale': self.prophet_config.changepoint_prior_scale,
                        'seasonality_prior_scale': self.prophet_config.seasonality_prior_scale
                    },
                    'performance_metrics': performance_metrics,
                    'is_active': True
                }
                
                # Deactivate old models for this product
                conn.execute(text("""
                    UPDATE model_metadata 
                    SET is_active = 0 
                    WHERE product_id = :product_id
                """), {"product_id": product_id})
                
                # Insert new model metadata
                conn.execute(text("""
                    INSERT INTO model_metadata 
                    (product_id, model_version, model_type, training_data_start, 
                     training_data_end, model_params, performance_metrics, is_active)
                    VALUES 
                    (:product_id, :model_version, :model_type, :training_data_start,
                     :training_data_end, :model_params, :performance_metrics, :is_active)
                """), model_metadata)
                
                return True
                
        except Exception as e:
            logger.error(f"Error storing training results: {e}")
            return False
    
    def train_all_products(self) -> Dict[str, Any]:
        """Train models for all products that need training."""
        logger.info("Starting training for all products...")
        
        products = self.get_products_for_training()
        results = {
            'total_products': len(products),
            'successful': 0,
            'failed': 0,
            'skipped': 0,
            'errors': []
        }
        
        for product in products:
            try:
                if product['needs_retrain']:
                    success = self.train_product_model(product['id'])
                    if success:
                        results['successful'] += 1
                    else:
                        results['failed'] += 1
                        results['errors'].append(f"Failed to train product {product['id']} ({product['sku']})")
                else:
                    results['skipped'] += 1
                    logger.info(f"Skipping product {product['id']} ({product['sku']}) - recently trained")
                    
            except Exception as e:
                results['failed'] += 1
                error_msg = f"Error training product {product['id']} ({product['sku']}): {e}"
                results['errors'].append(error_msg)
                logger.error(error_msg)
        
        logger.info(f"Training completed: {results['successful']} successful, {results['failed']} failed, {results['skipped']} skipped")
        return results

def main():
    """Main function for command-line usage."""
    import argparse
    
    parser = argparse.ArgumentParser(description='PriceScout Prophet Training Job')
    parser.add_argument('--product-id', type=int, help='Train model for specific product ID')
    parser.add_argument('--all', action='store_true', help='Train models for all products')
    parser.add_argument('--config', default='config/settings.toml', help='Configuration file path')
    parser.add_argument('--model-version', help='Custom model version string')
    
    args = parser.parse_args()
    
    # Initialize job
    job = ProphetTrainingJob(args.config)
    
    if args.product_id:
        # Train specific product
        success = job.train_product_model(args.product_id, args.model_version)
        if success:
            print(f"✅ Successfully trained model for product {args.product_id}")
        else:
            print(f"❌ Failed to train model for product {args.product_id}")
            exit(1)
    
    elif args.all:
        # Train all products
        results = job.train_all_products()
        print("Training Results:")
        print(f"  Total products: {results['total_products']}")
        print(f"  Successful: {results['successful']}")
        print(f"  Failed: {results['failed']}")
        print(f"  Skipped: {results['skipped']}")
        
        if results['errors']:
            print("\nErrors:")
            for error in results['errors']:
                print(f"  - {error}")
    
    else:
        print("Please specify --product-id or --all")
        parser.print_help()

if __name__ == "__main__":
    main()
