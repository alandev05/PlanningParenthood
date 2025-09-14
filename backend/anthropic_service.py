import os
import json
from anthropic import Anthropic

class AnthropicService:
    def __init__(self):
        self.client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
    
    def generate_profiles(self, search_query: str):
        """Generate extraordinary people profiles based on search query"""
        try:
            response = self.client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=2000,
                messages=[{
                    "role": "user",
                    "content": f"""Generate 3-5 profiles of extraordinary people related to: "{search_query}"

Return a JSON array with this exact structure:
[
  {{
    "id": "unique_id",
    "name": "Full Name",
    "title": "Job Title",
    "company": "Company Name",
    "location": "City, Country",
    "backstory": "Brief inspiring backstory",
    "achievements": ["Achievement 1", "Achievement 2"],
    "linkedinUrl": "https://linkedin.com/in/example",
    "tags": ["tag1", "tag2"]
  }}
]

Focus on real, inspiring people who overcame challenges or made significant impact."""
                }]
            )
            
            # Parse the response
            content = response.content[0].text
            profiles = json.loads(content)
            return profiles
            
        except Exception as e:
            print(f"Error generating profiles: {e}")
            return []
    
    def interpret_search(self, query: str):
        """Interpret user's search intent"""
        try:
            response = self.client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=200,
                messages=[{
                    "role": "user",
                    "content": f"""Interpret this search query in 1-2 sentences: "{query}"
                    
What kind of extraordinary people is the user looking for? Be encouraging and specific."""
                }]
            )
            
            return response.content[0].text.strip()
            
        except Exception as e:
            print(f"Error interpreting search: {e}")
            return "Looking for inspiring people..."
