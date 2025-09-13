# Parenting Recommendations Backend

Flask-based backend API for the Personalized Parenting Recommendations platform using Firebase Firestore.

## Features

- **Flask Application**: RESTful API with proper configuration management
- **Firebase Firestore**: NoSQL cloud database with real-time capabilities
- **Redis Caching**: Session management and recommendation caching
- **Data Models**: Family profiles, activities, recommendations, and success stories
- **Modular Architecture**: Blueprint-based API organization

## Prerequisites

- Python 3.8+
- Firebase project with Firestore enabled
- Redis 6+ (optional)

## Quick Setup

1. **Create virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up Firebase:**
   - Follow the detailed [Firebase Setup Guide](FIREBASE_SETUP.md)
   - Download your `firebase-credentials.json` file
   - Place it in the backend directory

4. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase configuration
   ```

5. **Initialize and seed database:**
   ```bash
   python scripts/init_db.py --seed
   ```

6. **Start the server:**
   ```bash
   python server.py
   ```

The API will be available at `http://localhost:8001`

## API Endpoints

### Health Check
- `GET /api/` - Basic API status
- `GET /api/health` - Detailed health check (Firebase, Redis connectivity)

## Project Structure

```
backend/
├── app/
│   ├── __init__.py          # Application factory with Firebase setup
│   ├── models.py            # Firestore data models
│   ├── api/
│   │   ├── __init__.py      # API blueprint
│   │   └── routes.py        # API routes
│   └── services/
│       ├── __init__.py
│       └── cache_service.py # Redis caching service
├── scripts/
│   ├── __init__.py
│   ├── init_db.py          # Firebase initialization
│   └── seed_data.py        # Sample data seeding
├── config.py              # Configuration management
├── server.py              # Application entry point
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variables template
├── FIREBASE_SETUP.md     # Detailed Firebase setup guide
└── firebase-credentials.json  # Firebase service account key (not in git)
```

## Data Models (Firestore Collections)

### families
- Stores intake form data (zip code, child age, budget, availability)
- Document ID: auto-generated UUID

### family_priorities
- Priority values for happiness, success, social, health (0-10 scale)
- Document ID: family_id (for easy lookup)

### kid_traits
- Child personality traits from quiz (0-1 scale)
- Creativity, sociability, outdoors preference, energy, curiosity, kinesthetic learning
- Document ID: family_id (for easy lookup)

### activities
- Available programs and activities
- Location, pricing, age requirements, category
- Document ID: auto-generated UUID

### recommendations
- AI-generated recommendations linking families to activities
- Match scores and explanations
- Document ID: auto-generated UUID

### success_stories
- Curated stories from similar families
- Socioeconomic tags and trait profiles for matching
- Document ID: auto-generated UUID

## Configuration

Environment variables in `.env`:

```bash
# Flask
FLASK_ENV=development
SECRET_KEY=your-secret-key

# Firebase
FIREBASE_CREDENTIALS_PATH=firebase-credentials.json
# OR
FIREBASE_PROJECT_ID=your-firebase-project-id

# Redis (optional)
REDIS_URL=redis://localhost:6379/0

# External APIs
OPENAI_API_KEY=your-key
GOOGLE_MAPS_API_KEY=your-key
```

## Development

### Adding New Models

1. Add model class to `app/models.py` extending `FirestoreModel`
2. Implement required methods: `collection_name()`, `to_dict()`, `from_dict()`
3. Add save/query methods as needed

### Adding New API Routes

1. Add routes to `app/api/routes.py`
2. Import models and use Firestore operations

### Testing Firebase Connection

```bash
# Test Firebase connection
python -c "
from app import create_app, db
app = create_app()
with app.app_context():
    if db:
        print('✓ Firebase connected')
        # Test query
        test_ref = db.collection('health_check').limit(1)
        list(test_ref.stream())
        print('✓ Firestore accessible')
    else:
        print('✗ Firebase not connected')
"
```

## Advantages of Firebase

- **No Database Setup**: No need to install/manage PostgreSQL
- **Real-time Updates**: Built-in real-time synchronization
- **Scalability**: Automatically scales with usage
- **Cross-platform**: Works seamlessly with mobile apps
- **Authentication**: Easy integration with Firebase Auth
- **Offline Support**: Built-in offline capabilities

## Next Steps

This Firebase backend is ready for:
1. Family profile API endpoints (Task 2)
2. LLM integration service (Task 3)
3. Frontend integration (Task 4)
4. Real-time features and offline support
5. Firebase Authentication integration