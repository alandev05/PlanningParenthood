#!/usr/bin/env python3
"""
Test script to verify the kid traits flow works end-to-end
"""

import requests
import json
import time

def test_kid_traits_flow():
    """Test the complete kid traits flow"""
    
    base_url = "http://localhost:8001"
    family_id = f"test_family_{int(time.time())}"
    
    print(f"🧪 Testing kid traits flow with family_id: {family_id}")
    
    # Step 1: Save kid traits
    print("\n1️⃣ Saving kid traits...")
    kid_traits = {
        "creativity": 0.8,
        "sociability": 0.6, 
        "outdoors": 0.7,
        "energy": 0.9,
        "curiosity": 0.8,
        "kinesthetic": 0.5
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/family/{family_id}/traits",
            json=kid_traits,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            print("✅ Kid traits saved successfully")
        else:
            print(f"❌ Failed to save kid traits: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error saving kid traits: {e}")
        return False
    
    # Step 2: Get recommendations with family_id
    print("\n2️⃣ Getting recommendations with kid traits...")
    
    params = {
        'family_id': family_id,
        'budget_per_week_usd': 50,
        'child_age': 6,
        'support_available': ['Spouse/partner'],
        'transport': 'Car',
        'hours_per_week_with_kid': 5,
        'spouse': 'true',
        'parenting_style': 'Balanced',
        'number_of_kids': 1,
        'area_type': 'Suburb',
        'priorities_ranked': ['Social', 'Emotional', 'Physical', 'Cognitive']
    }
    
    try:
        response = requests.get(f"{base_url}/api/recommend", params=params)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Recommendations retrieved successfully")
            print(f"📊 Parameters received: {data.get('parameters_received', {})}")
            print(f"🎯 Kid traits used: {data.get('parameters_received', {}).get('kid_traits_used', False)}")
            
            # Check if recommendations contain the new format
            recommendations = data.get('recommendations', {})
            if isinstance(recommendations, dict) and 'cognitive' in recommendations:
                print("✅ New comprehensive format detected")
                print(f"🧠 Cognitive advice: {recommendations['cognitive'].get('parenting_advice', 'N/A')[:100]}...")
            else:
                print("⚠️ Old format detected - may need to check AI response parsing")
                
            return True
        else:
            print(f"❌ Failed to get recommendations: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error getting recommendations: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting kid traits flow test...")
    success = test_kid_traits_flow()
    
    if success:
        print("\n🎉 Test completed successfully!")
    else:
        print("\n💥 Test failed!")
