#!/usr/bin/env python3
"""
Test script for the new recommendation engine
"""

import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

from utils.recommend import get_recommendations

def test_recommendation_engine():
    """Test the recommendation engine with sample data"""
    print("🧠 Testing Recommendation Engine")
    print("=" * 40)
    
    # Test case 1: Budget-conscious family with young child
    print("\n1. Testing budget-conscious family with 5-year-old...")
    recommendations = get_recommendations(
        budget_per_week=30.0,
        support_available=["Spouse/partner"],
        transport="Car",
        hours_per_week_with_kid=8,
        spouse=True,
        parenting_style="Balanced",
        number_of_kids=1,
        child_age=5,
        area_type="Suburb",
        priorities_ranked=["Social", "Physical", "Cognitive", "Emotional"]
    )
    
    print(f"✅ Generated {len(recommendations)} recommendations:")
    for i, rec in enumerate(recommendations, 1):
        print(f"   {i}. {rec['title']} - {rec['match_score']:.2f} match")
        print(f"      {rec['ai_explanation']}")
        print(f"      ${rec['price_monthly']}/month" if rec['price_monthly'] else "Free")
        print()
    
    # Test case 2: High-budget family with older child
    print("\n2. Testing high-budget family with 10-year-old...")
    recommendations = get_recommendations(
        budget_per_week=100.0,
        support_available=["Extended family", "Carpool friends"],
        transport="Car",
        hours_per_week_with_kid=15,
        spouse=True,
        parenting_style="Hands on",
        number_of_kids=2,
        child_age=10,
        area_type="Urban",
        priorities_ranked=["Cognitive", "Physical", "Social", "Emotional"]
    )
    
    print(f"✅ Generated {len(recommendations)} recommendations:")
    for i, rec in enumerate(recommendations, 1):
        print(f"   {i}. {rec['title']} - {rec['match_score']:.2f} match")
        print(f"      {rec['ai_explanation']}")
        print(f"      ${rec['price_monthly']}/month" if rec['price_monthly'] else "Free")
        print()
    
    # Test case 3: Single parent with limited budget
    print("\n3. Testing single parent with limited budget...")
    recommendations = get_recommendations(
        budget_per_week=20.0,
        support_available=["None"],
        transport="Public transit",
        hours_per_week_with_kid=5,
        spouse=False,
        parenting_style="Hands off",
        number_of_kids=1,
        child_age=6,
        area_type="Urban",
        priorities_ranked=["Emotional", "Social", "Physical", "Cognitive"]
    )
    
    print(f"✅ Generated {len(recommendations)} recommendations:")
    for i, rec in enumerate(recommendations, 1):
        print(f"   {i}. {rec['title']} - {rec['match_score']:.2f} match")
        print(f"      {rec['ai_explanation']}")
        print(f"      ${rec['price_monthly']}/month" if rec['price_monthly'] else "Free")
        print()
    
    print("🎉 Recommendation engine testing complete!")
    return True

if __name__ == "__main__":
    success = test_recommendation_engine()
    
    if success:
        print("\n✅ Recommendation engine is working correctly!")
        print("\nNext steps:")
        print("1. Test the full API endpoint: python test_api.py")
        print("2. Test with the frontend integration")
        print("3. Add more sophisticated matching algorithms")
    else:
        print("\n❌ Recommendation engine testing failed.")
        sys.exit(1)
