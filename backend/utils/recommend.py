"""
Recommendation engine for parenting activities based on family profile and preferences
"""

from typing import List, Dict, Any, Optional
import random

class RecommendationEngine:
    """Main recommendation engine class"""
    
    def __init__(self):
        self.activities = self._get_sample_activities()
    
    def _get_sample_activities(self) -> List[Dict[str, Any]]:
        """Get sample activities - in production, this would come from Firebase"""
        return [
            {
                "id": "act_1",
                "title": "Little Kickers Soccer",
                "description": "Fun soccer program for young children focusing on basic skills and teamwork",
                "category": "physical",
                "price_monthly": 75,
                "age_min": 3,
                "age_max": 8,
                "latitude": 42.3601,
                "longitude": -71.0589,
                "address": "123 Main St, Boston, MA 02101",
                "phone": "(617) 555-0123",
                "website": "https://littlekickers.com",
                "traits": ["energy", "sociability"],  # What traits this activity develops
                "priority_boost": ["health", "social"]  # Which priorities this activity supports
            },
            {
                "id": "act_2",
                "title": "Creative Arts Workshop",
                "description": "Hands-on art classes encouraging creativity and self-expression",
                "category": "cognitive",
                "price_monthly": 60,
                "age_min": 4,
                "age_max": 12,
                "latitude": 42.3584,
                "longitude": -71.0598,
                "address": "456 Art Ave, Boston, MA 02102",
                "phone": "(617) 555-0456",
                "website": "https://creativearts.com",
                "traits": ["creativity", "kinesthetic"],
                "priority_boost": ["success", "happiness"]
            },
            {
                "id": "act_3",
                "title": "Library Story Time",
                "description": "Free weekly story sessions promoting reading and social interaction",
                "category": "social",
                "price_monthly": None,  # Free
                "age_min": 2,
                "age_max": 6,
                "latitude": 42.3555,
                "longitude": -71.0625,
                "address": "789 Library Ln, Boston, MA 02103",
                "phone": "(617) 555-0789",
                "website": "https://bostonlibrary.org",
                "traits": ["curiosity", "sociability"],
                "priority_boost": ["social", "success"]
            },
            {
                "id": "act_4",
                "title": "Mindful Kids Yoga",
                "description": "Gentle yoga and mindfulness practices for emotional regulation",
                "category": "emotional",
                "price_monthly": 45,
                "age_min": 5,
                "age_max": 10,
                "latitude": 42.3612,
                "longitude": -71.0570,
                "address": "321 Zen Way, Boston, MA 02104",
                "phone": "(617) 555-0321",
                "website": "https://mindfulkids.com",
                "traits": ["curiosity", "energy"],
                "priority_boost": ["happiness", "health"]
            },
            {
                "id": "act_5",
                "title": "Community Garden Club",
                "description": "Learn about nature and responsibility through gardening activities",
                "category": "physical",
                "price_monthly": 25,
                "age_min": 6,
                "age_max": 14,
                "latitude": 42.3590,
                "longitude": -71.0610,
                "address": "654 Garden St, Boston, MA 02105",
                "phone": "(617) 555-0654",
                "website": "https://communitygardens.org",
                "traits": ["outdoors", "curiosity"],
                "priority_boost": ["health", "happiness"]
            },
            {
                "id": "act_6",
                "title": "STEM Robotics Club",
                "description": "Build robots and learn programming in a collaborative environment",
                "category": "cognitive",
                "price_monthly": 90,
                "age_min": 8,
                "age_max": 16,
                "latitude": 42.3620,
                "longitude": -71.0550,
                "address": "987 Tech Blvd, Boston, MA 02106",
                "phone": "(617) 555-0987",
                "website": "https://stemrobotics.com",
                "traits": ["creativity", "curiosity"],
                "priority_boost": ["success", "happiness"]
            }
        ]
    
    def get_recommendations(self, 
                          budget_per_week: float,
                          support_available: List[str],
                          transport: str,
                          hours_per_week_with_kid: int,
                          spouse: bool,
                          parenting_style: str,
                          number_of_kids: int,
                          child_age: int,
                          area_type: str,
                          priorities_ranked: List[str]) -> List[Dict[str, Any]]:
        """
        Generate personalized recommendations based on family profile
        
        Args:
            budget_per_week: Weekly budget in USD
            support_available: List of support options
            transport: Transportation method
            hours_per_week_with_kid: Hours per week available
            spouse: Whether has spouse/partner
            parenting_style: Parenting approach
            number_of_kids: Number of children
            child_age: Age of child
            area_type: Urban/Suburban/Rural
            priorities_ranked: List of priorities in order of importance
            
        Returns:
            List of recommended activities with match scores
        """
        
        # Filter activities by age
        age_appropriate = [
            activity for activity in self.activities
            if activity["age_min"] <= child_age <= activity["age_max"]
        ]
        
        if not age_appropriate:
            return []
        
        # Calculate match scores for each activity
        scored_activities = []
        for activity in age_appropriate:
            match_score = self._calculate_match_score(
                activity, budget_per_week, support_available, transport,
                hours_per_week_with_kid, spouse, parenting_style,
                number_of_kids, child_age, area_type, priorities_ranked
            )
            
            if match_score > 0.3:  # Only include activities with decent match
                activity_copy = activity.copy()
                activity_copy["match_score"] = round(match_score, 2)
                activity_copy["ai_explanation"] = self._generate_explanation(
                    activity, match_score, child_age, parenting_style, 
                    budget_per_week, priorities_ranked
                )
                scored_activities.append(activity_copy)
        
        # Sort by match score (highest first)
        scored_activities.sort(key=lambda x: x["match_score"], reverse=True)
        
        # Return top 5 recommendations
        return scored_activities[:5]
    
    def _calculate_match_score(self, activity: Dict[str, Any], 
                             budget_per_week: float,
                             support_available: List[str],
                             transport: str,
                             hours_per_week_with_kid: int,
                             spouse: bool,
                             parenting_style: str,
                             number_of_kids: int,
                             child_age: int,
                             area_type: str,
                             priorities_ranked: List[str]) -> float:
        """Calculate match score for a specific activity"""
        
        score = 0.0
        
        # Budget compatibility (40% weight)
        monthly_budget = budget_per_week * 4
        if activity["price_monthly"] is None:  # Free activity
            score += 0.4
        elif activity["price_monthly"] <= monthly_budget * 0.5:
            score += 0.4
        elif activity["price_monthly"] <= monthly_budget:
            score += 0.3
        elif activity["price_monthly"] <= monthly_budget * 1.5:
            score += 0.2
        else:
            score += 0.1
        
        # Priority alignment (30% weight)
        priority_score = 0.0
        for i, priority in enumerate(priorities_ranked):
            if priority.lower() in [p.lower() for p in activity.get("priority_boost", [])]:
                # Higher priority = higher score
                priority_score += (len(priorities_ranked) - i) / len(priorities_ranked)
        
        score += (priority_score / len(priorities_ranked)) * 0.3
        
        # Parenting style compatibility (15% weight)
        if parenting_style == "Hands on" and activity["category"] in ["cognitive", "physical"]:
            score += 0.15
        elif parenting_style == "Hands off" and activity["category"] in ["social", "emotional"]:
            score += 0.15
        elif parenting_style == "Balanced":
            score += 0.1
        
        # Support system compatibility (10% weight)
        if "Extended family" in support_available and activity["price_monthly"] and activity["price_monthly"] > 50:
            score += 0.1  # More expensive activities benefit from family support
        elif "None" in support_available and activity["price_monthly"] is None:
            score += 0.1  # Free activities good for limited support
        
        # Time availability (5% weight)
        if hours_per_week_with_kid >= 10 and activity["category"] in ["physical", "cognitive"]:
            score += 0.05  # More time allows for intensive activities
        
        return min(score, 1.0)  # Cap at 1.0
    
    def _generate_explanation(self, activity: Dict[str, Any], match_score: float,
                            child_age: int, parenting_style: str, 
                            budget_per_week: float, priorities_ranked: List[str]) -> str:
        """Generate AI explanation for why this activity is recommended"""
        
        explanations = []
        
        # Budget explanation
        if activity["price_monthly"] is None:
            explanations.append("This free activity fits your budget perfectly")
        elif activity["price_monthly"] <= budget_per_week * 4:
            explanations.append(f"At ${activity['price_monthly']}/month, this fits your ${budget_per_week}/week budget")
        
        # Age explanation
        explanations.append(f"Perfect for your {child_age}-year-old child")
        
        # Priority explanation
        top_priority = priorities_ranked[0].lower() if priorities_ranked else ""
        if top_priority in [p.lower() for p in activity.get("priority_boost", [])]:
            explanations.append(f"Supports your top priority: {priorities_ranked[0]}")
        
        # Parenting style explanation
        if parenting_style == "Hands on" and activity["category"] in ["cognitive", "physical"]:
            explanations.append("Great for hands-on parents who want to be involved")
        elif parenting_style == "Hands off" and activity["category"] in ["social", "emotional"]:
            explanations.append("Perfect for parents who prefer to let kids explore independently")
        
        # Category explanation
        category_descriptions = {
            "physical": "Promotes physical health and motor skills",
            "cognitive": "Develops thinking and problem-solving abilities", 
            "social": "Builds social skills and friendships",
            "emotional": "Supports emotional regulation and mindfulness"
        }
        
        if activity["category"] in category_descriptions:
            explanations.append(category_descriptions[activity["category"]])
        
        return ". ".join(explanations) + "."


def get_recommendations(budget_per_week: float,
                       support_available: List[str],
                       transport: str,
                       hours_per_week_with_kid: int,
                       spouse: bool,
                       parenting_style: str,
                       number_of_kids: int,
                       child_age: int,
                       area_type: str,
                       priorities_ranked: List[str]) -> List[Dict[str, Any]]:
    """
    Main function to get recommendations - called from server.py
    
    Returns list of recommended activities with match scores and explanations
    """
    
    engine = RecommendationEngine()
    return engine.get_recommendations(
        budget_per_week=budget_per_week,
        support_available=support_available,
        transport=transport,
        hours_per_week_with_kid=hours_per_week_with_kid,
        spouse=spouse,
        parenting_style=parenting_style,
        number_of_kids=number_of_kids,
        child_age=child_age,
        area_type=area_type,
        priorities_ranked=priorities_ranked
    )
