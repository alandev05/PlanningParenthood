from app.models import Activity, SuccessStory

def seed_database():
    """Seed Firebase with sample activities and success stories"""
    
    # Sample activities for testing
    activities_data = [
        {
            'title': 'Little Kickers Soccer',
            'description': 'Fun soccer program for young children focusing on basic skills and teamwork',
            'category': 'physical',
            'price_monthly': 75,
            'age_min': 3,
            'age_max': 8,
            'latitude': 42.3601,
            'longitude': -71.0589,
            'address': '123 Main St, Boston, MA 02101',
            'phone': '(617) 555-0123',
            'website': 'https://littlekickers.com'
        },
        {
            'title': 'Creative Arts Workshop',
            'description': 'Hands-on art classes encouraging creativity and self-expression',
            'category': 'cognitive',
            'price_monthly': 60,
            'age_min': 4,
            'age_max': 12,
            'latitude': 42.3584,
            'longitude': -71.0598,
            'address': '456 Art Ave, Boston, MA 02102',
            'phone': '(617) 555-0456',
            'website': 'https://creativearts.com'
        },
        {
            'title': 'Library Story Time',
            'description': 'Free weekly story sessions promoting reading and social interaction',
            'category': 'social',
            'price_monthly': None,  # Free
            'age_min': 2,
            'age_max': 6,
            'latitude': 42.3555,
            'longitude': -71.0625,
            'address': '789 Library Ln, Boston, MA 02103',
            'phone': '(617) 555-0789',
            'website': 'https://bostonlibrary.org'
        },
        {
            'title': 'Mindful Kids Yoga',
            'description': 'Gentle yoga and mindfulness practices for emotional regulation',
            'category': 'emotional',
            'price_monthly': 45,
            'age_min': 5,
            'age_max': 10,
            'latitude': 42.3612,
            'longitude': -71.0570,
            'address': '321 Zen Way, Boston, MA 02104',
            'phone': '(617) 555-0321',
            'website': 'https://mindfulkids.com'
        },
        {
            'title': 'Community Garden Club',
            'description': 'Learn about nature and responsibility through gardening activities',
            'category': 'physical',
            'price_monthly': 25,
            'age_min': 6,
            'age_max': 14,
            'latitude': 42.3590,
            'longitude': -71.0610,
            'address': '654 Garden St, Boston, MA 02105',
            'phone': '(617) 555-0654',
            'website': 'https://communitygardens.org'
        }
    ]
    
    # Add activities to Firebase
    activities_added = 0
    for activity_data in activities_data:
        try:
            activity = Activity(activity_data)
            activity.save()
            activities_added += 1
            print(f"✓ Added activity: {activity.title}")
        except Exception as e:
            print(f"✗ Failed to add activity {activity_data['title']}: {e}")
    
    # Sample success stories
    success_stories_data = [
        {
            'title': 'From Shy to Confident: Emma\'s Soccer Journey',
            'summary': 'How a quiet 5-year-old found her voice through team sports',
            'full_story': 'Emma was extremely shy when she started kindergarten. Her parents enrolled her in Little Kickers Soccer despite her initial reluctance. Within three months, Emma was leading team cheers and had made several close friends. The combination of physical activity and team support helped her develop confidence that carried over into school and other activities.',
            'child_age_start': 5,
            'child_age_end': 7,
            'family_budget_range': 'medium',
            'key_strategies': [
                'Started with low-pressure team activities',
                'Celebrated small wins and participation over performance',
                'Connected with other parents for playdates',
                'Consistent weekly attendance built routine and friendships'
            ],
            'outcomes': [
                'Increased confidence in social situations',
                'Improved physical coordination and fitness',
                'Better emotional regulation under pressure',
                'Lasting friendships formed'
            ],
            'geographic_region': 'Northeast',
            'socioeconomic_tags': ['working_parents', 'dual_income'],
            'trait_profile': {
                'creativity': 0.4,
                'sociability': 0.2,
                'outdoors': 0.6,
                'energy': 0.5,
                'curiosity': 0.6,
                'kinesthetic': 0.7
            }
        },
        {
            'title': 'Creative Expression on a Budget',
            'summary': 'How free library programs sparked a love of learning',
            'full_story': 'As a single parent with limited income, Maria worried about providing enriching activities for her son Carlos. She discovered the free story time and craft sessions at their local library. Carlos, who struggled with reading, began to associate books with fun and creativity. The librarians provided additional resources and reading recommendations. Within a year, Carlos had improved his reading level significantly and developed a passion for storytelling.',
            'child_age_start': 6,
            'child_age_end': 8,
            'family_budget_range': 'low',
            'key_strategies': [
                'Utilized free community resources consistently',
                'Built relationships with library staff for personalized recommendations',
                'Extended learning at home with library books',
                'Participated in special events and reading challenges'
            ],
            'outcomes': [
                'Reading level improved by 2 grades',
                'Increased vocabulary and communication skills',
                'Developed love of learning and books',
                'Built confidence in academic abilities'
            ],
            'geographic_region': 'Northeast',
            'socioeconomic_tags': ['single_parent', 'low_income', 'community_resources'],
            'trait_profile': {
                'creativity': 0.8,
                'sociability': 0.5,
                'outdoors': 0.3,
                'energy': 0.4,
                'curiosity': 0.9,
                'kinesthetic': 0.6
            }
        }
    ]
    
    # Add success stories to Firebase
    stories_added = 0
    for story_data in success_stories_data:
        try:
            story = SuccessStory(story_data)
            story.save()
            stories_added += 1
            print(f"✓ Added success story: {story.title}")
        except Exception as e:
            print(f"✗ Failed to add success story {story_data['title']}: {e}")
    
    print(f"\n🎉 Seeding complete!")
    print(f"   Activities added: {activities_added}/{len(activities_data)}")
    print(f"   Success stories added: {stories_added}/{len(success_stories_data)}")