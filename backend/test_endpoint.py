#!/usr/bin/env python3
"""
Test the recommendation endpoint with AI integration
"""

import requests
import json

def test_recommendation_endpoint():
    """Test the /api/recommend endpoint with AI integration"""
    
    # Test parameters
    params = {
        'budget_per_week_usd': 50,
        'support_available': ['Extended family'],
        'transport': 'Car',
        'hours_per_week_with_kid': 8,
        'spouse': True,
        'parenting_style': 'Hands on',
        'number_of_kids': 1,
        'child_age': 5,
        'area_type': 'Urban',
        'priorities_ranked': ['Health', 'Happiness', 'Success', 'Social']
    }
    
    try:
        print("Testing AI recommendation endpoint...")
        print(f"Parameters: {params}")
        
        # Make request to local server
        response = requests.get('http://localhost:8001/api/recommend', params=params)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Got {len(data.get('recommendations', []))} recommendations")
            
            for i, rec in enumerate(data.get('recommendations', []), 1):
                print(f"\n{i}. {rec.get('title', 'Unknown')}")
                print(f"   Category: {rec.get('category', 'Unknown')}")
                print(f"   Match Score: {rec.get('match_score', 0)}")
                print(f"   Explanation: {rec.get('ai_explanation', 'No explanation')}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure the Flask server is running on port 8001")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_recommendation_endpoint()