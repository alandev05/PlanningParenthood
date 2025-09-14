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
        
    def get_parenting_advice(self, messages, child_age=None, parenting_style=None, specific_challenge=None, kid_traits=None):
        """Get personalized parenting advice with context"""
        
        # Build system prompt based on context
        system_prompt = self._build_system_prompt(child_age, parenting_style, specific_challenge, kid_traits)
        
        # Prepare messages with system context
        chat_messages = [{"role": "system", "content": system_prompt}] + messages
        
        try:
            print(f"🤖 Making request to Cerebras with model: {self.model}")
            print(f"📝 System prompt: {system_prompt[:200]}...")
            print(f"💬 Messages: {len(chat_messages)} messages")
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=chat_messages,
                max_completion_tokens=800,
                temperature=0.7,  # Higher temperature for more variety
            )
            
            print(f"✅ Got response from Cerebras")
            content = response.choices[0].message.content
            print(f"📊 Raw response: {content[:200]}...")
            
            # Parse the response into structured format
            result = {
                "advice": content,
                "actionable_steps": self._extract_steps(content),
            }
            
            return result
            
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
    
    def _build_system_prompt(self, child_age, parenting_style, specific_challenge, kid_traits):
        """Build contextual system prompt"""
        
        base_prompt = """You are a warm, supportive parenting assistant with deep knowledge of child development, psychology, and evidence-based parenting strategies. 
        
        Speak like a caring friend who happens to be an expert - be conversational, empathetic, and engaging. Always:
        - Use a warm, friendly tone like you're chatting with a friend
        - Ask thoughtful follow-up questions to better understand their situation
        - Share specific, actionable advice tailored to their exact question
        - Be curious about their child's unique personality and circumstances
        - Offer encouragement and validation for their parenting efforts
        - Give concrete examples and strategies they can try right away
        - End with questions that invite them to share more or ask for clarification
        
        Think of yourself as their supportive parenting buddy who genuinely cares about their family's wellbeing.
        
        IMPORTANT: Be conversational and ask follow-up questions, but still provide the helpful advice they need. Make them feel heard and supported."""
        
        if child_age:
            base_prompt += f"\n\nI know your child is {child_age} years old, so I'll make sure my suggestions fit perfectly with what's developmentally appropriate for them."
        
        if parenting_style:
            base_prompt += f"\n\nI see you prefer a {parenting_style} parenting approach - I'll keep that in mind with my suggestions!"
        
        if specific_challenge:
            base_prompt += f"\n\nYou mentioned you're dealing with {specific_challenge} - let's tackle this together and find some strategies that work for your family."
        
        if kid_traits:
            traits_text = []
            if 'creativity' in kid_traits:
                creativity_level = "super creative and imaginative" if kid_traits['creativity'] > 0.7 else "pretty creative" if kid_traits['creativity'] > 0.3 else "more analytical and logical"
                traits_text.append(f"your little one is {creativity_level}")
            
            if 'sociability' in kid_traits:
                social_level = "really social and loves being around others" if kid_traits['sociability'] > 0.7 else "enjoys some social time but also values independence" if kid_traits['sociability'] > 0.3 else "more independent and prefers solo activities"
                traits_text.append(f"they're {social_level}")
            
            if 'outdoors' in kid_traits:
                outdoor_level = "absolutely loves outdoor adventures" if kid_traits['outdoors'] > 0.7 else "enjoys getting outside sometimes" if kid_traits['outdoors'] > 0.3 else "prefers cozy indoor activities"
                traits_text.append(f"they {outdoor_level}")
            
            if traits_text:
                base_prompt += f"\n\nFrom what I know about your child's personality, {', and '.join(traits_text)}. I'll suggest activities and approaches that really match who they are!"
        
        return base_prompt
    
    def _extract_steps(self, content):
        """Extract actionable steps from response text"""
        lines = content.split('\n')
        steps = []
        
        for line in lines:
            line = line.strip()
            # Look for numbered lists or bullet points
            if (line.startswith(('1.', '2.', '3.', '4.', '5.')) or 
                line.startswith(('•', '-', '*')) or
                line.startswith('Step')):
                # Clean up the step text
                step = line.replace('1.', '').replace('2.', '').replace('3.', '').replace('4.', '').replace('5.', '')
                step = step.replace('•', '').replace('-', '').replace('*', '').strip()
                if step and len(step) > 10:  # Only include meaningful steps
                    steps.append(step)
        
        # If no steps found, create some from the content
        if not steps:
            sentences = content.split('.')
            for sentence in sentences[:3]:  # Take first 3 sentences as steps
                sentence = sentence.strip()
                if len(sentence) > 20:
                    steps.append(sentence)
        
        return steps[:5]  # Limit to 5 steps
