#!/usr/bin/env python3
"""
PriceScout ML Service
Main entry point for the ML service with Flask API
"""

import os
import logging
from datetime import datetime
from typing import Dict, Any, List

from flask import Flask, request, jsonify
from jobs.ingest_dataset import DataIngestionJob
from jobs.train_prophet import ProphetTrainingJob

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'pricescout-ml'
    })

@app.route('/ingest/s3', methods=['POST'])
def ingest_from_s3():
    """Ingest data from S3."""
    try:
        data = request.get_json()
        s3_key = data.get('s3_key')
        
        if not s3_key:
            return jsonify({'error': 's3_key is required'}), 400
        
        job = DataIngestionJob()
        success = job.ingest_from_s3(s3_key)
        
        if success:
            stats = job.get_ingestion_stats()
            return jsonify({
                'status': 'success',
                'message': f'Successfully ingested data from s3://{job.aws_config.s3_bucket}/{s3_key}',
                'stats': stats
            })
        else:
            return jsonify({'error': 'Failed to ingest data from S3'}), 500
            
    except Exception as e:
        logger.error(f"Error in S3 ingestion: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/ingest/local', methods=['POST'])
def ingest_from_local():
    """Ingest data from local file."""
    try:
        data = request.get_json()
        file_path = data.get('file_path')
        
        if not file_path:
            return jsonify({'error': 'file_path is required'}), 400
        
        job = DataIngestionJob()
        success = job.ingest_from_local(file_path)
        
        if success:
            stats = job.get_ingestion_stats()
            return jsonify({
                'status': 'success',
                'message': f'Successfully ingested data from {file_path}',
                'stats': stats
            })
        else:
            return jsonify({'error': 'Failed to ingest data from local file'}), 500
            
    except Exception as e:
        logger.error(f"Error in local ingestion: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/train/product/<int:product_id>', methods=['POST'])
def train_product_model(product_id: int):
    """Train Prophet model for a specific product."""
    try:
        data = request.get_json() or {}
        model_version = data.get('model_version')
        
        job = ProphetTrainingJob()
        success = job.train_product_model(product_id, model_version)
        
        if success:
            return jsonify({
                'status': 'success',
                'message': f'Successfully trained model for product {product_id}',
                'product_id': product_id,
                'model_version': model_version
            })
        else:
            return jsonify({'error': f'Failed to train model for product {product_id}'}), 500
            
    except Exception as e:
        logger.error(f"Error training product model: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/train/all', methods=['POST'])
def train_all_products():
    """Train models for all products."""
    try:
        job = ProphetTrainingJob()
        results = job.train_all_products()
        
        return jsonify({
            'status': 'success',
            'message': 'Training completed for all products',
            'results': results
        })
        
    except Exception as e:
        logger.error(f"Error training all products: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/predict/<int:product_id>', methods=['GET'])
def get_predictions(product_id: int):
    """Get price predictions for a product."""
    try:
        from sqlalchemy import create_engine, text
        from jobs.train_prophet import DatabaseConfig
        import toml
        
        # Load config
        with open('config/settings.toml', 'r') as f:
            config = toml.load(f)
        
        db_config = DatabaseConfig(**config["database"])
        engine = create_engine(db_config.url)
        
        # Get latest predictions
        with engine.begin() as conn:
            query = text("""
                SELECT ds, yhat, yhat_lower, yhat_upper, model_version
                FROM forecasts
                WHERE product_id = :product_id
                AND ds >= CURDATE()
                ORDER BY ds
                LIMIT 30
            """)
            
            result = conn.execute(query, {"product_id": product_id})
            predictions = []
            
            for row in result:
                predictions.append({
                    'date': str(row.ds),
                    'predicted_price': float(row.yhat),
                    'lower_bound': float(row.yhat_lower),
                    'upper_bound': float(row.yhat_upper),
                    'model_version': row.model_version
                })
            
            return jsonify({
                'status': 'success',
                'product_id': product_id,
                'predictions': predictions
            })
            
    except Exception as e:
        logger.error(f"Error getting predictions: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/stats', methods=['GET'])
def get_stats():
    """Get service statistics."""
    try:
        ingestion_job = DataIngestionJob()
        stats = ingestion_job.get_ingestion_stats()
        
        return jsonify({
            'status': 'success',
            'stats': stats
        })
        
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Check if config file exists
    config_path = 'config/settings.toml'
    if not os.path.exists(config_path):
        logger.warning(f"Configuration file not found: {config_path}")
        logger.info("Please copy config/settings.example.toml to config/settings.toml and update with your values")
    
    # Run the Flask app
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting PriceScout ML Service on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)