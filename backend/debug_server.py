#!/usr/bin/env python3
"""
Debug script to test the recommendation system locally
"""

import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_recommendation_function():
    """Test the recommendation function directly"""
    
    print("Testing recommendation function directly...")
    
    try:
        from utils.recommend import get_recommendations
        
        # Test parameters
        recommendations = get_recommendations(
            budget_per_week=50.0,
            support_available=['Extended family'],
            transport='Car',
            hours_per_week_with_kid=8,
            spouse=True,
            parenting_style='Hands on',
            number_of_kids=1,
            child_age=5,
            area_type='Urban',
            priorities_ranked=['Health', 'Happiness', 'Success', 'Social']
        )
        
        print(f"✅ Function returned {len(recommendations)} recommendations")
        
        for i, rec in enumerate(recommendations, 1):
            print(f"\n{i}. {rec.get('title', 'Unknown')}")
            print(f"   Category: {rec.get('category', 'Unknown')}")
            print(f"   Price: ${rec.get('price_monthly', 0)}/month")
            print(f"   Match Score: {rec.get('match_score', 0)}")
            print(f"   Explanation: {rec.get('ai_explanation', 'No explanation')}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing function: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_anthropic_service():
    """Test the Anthropic service directly"""
    
    print("\nTesting Anthropic service...")
    
    try:
        from anthropic_service import AnthropicService
        
        service = AnthropicService()
        result = service.interpret_search("test query")
        
        if result and result != "Looking for inspiring people...":
            print(f"✅ Anthropic service working: {result[:100]}...")
            return True
        else:
            print(f"❌ Anthropic service returned fallback: {result}")
            return False
            
    except Exception as e:
        print(f"❌ Anthropic service error: {e}")
        return False

if __name__ == "__main__":
    print("=== Debugging Recommendation System ===")
    
    # Check API key
    api_key = os.getenv('ANTHROPIC_API_KEY')
    if api_key:
        print(f"✅ API Key found: {api_key[:10]}...")
    else:
        print("❌ No API key found")
    
    # Test Anthropic service
    anthropic_works = test_anthropic_service()
    
    # Test recommendation function
    function_works = test_recommendation_function()
    
    print(f"\n=== Results ===")
    print(f"Anthropic Service: {'✅ Working' if anthropic_works else '❌ Failed'}")
    print(f"Recommendation Function: {'✅ Working' if function_works else '❌ Failed'}")
    
    if function_works:
        print("\n✅ The recommendation system should work!")
        print("Try starting the server with: python3 server.py")
    else:
        print("\n❌ There are issues with the recommendation system")