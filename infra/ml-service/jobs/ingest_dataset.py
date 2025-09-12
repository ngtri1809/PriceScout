#!/usr/bin/env python3
"""
PriceScout Data Ingestion Job
Pulls price data from S3 and loads it into RDS for Prophet training
"""

import os
import io
import logging
from datetime import datetime
from typing import List, Dict, Any

import boto3
import pandas as pd
from sqlalchemy import create_engine, text
from pydantic_settings import BaseSettings
import toml

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

class AWSConfig(BaseSettings):
    region: str = "us-east-1"
    s3_bucket: str
    access_key_id: str = ""
    secret_access_key: str = ""

class DataIngestionJob:
    def __init__(self, config_path: str = "config/settings.toml"):
        """Initialize the data ingestion job with configuration."""
        self.config = self._load_config(config_path)
        self.db_config = DatabaseConfig(**self.config["database"])
        self.aws_config = AWSConfig(**self.config["aws"])
        
        # Initialize database connection
        self.engine = create_engine(self.db_config.url)
        
        # Initialize S3 client
        if self.aws_config.access_key_id and self.aws_config.secret_access_key:
            self.s3_client = boto3.client(
                's3',
                region_name=self.aws_config.region,
                aws_access_key_id=self.aws_config.access_key_id,
                aws_secret_access_key=self.aws_config.secret_access_key
            )
        else:
            # Use default credentials (IAM role, environment variables, etc.)
            self.s3_client = boto3.client('s3', region_name=self.aws_config.region)
    
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
    
    def ingest_from_s3(self, s3_key: str) -> bool:
        """
        Ingest price data from S3 CSV file.
        
        Args:
            s3_key: S3 object key (e.g., "curated/price_series/laptop_A.csv")
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            logger.info(f"Starting ingestion from S3: s3://{self.aws_config.s3_bucket}/{s3_key}")
            
            # Download and parse CSV from S3
            response = self.s3_client.get_object(
                Bucket=self.aws_config.s3_bucket,
                Key=s3_key
            )
            
            df = pd.read_csv(io.BytesIO(response['Body'].read()))
            logger.info(f"Loaded {len(df)} records from S3")
            
            # Validate required columns
            required_columns = ['sku', 'ds', 'y']
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                raise ValueError(f"Missing required columns: {missing_columns}")
            
            # Process and load data
            return self._process_and_load_data(df)
            
        except Exception as e:
            logger.error(f"Error ingesting from S3: {e}")
            return False
    
    def ingest_from_local(self, file_path: str) -> bool:
        """
        Ingest price data from local CSV file.
        
        Args:
            file_path: Path to local CSV file
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            logger.info(f"Starting ingestion from local file: {file_path}")
            
            df = pd.read_csv(file_path)
            logger.info(f"Loaded {len(df)} records from local file")
            
            # Validate required columns
            required_columns = ['sku', 'ds', 'y']
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                raise ValueError(f"Missing required columns: {missing_columns}")
            
            # Process and load data
            return self._process_and_load_data(df)
            
        except Exception as e:
            logger.error(f"Error ingesting from local file: {e}")
            return False
    
    def _process_and_load_data(self, df: pd.DataFrame) -> bool:
        """Process and load data into the database."""
        try:
            with self.engine.begin() as conn:
                # Step 1: Upsert products
                logger.info("Upserting products...")
                products_df = df[['sku']].drop_duplicates()
                products_df['title'] = products_df['sku']  # Use SKU as title for now
                
                # Create staging table
                products_df.to_sql('products_staging', conn, if_exists='replace', index=False)
                
                # Upsert products
                conn.execute(text("""
                    INSERT INTO products(sku, title) 
                    SELECT sku, title FROM products_staging
                    ON DUPLICATE KEY UPDATE title = VALUES(title)
                """))
                
                # Get product ID mapping
                product_mapping = pd.read_sql(
                    "SELECT id, sku FROM products", 
                    conn
                )
                
                # Step 2: Prepare price history data
                logger.info("Preparing price history data...")
                df_merged = df.merge(product_mapping, on='sku')
                price_history_df = df_merged[['id', 'ds', 'y']].rename(columns={
                    'id': 'product_id',
                    'y': 'price'
                })
                
                # Convert date column
                price_history_df['ds'] = pd.to_datetime(price_history_df['ds']).dt.date
                
                # Step 3: Upsert price history
                logger.info("Upserting price history...")
                price_history_df.to_sql('price_history_staging', conn, if_exists='replace', index=False)
                
                conn.execute(text("""
                    INSERT INTO price_history(product_id, ds, price)
                    SELECT product_id, ds, price FROM price_history_staging
                    ON DUPLICATE KEY UPDATE price = VALUES(price)
                """))
                
                logger.info(f"Successfully ingested {len(price_history_df)} price records")
                return True
                
        except Exception as e:
            logger.error(f"Error processing and loading data: {e}")
            return False
    
    def get_ingestion_stats(self) -> Dict[str, Any]:
        """Get statistics about ingested data."""
        try:
            with self.engine.begin() as conn:
                stats = {}
                
                # Product count
                result = conn.execute(text("SELECT COUNT(*) as count FROM products"))
                stats['total_products'] = result.fetchone()[0]
                
                # Price history count
                result = conn.execute(text("SELECT COUNT(*) as count FROM price_history"))
                stats['total_price_records'] = result.fetchone()[0]
                
                # Date range
                result = conn.execute(text("""
                    SELECT MIN(ds) as min_date, MAX(ds) as max_date 
                    FROM price_history
                """))
                row = result.fetchone()
                stats['date_range'] = {
                    'min_date': str(row[0]) if row[0] else None,
                    'max_date': str(row[1]) if row[1] else None
                }
                
                return stats
                
        except Exception as e:
            logger.error(f"Error getting ingestion stats: {e}")
            return {}

def main():
    """Main function for command-line usage."""
    import argparse
    
    parser = argparse.ArgumentParser(description='PriceScout Data Ingestion Job')
    parser.add_argument('--s3-key', help='S3 object key for CSV file')
    parser.add_argument('--local-file', help='Local CSV file path')
    parser.add_argument('--config', default='config/settings.toml', help='Configuration file path')
    parser.add_argument('--stats', action='store_true', help='Show ingestion statistics')
    
    args = parser.parse_args()
    
    # Initialize job
    job = DataIngestionJob(args.config)
    
    if args.stats:
        # Show statistics
        stats = job.get_ingestion_stats()
        print("Ingestion Statistics:")
        for key, value in stats.items():
            print(f"  {key}: {value}")
    
    elif args.s3_key:
        # Ingest from S3
        success = job.ingest_from_s3(args.s3_key)
        if success:
            print("✅ S3 ingestion completed successfully")
        else:
            print("❌ S3 ingestion failed")
            exit(1)
    
    elif args.local_file:
        # Ingest from local file
        success = job.ingest_from_local(args.local_file)
        if success:
            print("✅ Local file ingestion completed successfully")
        else:
            print("❌ Local file ingestion failed")
            exit(1)
    
    else:
        print("Please specify --s3-key, --local-file, or --stats")
        parser.print_help()

if __name__ == "__main__":
    main()
