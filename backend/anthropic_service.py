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
                    "content": """Generate 3-5 profiles of REAL extraordinary people related to: "%s"

These should be actual people with real achievements and inspiring stories. Return ONLY a valid JSON array:

[
  {
    "id": "person_1",
    "name": "Real Person's Full Name",
    "title": "Current or Most Notable Position",
    "company": "Company/Organization Name",
    "location": "City, Country",
    "backstory": "2-3 sentence inspiring story about their journey, challenges overcome, or unique path to success",
    "achievements": ["Specific real achievement 1", "Specific real achievement 2", "Specific real achievement 3"],
    "linkedinUrl": "https://linkedin.com/in/realistic-username",
    "tags": ["relevant", "skill", "background", "tags"],
    "hasChildren": true,
    "childrenSummary": "One sentence noting whether they have children. If they do not, explicitly state that and emphasize their influence on young people, families, and communities worldwide through mentorship, philanthropy, or leadership."
  }
]

Important JSON rules:
- Output MUST be valid JSON (double-quoted keys/strings, no trailing commas)
- Do NOT include unescaped double quotes inside any string values
- For quoted titles or phrases, use Unicode quotes \u201C and \u201D, or escape as \" within strings

Focus on diverse, inspiring real people who match the search criteria. Include their actual accomplishments and authentic stories.""" % (search_query,)
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
                    "content": """Interpret this search query in 1-2 sentences: "%s"
                    
What kind of extraordinary people is the user looking for? Be encouraging and specific.""" % (query,)
                }]
            )
            
            return response.content[0].text.strip()
            
        except Exception as e:
            print(f"Error interpreting search: {e}")
            return "Looking for inspiring people..."
    
    def deep_research(self, query: str):
        """Deep research on specific person/company/organization"""
        try:
            print(f"🔍 Starting deep research for: {query}")
            
            response = self.client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=3000,
                messages=[{
                    "role": "user",
                    "content": """Research "%s" and create a profile that would inspire and inform parents. Focus on their journey, challenges overcome, parenting philosophy, and practical techniques for families.

Return ONLY a valid JSON array:

[
  {
    "id": "research_1",
    "name": "Full Name/Organization Name",
    "title": "Current Position/Role",
    "company": "Company/Organization",
    "location": "Location",
    "backstory": "Their journey from childhood/early struggles to success, emphasizing family values, education, and perseverance (3-4 sentences)",
    "achievements": [
      "Major accomplishment with specific impact on families/children",
      "Recognition or award that shows character and values",
      "Innovation that helps families/society/education",
      "Leadership example that parents can learn from",
      "Educational or philanthropic contribution to children"
    ],
    "linkedinUrl": "https://linkedin.com/in/realistic-profile",
    "tags": ["leadership", "family_values", "education", "perseverance"],
    "hasChildren": true,
    "childrenSummary": "One sentence noting whether they have children. If they do not, explicitly state that and emphasize their influence on young people, families, and communities worldwide through mentorship, philanthropy, or leadership.",
    "parentingLessons": [
      "Specific parenting technique or philosophy they use/recommend",
      "How they teach resilience and growth mindset to children",
      "Their approach to discipline, motivation, or education",
      "Advice about balancing high expectations with emotional support"
    ],
    "parentingTechniques": [
      "Specific method for encouraging children's curiosity and learning",
      "How they handle failure and teach children to bounce back",
      "Technique for building confidence and self-esteem in kids",
      "Method for teaching responsibility and work ethic"
    ],
    "familyBackground": "Information about their family, children, parenting style, or upbringing that parents can relate to and learn from",
    "inspirationalQuotes": [
      "Meaningful quote about success, family, or education",
      "Specific advice for parents or young people"
    ],
    "communityImpact": "How they've helped families, children, or communities - specific programs or initiatives",
    "stats": {
      "founded": "Year company was founded (if applicable)",
      "employees": "Number of people they employ/help",
      "charitable_giving": "Amount donated to education/family causes",
      "books_written": "Educational books or parenting resources created"
    },
    "sources": [
      {
        "title": "Source title",
        "url": "https://credible-source.example/article",
        "publisher": "Publisher or site name"
      }
    ]
  }
]

Important JSON rules:
- Output MUST be valid JSON (double-quoted keys/strings, no trailing commas)
- Do NOT include unescaped double quotes inside any string values
- Provide 3-6 credible sources as URLs in the sources array
- For quoted titles or phrases, use Unicode quotes \u201C and \u201D, or escape as \" within strings

Focus on practical parenting wisdom, specific techniques they use with their own children, and actionable advice that parents can implement.""" % (query,)
                }]
            )
            
            print(f"✅ Anthropic API response received")
            
            # Parse the response
            content = response.content[0].text
            print(f"📝 Raw response content (first 200 chars): {content[:200]}")
            print(f"📏 Response length: {len(content)}")
            
            # Try to find JSON in the response
            import re
            json_match = re.search(r'\[.*\]', content, re.DOTALL)
            if json_match:
                json_content = json_match.group(0)
                print(f"🎯 Extracted JSON (first 200 chars): {json_content[:200]}")
                try:
                    profiles = json.loads(json_content)
                    print(f"✅ Successfully parsed {len(profiles)} profiles")
                    return profiles
                except json.JSONDecodeError as e:
                    # Attempt to repair common issues like unescaped inner quotes (e.g., ""quote"")
                    print(f"🛠️ JSON decode failed, attempting repair: {e}")

                    def repair_inner_quotes(s: str) -> str:
                        # Replace double-double-quotes within JSON strings with escaped quotes
                        repaired_chars = []
                        in_string = False
                        escape = False
                        i = 0
                        while i < len(s):
                            ch = s[i]
                            if not in_string:
                                if ch == '"':
                                    in_string = True
                                    repaired_chars.append(ch)
                                else:
                                    repaired_chars.append(ch)
                                i += 1
                                continue
                            # in_string
                            if escape:
                                repaired_chars.append(ch)
                                escape = False
                                i += 1
                                continue
                            if ch == '\\':
                                repaired_chars.append(ch)
                                escape = True
                                i += 1
                                continue
                            if ch == '"':
                                # lookahead for another '"' to convert to escaped quote inside string
                                if i + 1 < len(s) and s[i + 1] == '"':
                                    repaired_chars.append('\\"')
                                    i += 2
                                    continue
                                # end of string
                                in_string = False
                                repaired_chars.append(ch)
                                i += 1
                                continue
                            repaired_chars.append(ch)
                            i += 1
                        return ''.join(repaired_chars)

                    repaired = repair_inner_quotes(json_content)
                    try:
                        profiles = json.loads(repaired)
                        print(f"✅ Repaired and parsed {len(profiles)} profiles")
                        return profiles
                    except json.JSONDecodeError as e2:
                        print(f"❌ Repair failed: {e2}")
                        print(f"Repaired content (first 400 chars): {repaired[:400]}")
                        return []
            else:
                print(f"❌ No JSON array found in response")
                print(f"Full content: {content}")
                return []
            
        except json.JSONDecodeError as e:
            print(f"❌ JSON parsing error: {e}")
            print(f"Content that failed to parse: {content}")
            return []
        except Exception as e:
            print(f"❌ Error in deep research: {e}")
            return []
