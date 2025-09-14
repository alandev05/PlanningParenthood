#!/usr/bin/env python3
"""
Test the improved prompt system
"""

import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_prompt_generation():
    """Test the prompt generation"""
    
    print("Testing improved prompt generation...")
    
    try:
        from utils.recommend import AIRecommendationEngine
        
        engine = AIRecommendationEngine()
        
        # Test family profile
        family_profile = {
            'child_age': 5,
            'budget_per_week': 50,
            'parenting_style': 'Hands on',
            'priorities_ranked': ['Health', 'Happiness', 'Success']
        }
        
        # Generate prompt
        prompt = engine._build_recommendation_prompt(family_profile)
        print("Generated prompt:")
        print("=" * 50)
        print(prompt)
        print("=" * 50)
        
        # Test AI call
        print("\nTesting AI call...")
        recommendations = engine._generate_ai_recommendations(family_profile)
        
        if recommendations:
            print(f"✅ AI generated {len(recommendations)} recommendations!")
            for rec in recommendations:
                print(f"- {rec.get('title', 'Unknown')}")
        else:
            print("❌ AI call failed, but fallback should work")
            fallback = engine._get_fallback_recommendations(family_profile)
            print(f"✅ Fallback generated {len(fallback)} recommendations")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_prompt_generation()