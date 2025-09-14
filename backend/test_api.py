#!/usr/bin/env python3
"""
Test script to verify the new API endpoints work correctly
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8001"

def test_api_endpoints():
    """Test all the new API endpoints"""
    print("🧪 Testing API Endpoints")
    print("=" * 40)
    
    # Test 1: Health check
    print("\n1. Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False
    
    # Test 2: Create family
    print("\n2. Testing create family...")
    family_data = {
        "zip_code": "02139",
        "child_age": 8,
        "budget": 200,
        "availability": "weekend"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/family",
            json=family_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 201:
            data = response.json()
            family_id = data.get("family_id")
            print(f"✅ Family created: {family_id}")
        else:
            print(f"❌ Create family failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Create family error: {e}")
        return False
    
    # Test 3: Save family priorities
    print("\n3. Testing save family priorities...")
    priorities_data = {
        "happiness": 8.5,
        "success": 7.0,
        "social": 9.0,
        "health": 8.0
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/family/{family_id}/priorities",
            json=priorities_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Priorities saved: {data.get('message')}")
        else:
            print(f"❌ Save priorities failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Save priorities error: {e}")
        return False
    
    # Test 4: Save kid traits
    print("\n4. Testing save kid traits...")
    traits_data = {
        "creativity": 0.8,
        "sociability": 0.6,
        "outdoors": 0.7,
        "energy": 0.9,
        "curiosity": 0.8,
        "kinesthetic": 0.7
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/family/{family_id}/traits",
            json=traits_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Traits saved: {data.get('message')}")
        else:
            print(f"❌ Save traits failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Save traits error: {e}")
        return False
    
    # Test 5: Get recommendations
    print("\n5. Testing get recommendations...")
    try:
        response = requests.get(f"{BASE_URL}/api/recommendations?family_id={family_id}")
        
        if response.status_code == 200:
            data = response.json()
            recommendations = data.get("recommendations", [])
            print(f"✅ Got {len(recommendations)} recommendations")
            
            if recommendations:
                print("   Sample recommendation:")
                rec = recommendations[0]
                print(f"   - {rec['title']} (Match: {rec['match_score']})")
                print(f"   - {rec['ai_explanation']}")
        else:
            print(f"❌ Get recommendations failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Get recommendations error: {e}")
        return False
    
    print("\n🎉 All API tests passed!")
    return True

if __name__ == "__main__":
    print("Make sure the Flask server is running on http://localhost:8001")
    print("Run: python server.py")
    print()
    
    success = test_api_endpoints()
    
    if success:
        print("\n✅ API endpoints are working correctly!")
        print("\nNext steps:")
        print("1. Test the frontend integration")
        print("2. Add more sophisticated recommendation logic")
        print("3. Add authentication and user management")
    else:
        print("\n❌ API testing failed. Check your server and database setup.")
        sys.exit(1)
