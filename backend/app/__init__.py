import os
import redis
import firebase_admin
from firebase_admin import credentials, firestore
from flask import Flask
from flask_cors import CORS
from config import config

# Initialize Firebase and Redis clients
firebase_app = None
db = None
redis_client = None

def create_app(config_name=None):
    """Application factory pattern"""
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize CORS
    CORS(app)
    
    # Initialize Firebase
    global firebase_app, db
    if not firebase_app:
        try:
            # Check if running in testing mode with emulator
            if app.config.get('FIREBASE_USE_EMULATOR'):
                os.environ['FIRESTORE_EMULATOR_HOST'] = 'localhost:8080'
                firebase_app = firebase_admin.initialize_app()
                app.logger.info("Firebase initialized with emulator")
            else:
                # Use service account credentials
                cred_path = app.config['FIREBASE_CREDENTIALS_PATH']
                app.logger.info(f"Looking for credentials at: {cred_path}")
                if os.path.exists(cred_path):
                    app.logger.info("Credentials file found, initializing with service account")
                    cred = credentials.Certificate(cred_path)
                    firebase_app = firebase_admin.initialize_app(cred)
                    app.logger.info("Firebase app initialized")
                else:
                    app.logger.info("No credentials file, trying default credentials")
                    # Try to use default credentials (for deployed environments)
                    firebase_app = firebase_admin.initialize_app()
            
            app.logger.info("Creating Firestore client...")
            db = firestore.client()
            app.logger.info("Firebase initialized successfully")
            
        except Exception as e:
            app.logger.error(f"Firebase initialization failed: {e}")
            import traceback
            app.logger.error(f"Full traceback: {traceback.format_exc()}")
            db = None
    
    # Initialize Redis
    global redis_client
    try:
        redis_client = redis.from_url(app.config['REDIS_URL'])
        redis_client.ping()  # Test connection
        app.logger.info("Redis connected successfully")
    except Exception as e:
        app.logger.warning(f"Redis connection failed: {e}")
        redis_client = None
    
    # Register blueprints
    from app.api import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')
    
    return app