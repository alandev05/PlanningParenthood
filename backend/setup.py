#!/usr/bin/env python3
"""
Automated setup script for the Parenting Recommendations backend.
Detects the user's environment and configures the database accordingly.
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def check_command_exists(command):
    """Check if a command exists in the system PATH"""
    return shutil.which(command) is not None

def get_postgres_user():
    """Detect the appropriate PostgreSQL user"""
    # Try common PostgreSQL users
    possible_users = [
        os.environ.get('USER'),  # Current system user
        'postgres',              # Default PostgreSQL user
        os.environ.get('USERNAME'),  # Windows username
    ]
    
    for user in possible_users:
        if user:
            try:
                # Test connection with this user
                result = subprocess.run(
                    ['psql', '-U', user, '-d', 'postgres', '-c', 'SELECT 1;'],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                if result.returncode == 0:
                    return user
            except (subprocess.TimeoutExpired, FileNotFoundError):
                continue
    
    return None

def setup_database():
    """Set up the database configuration"""
    print("🔍 Detecting database setup...")
    
    # Check if PostgreSQL is available
    if not check_command_exists('psql'):
        print("⚠️  PostgreSQL not found. Using SQLite instead.")
        return 'sqlite:///parenting_recommendations.db'
    
    # Try to detect PostgreSQL user
    pg_user = get_postgres_user()
    if pg_user:
        print(f"✓ Found PostgreSQL user: {pg_user}")
        
        # Check if database exists, create if not
        db_name = 'parenting_recommendations'
        try:
            result = subprocess.run(
                ['psql', '-U', pg_user, '-lqt'],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            if db_name not in result.stdout:
                print(f"📦 Creating database: {db_name}")
                subprocess.run(
                    ['createdb', '-U', pg_user, db_name],
                    check=True,
                    timeout=10
                )
                print("✓ Database created successfully")
            else:
                print("✓ Database already exists")
        
        except subprocess.CalledProcessError as e:
            print(f"⚠️  Could not create database: {e}")
            print("   Please create it manually: createdb parenting_recommendations")
        
        return f'postgresql://{pg_user}@localhost:5432/{db_name}'
    
    else:
        print("⚠️  Could not connect to PostgreSQL. Using SQLite instead.")
        return 'sqlite:///parenting_recommendations.db'

def create_env_file():
    """Create .env file with detected configuration"""
    env_path = Path('.env')
    
    if env_path.exists():
        print("✓ .env file already exists")
        return
    
    print("📝 Creating .env file...")
    
    database_url = setup_database()
    
    env_content = f"""# Flask Configuration
FLASK_ENV=development
SECRET_KEY=dev-secret-key-change-in-production

# Database Configuration
DATABASE_URL={database_url}

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379/0

# LLM API Keys (add your keys here)
# OPENAI_API_KEY=your-openai-api-key
# ANTHROPIC_API_KEY=your-anthropic-api-key

# Google Maps API (add your key here)
# GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Fetch.ai Configuration
FETCHAI_ENABLED=false
FETCHAI_OEF_ADDR=127.0.0.1
FETCHAI_OEF_PORT=10000
"""
    
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print("✓ .env file created")

def install_dependencies():
    """Install Python dependencies"""
    print("📦 Installing Python dependencies...")
    
    try:
        subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'], 
                      check=True)
        print("✓ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to install dependencies: {e}")
        return False

def initialize_database():
    """Initialize database tables and seed data"""
    print("🗄️  Initializing database...")
    
    try:
        subprocess.run([sys.executable, 'scripts/init_db.py', '--seed'], 
                      check=True)
        print("✓ Database initialized with sample data")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to initialize database: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 Parenting Recommendations Backend Setup")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not Path('requirements.txt').exists():
        print("✗ Please run this script from the backend directory")
        sys.exit(1)
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("✗ Python 3.8+ required")
        sys.exit(1)
    
    print(f"✓ Python {sys.version_info.major}.{sys.version_info.minor}")
    
    # Setup steps
    steps = [
        ("Creating environment configuration", create_env_file),
        ("Installing dependencies", install_dependencies),
        ("Initializing database", initialize_database),
    ]
    
    for step_name, step_func in steps:
        print(f"\n{step_name}...")
        if not step_func():
            print(f"✗ Setup failed at: {step_name}")
            sys.exit(1)
    
    print("\n🎉 Setup completed successfully!")
    print("\nNext steps:")
    print("1. Start the server: python server.py")
    print("2. Test the API: curl http://localhost:8001/api/health")
    print("3. Add your API keys to .env file for full functionality")

if __name__ == '__main__':
    main()