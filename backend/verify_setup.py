#!/usr/bin/env python3
"""
Verification script for backend setup.
Checks that all components are properly configured.
"""

import sys
import os
from pathlib import Path

def check_file_structure():
    """Verify all required files exist"""
    required_files = [
        'config.py',
        'server.py',
        'requirements.txt',
        'app/__init__.py',
        'app/models.py',
        'app/api/__init__.py',
        'app/api/routes.py',
        'app/services/__init__.py',
        'app/services/cache_service.py',
        'scripts/__init__.py',
        'scripts/init_db.py',
        'scripts/seed_data.py',
        '.env.example'
    ]
    
    missing_files = []
    for file_path in required_files:
        if not Path(file_path).exists():
            missing_files.append(file_path)
    
    if missing_files:
        print("✗ Missing files:")
        for file in missing_files:
            print(f"  - {file}")
        return False
    else:
        print("✓ All required files present")
        return True

def check_python_syntax():
    """Check Python syntax for all .py files"""
    python_files = [
        'config.py',
        'server.py',
        'app/__init__.py',
        'app/models.py',
        'app/api/__init__.py',
        'app/api/routes.py',
        'app/services/__init__.py',
        'app/services/cache_service.py',
        'scripts/__init__.py',
        'scripts/init_db.py',
        'scripts/seed_data.py'
    ]
    
    syntax_errors = []
    for file_path in python_files:
        try:
            with open(file_path, 'r') as f:
                compile(f.read(), file_path, 'exec')
        except SyntaxError as e:
            syntax_errors.append(f"{file_path}: {e}")
    
    if syntax_errors:
        print("✗ Python syntax errors:")
        for error in syntax_errors:
            print(f"  - {error}")
        return False
    else:
        print("✓ All Python files have valid syntax")
        return True

def check_requirements():
    """Check requirements.txt content"""
    try:
        with open('requirements.txt', 'r') as f:
            requirements = f.read().strip().split('\n')
        
        expected_packages = [
            'Flask', 'Flask-CORS', 'Flask-SQLAlchemy', 
            'Flask-Migrate', 'psycopg2-binary', 'redis', 
            'python-dotenv', 'marshmallow'
        ]
        
        missing_packages = []
        for package in expected_packages:
            if not any(package.lower() in req.lower() for req in requirements):
                missing_packages.append(package)
        
        if missing_packages:
            print("✗ Missing packages in requirements.txt:")
            for package in missing_packages:
                print(f"  - {package}")
            return False
        else:
            print("✓ All required packages listed in requirements.txt")
            return True
    
    except FileNotFoundError:
        print("✗ requirements.txt not found")
        return False

def main():
    print("Backend Setup Verification")
    print("=" * 30)
    
    checks = [
        check_file_structure(),
        check_python_syntax(),
        check_requirements()
    ]
    
    if all(checks):
        print("\n✓ Backend setup verification passed!")
        print("\nNext steps:")
        print("1. Install dependencies: pip install -r requirements.txt")
        print("2. Set up environment: cp .env.example .env")
        print("3. Configure database and Redis in .env")
        print("4. Initialize database: python scripts/init_db.py --seed")
        print("5. Start server: python server.py")
        return True
    else:
        print("\n✗ Backend setup verification failed!")
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)