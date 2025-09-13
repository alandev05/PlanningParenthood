# Firebase Setup Guide

This guide will help you set up Firebase Firestore for the Parenting Recommendations backend.

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `parenting-recommendations` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Firestore Database

1. In your Firebase project console, click "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (choose closest to your users)
5. Click "Done"

## 3. Get Service Account Credentials

### Option A: Service Account Key (Recommended for Development)

1. Go to Project Settings (gear icon) → "Service accounts"
2. Click "Generate new private key"
3. Download the JSON file
4. Rename it to `firebase-credentials.json`
5. Place it in your `backend/` directory
6. **Important**: Add `firebase-credentials.json` to your `.gitignore`

### Option B: Project ID (For Production/Deployed Environments)

1. Go to Project Settings → "General"
2. Copy your "Project ID"
3. Set `FIREBASE_PROJECT_ID=your-project-id` in your `.env` file

## 4. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env file with your Firebase configuration
# If using service account key:
FIREBASE_CREDENTIALS_PATH=firebase-credentials.json

# If using project ID:
# FIREBASE_PROJECT_ID=your-firebase-project-id
```

## 5. Install Dependencies and Initialize

```bash
# Install Python dependencies
pip install -r requirements.txt

# Test Firebase connection and seed data
python scripts/init_db.py --seed
```

## 6. Firestore Security Rules (Optional)

For development, you can use test mode rules. For production, update your Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents
    // TODO: Add proper authentication rules
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 7. Test the Setup

```bash
# Start the server
python server.py

# Test the API
curl http://localhost:8001/api/health
```

You should see:
```json
{
  "api": "healthy",
  "firebase": "healthy",
  "redis": "healthy" // or "not configured"
}
```

## Troubleshooting

### "Firebase not initialized" Error
- Make sure `firebase-credentials.json` exists in the backend directory
- Check that the file contains valid JSON
- Verify your Firebase project has Firestore enabled

### "Permission denied" Error
- Make sure Firestore is in "test mode" or update security rules
- Check that your service account has the right permissions

### "Module not found" Error
- Make sure you installed dependencies: `pip install -r requirements.txt`
- Check that you're in the correct virtual environment

## Firebase Collections Structure

The app will create these collections automatically:

- `families` - Family profiles and intake data
- `family_priorities` - Priority values (happiness, success, social, health)
- `kid_traits` - Child personality traits from quiz
- `activities` - Available programs and activities
- `recommendations` - AI-generated recommendations
- `success_stories` - Curated success stories

## Next Steps

Once Firebase is set up, you can:
1. Start implementing API endpoints (Task 2)
2. Add authentication (Firebase Auth)
3. Set up proper security rules
4. Deploy to production with Firebase Hosting