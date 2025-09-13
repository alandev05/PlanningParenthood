#!/usr/bin/env python3
"""
Firebase initialization script for the Parenting Recommendations platform.
This script initializes Firebase connection and optionally seeds with sample data.
"""

import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app import create_app
import app as app_module
from scripts.seed_data import seed_database

def init_firebase(seed=False):
    """Initialize Firebase connection and optionally seed with data"""
    app = create_app()
    
    with app.app_context():
        try:
            # Test Firebase connection
            print("Testing Firebase connection...")
            if app_module.db:
                # Try to access a test collection
                test_ref = app_module.db.collection('health_check').limit(1)
                list(test_ref.stream())
                print("✓ Firebase connected successfully!")
            else:
                print("✗ Firebase not initialized. Check your credentials.")
                return False
            
            if seed:
                print("Seeding Firebase with sample data...")
                seed_database()
                print("✓ Firebase seeded successfully!")
            
            print("\nFirebase initialization complete!")
            
        except Exception as e:
            print(f"✗ Error initializing Firebase: {e}")
            print("\nTroubleshooting:")
            print("1. Make sure you have firebase-credentials.json in the backend directory")
            print("2. Or set FIREBASE_PROJECT_ID in your .env file")
            print("3. Check that your Firebase project has Firestore enabled")
            return False
    
    return True

if __name__ == '__main__':
    # Check if seed flag is provided
    seed_data = '--seed' in sys.argv or '-s' in sys.argv
    
    print("Parenting Recommendations - Firebase Initialization")
    print("=" * 50)
    
    if seed_data:
        print("Will seed Firebase with sample data")
    
    success = init_firebase(seed=seed_data)
    
    if success:
        print("\nNext steps:")
        print("1. Start the Flask server: python server.py")
        print("2. Test the API: curl http://localhost:8001/api/health")
    else:
        sys.exit(1)