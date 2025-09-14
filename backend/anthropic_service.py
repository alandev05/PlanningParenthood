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
                model="claude-3-haiku-20240307",
                max_tokens=2000,
                messages=[{
                    "role": "user",
                    "content": f"""Generate 3-5 profiles of REAL extraordinary people related to: "{search_query}"

These should be actual people with real achievements and inspiring stories. Return ONLY a valid JSON array:

[
  {{
    "id": "person_1",
    "name": "Real Person's Full Name",
    "title": "Current or Most Notable Position",
    "company": "Company/Organization Name",
    "location": "City, Country",
    "backstory": "2-3 sentence inspiring story about their journey, challenges overcome, or unique path to success",
    "achievements": ["Specific real achievement 1", "Specific real achievement 2", "Specific real achievement 3"],
    "linkedinUrl": "https://linkedin.com/in/realistic-username",
    "tags": ["relevant", "skill", "background", "tags"]
  }}
]

Focus on diverse, inspiring real people who match the search criteria. Include their actual accomplishments and authentic stories."""
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
                model="claude-3-haiku-20240307",
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
