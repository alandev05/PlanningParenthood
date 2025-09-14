"""
AI-powered recommendation engine for parenting activities based on family profile and preferences
"""

from typing import List, Dict, Any, Optional
import json
import logging
from anthropic_service import AnthropicService
from dotenv import load_dotenv

load_dotenv()
# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIRecommendationEngine:
    """AI-powered recommendation engine using Anthropic API"""
    
    def __init__(self):
        self.anthropic_service = AnthropicService()
    
    def _generate_ai_recommendations(self, family_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate AI-powered activity recommendations based on family profile"""
        
        prompt = self._build_recommendation_prompt(family_profile)
        
        try:
            response = self.anthropic_service.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1500,
                messages=[{
                    "role": "user",
                    "content": prompt
                }]
            )
            
            # Parse the AI response
            content = response.content[0].text
            logger.info(f"AI Response: {content}")
            
            # Extract JSON from response
            recommendations = self._parse_ai_response(content)
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating AI recommendations: {e}")
            # Return empty list on error - will be handled by calling function
            return []
    
    def _build_recommendation_prompt(self, family_profile: Dict[str, Any]) -> str:
        """Build a comprehensive prompt for AI recommendation generation across four development categories"""
        
        child_age = family_profile.get('child_age', 5)
        budget = family_profile.get('budget_per_week', 50)
        style = family_profile.get('parenting_style', 'Balanced')
        priorities = family_profile.get('priorities_ranked', ['Health', 'Happiness'])
        hours_available = family_profile.get('hours_per_week_with_kid', 8)
        support = family_profile.get('support_available', [])
        transport = family_profile.get('transport', 'Car')
        
        return f"""You are an expert child development specialist. Create personalized recommendations across EXACTLY 4 development categories for this family:

FAMILY PROFILE:
- Child: {child_age} years old
- Budget: ${budget}/week (${budget*4}/month)
- Style: {style} parenting
- Time: {hours_available} hours/week available
- Support: {', '.join(support) if support else 'Limited'}
- Transport: {transport}
- Priorities: {', '.join(priorities[:3])}

Create EXACTLY 4 recommendations - one for each category:

1. PHYSICAL DEVELOPMENT: Activities for motor skills, health, and physical growth
2. COGNITIVE DEVELOPMENT: Activities for learning, problem-solving, and intellectual growth  
3. EMOTIONAL DEVELOPMENT: Activities for emotional regulation, confidence, and self-awareness
4. SOCIAL DEVELOPMENT: Activities for communication, relationships, and social skills

For each category, consider:
- Age-appropriate developmental milestones for {child_age}-year-olds
- Family's {style.lower()} parenting approach
- Budget constraint of ${budget*4}/month per activity
- {hours_available} hours/week time availability
- Their priority focus on {priorities[0] if priorities else 'balanced development'}

Respond with ONLY this JSON format:
[
  {{
    "id": "physical_rec",
    "title": "Specific Activity Name",
    "description": "Detailed description focusing on physical development benefits",
    "category": "physical",
    "price_monthly": 30,
    "age_min": {max(2, child_age-2)},
    "age_max": {child_age+3},
    "match_score": 0.9,
    "ai_explanation": "Why this physical activity perfectly fits your {style.lower()} style and {child_age}-year-old's needs",
    "practical_tips": "Specific implementation advice for your family situation",
    "developmental_benefits": "How this supports physical milestones for {child_age}-year-olds"
  }},
  {{
    "id": "cognitive_rec", 
    "title": "Learning Activity Name",
    "description": "Detailed description focusing on cognitive development benefits",
    "category": "cognitive",
    "price_monthly": 25,
    "age_min": {max(2, child_age-2)},
    "age_max": {child_age+3},
    "match_score": 0.85,
    "ai_explanation": "Why this cognitive activity matches your priorities and child's learning stage",
    "practical_tips": "How to implement this within your {hours_available} hours/week",
    "developmental_benefits": "How this builds thinking skills for {child_age}-year-olds"
  }},
  {{
    "id": "emotional_rec",
    "title": "Emotional Growth Activity",
    "description": "Detailed description focusing on emotional development benefits", 
    "category": "emotional",
    "price_monthly": 20,
    "age_min": {max(2, child_age-2)},
    "age_max": {child_age+3},
    "match_score": 0.8,
    "ai_explanation": "Why this emotional activity supports your child's confidence and self-regulation",
    "practical_tips": "How to adapt this for your {style.lower()} parenting approach",
    "developmental_benefits": "How this builds emotional intelligence for {child_age}-year-olds"
  }},
  {{
    "id": "social_rec",
    "title": "Social Skills Activity", 
    "description": "Detailed description focusing on social development benefits",
    "category": "social",
    "price_monthly": 35,
    "age_min": {max(2, child_age-2)},
    "age_max": {child_age+3},
    "match_score": 0.88,
    "ai_explanation": "Why this social activity builds communication and friendship skills",
    "practical_tips": "How to use your {transport.lower()} transportation for this activity",
    "developmental_benefits": "How this develops social confidence for {child_age}-year-olds"
  }}
]

Make each recommendation specific, actionable, and perfectly tailored to this family's unique situation."""
    
    def _parse_ai_response(self, content: str) -> List[Dict[str, Any]]:
        """Parse AI response and extract recommendations"""
        try:
            # Try to find JSON in the response
            start_idx = content.find('[')
            end_idx = content.rfind(']') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_str = content[start_idx:end_idx]
                recommendations = json.loads(json_str)
                
                # Validate and clean up the recommendations
                cleaned_recommendations = []
                for i, rec in enumerate(recommendations):
                    if isinstance(rec, dict):
                        # Ensure required fields exist and match frontend expectations
                        cleaned_rec = {
                            "activity_id": rec.get("id", f"ai_rec_{i+1}"),  # Frontend expects activity_id
                            "id": rec.get("id", f"ai_rec_{i+1}"),  # Keep both for compatibility
                            "title": rec.get("title", "AI Generated Activity"),
                            "description": rec.get("description", "Personalized activity recommendation"),
                            "category": rec.get("category", "general"),
                            "price_monthly": rec.get("price_monthly", 0),
                            "age_min": rec.get("age_min", 0),
                            "age_max": rec.get("age_max", 18),
                            "match_score": float(rec.get("match_score", 0.8)),
                            "ai_explanation": rec.get("ai_explanation", "This activity matches your family's needs"),
                            "practical_tips": rec.get("practical_tips", ""),
                            # Add fields expected by frontend
                            "address": "Local area",  # Placeholder
                            "phone": "Contact for details",  # Placeholder
                            "website": "",  # Placeholder
                            "latitude": 42.3601,  # Default Boston coordinates
                            "longitude": -71.0589  # Default Boston coordinates
                        }
                        cleaned_recommendations.append(cleaned_rec)
                
                return cleaned_recommendations
            else:
                logger.error("No JSON array found in AI response")
                return []
                
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response as JSON: {e}")
            return []
        except Exception as e:
            logger.error(f"Error parsing AI response: {e}")
            return []
    
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
        Generate AI-powered personalized recommendations based on family profile
        
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
            List of AI-generated recommended activities with match scores
        """
        
        # Build family profile for AI
        family_profile = {
            "budget_per_week": budget_per_week,
            "support_available": support_available,
            "transport": transport,
            "hours_per_week_with_kid": hours_per_week_with_kid,
            "spouse": spouse,
            "parenting_style": parenting_style,
            "number_of_kids": number_of_kids,
            "child_age": child_age,
            "area_type": area_type,
            "priorities_ranked": priorities_ranked
        }
        
        logger.info(f"Generating AI recommendations for family profile: {family_profile}")
        
        # Generate AI recommendations
        ai_recommendations = self._generate_ai_recommendations(family_profile)
        
        if not ai_recommendations:
            logger.warning("AI recommendation generation failed, using fallback recommendations")
            return self._get_fallback_recommendations(family_profile)
        
        # Sort by match score (highest first) and return top 5
        ai_recommendations.sort(key=lambda x: x.get("match_score", 0), reverse=True)
        return ai_recommendations[:5]
    
    def _get_fallback_recommendations(self, family_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Provide fallback recommendations when AI fails"""
        
        child_age = family_profile.get('child_age', 5)
        budget = family_profile.get('budget_per_week', 50)
        
        fallback_recs = [
            {
                "activity_id": "fallback_1",
                "id": "fallback_1",
                "title": "Family Nature Walks",
                "description": f"Regular outdoor walks perfect for {child_age}-year-olds to explore nature and stay active",
                "category": "physical",
                "price_monthly": 0,
                "age_min": 2,
                "age_max": 12,
                "match_score": 0.8,
                "ai_explanation": f"Free activity that fits any budget and promotes physical health for your {child_age}-year-old",
                "practical_tips": "Start with 15-20 minute walks and gradually increase duration",
                "address": "Your neighborhood",
                "phone": "No phone needed",
                "website": "",
                "latitude": 42.3601,
                "longitude": -71.0589
            },
            {
                "activity_id": "fallback_2",
                "id": "fallback_2", 
                "title": "Home Reading Time",
                "description": "Daily reading sessions to build language skills and parent-child bonding",
                "category": "cognitive",
                "price_monthly": 0,
                "age_min": 1,
                "age_max": 10,
                "match_score": 0.85,
                "ai_explanation": "Perfect for cognitive development and fits within any budget",
                "practical_tips": "Set aside 15-30 minutes daily for reading together",
                "address": "At home",
                "phone": "No phone needed",
                "website": "",
                "latitude": 42.3601,
                "longitude": -71.0589
            },
            {
                "activity_id": "fallback_3",
                "id": "fallback_3",
                "title": "Creative Art Projects",
                "description": "Simple art activities using household materials to encourage creativity",
                "category": "emotional",
                "price_monthly": 10,
                "age_min": 3,
                "age_max": 12,
                "match_score": 0.75,
                "ai_explanation": f"Low-cost creative outlet perfect for your ${budget}/week budget",
                "practical_tips": "Use paper, crayons, and household items for endless creativity",
                "address": "At home",
                "phone": "No phone needed",
                "website": "",
                "latitude": 42.3601,
                "longitude": -71.0589
            }
        ]
        
        # Filter by age appropriateness
        age_appropriate = [
            rec for rec in fallback_recs 
            if rec["age_min"] <= child_age <= rec["age_max"]
        ]
        
        return age_appropriate if age_appropriate else fallback_recs[:2]
    



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
    Main function to get AI-powered recommendations - called from server.py
    
    Returns list of AI-generated recommended activities with match scores and explanations
    """
    
    try:
        engine = AIRecommendationEngine()
        recommendations = engine.get_recommendations(
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
        
        logger.info(f"Successfully generated {len(recommendations)} recommendations")
        
        # Ensure we always return at least some recommendations
        if not recommendations:
            logger.warning("No recommendations generated, using fallback")
            family_profile = {
                "child_age": child_age,
                "budget_per_week": budget_per_week,
                "parenting_style": parenting_style
            }
            recommendations = engine._get_fallback_recommendations(family_profile)
        
        return recommendations
        
    except Exception as e:
        logger.error(f"Error in get_recommendations: {e}")
        # Return fallback recommendations on error
        try:
            engine = AIRecommendationEngine()
            family_profile = {
                "child_age": child_age,
                "budget_per_week": budget_per_week,
                "parenting_style": parenting_style
            }
            return engine._get_fallback_recommendations(family_profile)
        except:
            # Last resort - return minimal recommendation
            return [{
                "activity_id": "emergency_rec",
                "id": "emergency_rec",
                "title": "Family Time",
                "description": "Spend quality time together",
                "category": "social",
                "price_monthly": 0,
                "age_min": 0,
                "age_max": 18,
                "match_score": 0.7,
                "ai_explanation": "Quality time is always beneficial for family bonding",
                "practical_tips": "Set aside dedicated time for family activities",
                "address": "At home",
                "phone": "No phone needed",
                "website": "",
                "latitude": 42.3601,
                "longitude": -71.0589
            }]
