#!/usr/bin/env python3
"""
Simple test script to verify Firebase connection and upload test data
"""

import sys
import os
from datetime import datetime

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app
import app as app_module
from app.models import Family, FamilyPriorities, KidTraits, Activity

def test_firebase_connection():
    """Test basic Firebase connection"""
    print("🔥 Testing Firebase Connection")
    print("=" * 40)
    
    # Create Flask app
    app = create_app()
    
    with app.app_context():
        # Check if Firebase is initialized
        if not app_module.db:
            print("❌ Firebase not initialized")
            return False
        
        print("✅ Firebase client initialized")
        
        try:
            # Test 1: Create a simple test document
            print("\n📝 Test 1: Creating test document...")
            test_ref = app_module.db.collection('test').document('connection_test')
            test_data = {
                'message': 'Hello Firebase!',
                'timestamp': datetime.utcnow(),
                'test_number': 42
            }
            test_ref.set(test_data)
            print("✅ Test document created successfully")
            
            # Test 2: Read the document back
            print("\n📖 Test 2: Reading test document...")
            doc = test_ref.get()
            if doc.exists:
                data = doc.to_dict()
                print(f"✅ Document read successfully: {data['message']}")
            else:
                print("❌ Document not found")
                return False
            
            # Test 3: Create a family profile
            print("\n👨‍👩‍👧‍👦 Test 3: Creating family profile...")
            family = Family()
            family.zip_code = "02101"
            family.child_age = 6
            family.budget = 200
            family.availability = "weekend"
            
            family_id = family.save()
            print(f"✅ Family profile created with ID: {family_id}")
            
            # Test 4: Create family priorities
            print("\n🎯 Test 4: Creating family priorities...")
            priorities = FamilyPriorities()
            priorities.family_id = family_id
            priorities.happiness = 8.5
            priorities.success = 7.0
            priorities.social = 9.0
            priorities.health = 8.0
            
            priorities.save()
            print("✅ Family priorities saved")
            
            # Test 5: Create kid traits
            print("\n🧒 Test 5: Creating kid traits...")
            traits = KidTraits()
            traits.family_id = family_id
            traits.creativity = 0.8
            traits.sociability = 0.6
            traits.outdoors = 0.7
            traits.energy = 0.9
            traits.curiosity = 0.8
            traits.kinesthetic = 0.7
            
            traits.save()
            print("✅ Kid traits saved")
            
            # Test 6: Create an activity
            print("\n⚽ Test 6: Creating activity...")
            activity = Activity()
            activity.title = "Test Soccer Club"
            activity.description = "A fun soccer program for kids"
            activity.category = "physical"
            activity.price_monthly = 75
            activity.age_min = 5
            activity.age_max = 10
            activity.address = "123 Test St, Boston, MA"
            activity.phone = "(555) 123-4567"
            
            activity_id = activity.save()
            print(f"✅ Activity created with ID: {activity_id}")
            
            # Test 7: Read back the family profile
            print("\n🔍 Test 7: Reading back family profile...")
            retrieved_family = Family.get(family_id)
            if retrieved_family:
                print(f"✅ Family retrieved: {retrieved_family.zip_code}, child age {retrieved_family.child_age}")
            else:
                print("❌ Could not retrieve family")
                return False
            
            # Test 8: Read back priorities and traits
            print("\n📊 Test 8: Reading back priorities and traits...")
            retrieved_priorities = FamilyPriorities.get_by_family(family_id)
            retrieved_traits = KidTraits.get_by_family(family_id)
            
            if retrieved_priorities:
                print(f"✅ Priorities retrieved: happiness={retrieved_priorities.happiness}")
            else:
                print("❌ Could not retrieve priorities")
            
            if retrieved_traits:
                print(f"✅ Traits retrieved: creativity={retrieved_traits.creativity}")
            else:
                print("❌ Could not retrieve traits")
            
            # Test 9: List all activities
            print("\n📋 Test 9: Listing activities...")
            activities = Activity.get_all()
            print(f"✅ Found {len(activities)} activities")
            for act in activities[:3]:  # Show first 3
                print(f"   - {act.title} (${act.price_monthly}/month)")
            
            print("\n🎉 All tests passed! Firebase is working correctly.")
            return True
            
        except Exception as e:
            print(f"❌ Error during testing: {e}")
            import traceback
            traceback.print_exc()
            return False

if __name__ == '__main__':
    success = test_firebase_connection()
    
    if success:
        print("\n✅ Firebase database is ready for use!")
        print("\nNext steps:")
        print("1. Start the Flask server: python server.py")
        print("2. Test API endpoints: curl http://localhost:8001/api/health")
    else:
        print("\n❌ Firebase testing failed. Check your setup.")
        sys.exit(1)