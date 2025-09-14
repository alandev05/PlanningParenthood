import os
import json
from openai import OpenAI

class ParentingChatService:
    def __init__(self):
        self.client = OpenAI(
            api_key=os.getenv('CEREBRAS_API_KEY'),
            base_url="https://api.cerebras.ai/v1"
        )
        self.model = "llama3.1-8b"  # Use smaller model for faster responses
        
    def get_parenting_advice(self, messages, child_age=None, parenting_style=None, specific_challenge=None):
        """Get personalized parenting advice with context"""
        
        # Build system prompt based on context
        system_prompt = self._build_system_prompt(child_age, parenting_style, specific_challenge)
        
        # Prepare messages with system context
        chat_messages = [{"role": "system", "content": system_prompt}] + messages
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=chat_messages,
                max_completion_tokens=800,
                temperature=0.3,
                response_format={
                    "type": "json_schema",
                    "json_schema": {
                        "name": "parenting_advice",
                        "strict": True,
                        "schema": {
                            "type": "object",
                            "properties": {
                                "advice": {"type": "string"},
                                "actionable_steps": {
                                    "type": "array",
                                    "items": {"type": "string"}
                                },
                                "age_appropriate_tips": {
                                    "type": "array", 
                                    "items": {"type": "string"}
                                },
                                "warning_signs": {
                                    "type": "array",
                                    "items": {"type": "string"}
                                },
                                "resources": {
                                    "type": "array",
                                    "items": {"type": "string"}
                                }
                            },
                            "required": ["advice", "actionable_steps"],
                            "additionalProperties": False
                        }
                    }
                }
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            print(f"Error getting parenting advice: {e}")
            return {
                "advice": "I'm having trouble processing your request right now. Please try again.",
                "actionable_steps": ["Try rephrasing your question", "Check back in a moment"]
            }
    
    def analyze_child_behavior(self, behavior_description, child_age, context=""):
        """Analyze child behavior and provide insights"""
        
        messages = [{
            "role": "user",
            "content": f"My {child_age}-year-old child is showing this behavior: {behavior_description}. Context: {context}"
        }]
        
        system_prompt = f"""You are a child development expert. Analyze the described behavior for a {child_age}-year-old child. 
        Provide developmental insights, possible causes, and evidence-based strategies. Be supportive and non-judgmental."""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "system", "content": system_prompt}] + messages,
                max_completion_tokens=600,
                temperature=0.2,
                response_format={
                    "type": "json_schema",
                    "json_schema": {
                        "name": "behavior_analysis",
                        "strict": True,
                        "schema": {
                            "type": "object",
                            "properties": {
                                "analysis": {"type": "string"},
                                "developmental_stage": {"type": "string"},
                                "possible_causes": {
                                    "type": "array",
                                    "items": {"type": "string"}
                                },
                                "strategies": {
                                    "type": "array",
                                    "items": {"type": "string"}
                                },
                                "when_to_seek_help": {"type": "string"}
                            },
                            "required": ["analysis", "developmental_stage", "possible_causes", "strategies"],
                            "additionalProperties": False
                        }
                    }
                }
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            print(f"Error analyzing behavior: {e}")
            return {
                "analysis": "Unable to analyze behavior at this time.",
                "developmental_stage": "Please try again",
                "possible_causes": [],
                "strategies": []
            }
    
    def generate_activities(self, child_age, interests, available_time, materials_available="basic"):
        """Generate age-appropriate activities"""
        
        prompt = f"""Generate engaging activities for a {child_age}-year-old who likes {interests}. 
        Available time: {available_time}. Materials: {materials_available}."""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{
                    "role": "system", 
                    "content": "You are a creative child development specialist. Generate fun, educational activities that promote learning and bonding."
                }, {
                    "role": "user",
                    "content": prompt
                }],
                max_completion_tokens=500,
                temperature=0.8,
                response_format={
                    "type": "json_schema",
                    "json_schema": {
                        "name": "activity_suggestions",
                        "strict": True,
                        "schema": {
                            "type": "object",
                            "properties": {
                                "activities": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "name": {"type": "string"},
                                            "description": {"type": "string"},
                                            "duration": {"type": "string"},
                                            "materials": {"type": "string"},
                                            "learning_goals": {"type": "string"}
                                        },
                                        "required": ["name", "description", "duration"],
                                        "additionalProperties": False
                                    }
                                }
                            },
                            "required": ["activities"],
                            "additionalProperties": False
                        }
                    }
                }
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            print(f"Error generating activities: {e}")
            return {"activities": []}
    
    def _build_system_prompt(self, child_age, parenting_style, specific_challenge):
        """Build contextual system prompt"""
        
        base_prompt = """You are an expert parenting assistant with deep knowledge of child development, psychology, and evidence-based parenting strategies. 
        
        Your role is to provide supportive, practical, and personalized advice to parents. Always:
        - Be empathetic and non-judgmental
        - Provide actionable, specific steps
        - Consider child development stages
        - Suggest age-appropriate strategies
        - Include warning signs when relevant
        - Recommend professional resources when needed
        
        Focus on building strong parent-child relationships while promoting healthy development."""
        
        if child_age:
            base_prompt += f"\n\nChild's age: {child_age} years old. Tailor advice to this developmental stage."
        
        if parenting_style:
            base_prompt += f"\n\nParenting style preference: {parenting_style}. Align suggestions with this approach."
        
        if specific_challenge:
            base_prompt += f"\n\nCurrent challenge: {specific_challenge}. Focus on addressing this specific issue."
        
        return base_prompt
