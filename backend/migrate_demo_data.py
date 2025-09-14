from firebase_service import FirebaseService

# Demo programs data with coordinates
demo_programs = [
    {
        'title': 'Cambridge Kids STEM Lab',
        'priceMonthly': 60,
        'distanceMiles': 1.2,
        'ageRange': [6, 12],
        'why': 'Hands-on STEM projects that boost curiosity and problem-solving.',
        'address': '123 Science Rd, Cambridge, MA',
        'phone': '(617) 555-0101',
        'latitude': 42.3736,
        'longitude': -71.1097,
    },
    {
        'title': 'Neighborhood Soccer Club (Scholarships)',
        'priceMonthly': 0,
        'distanceMiles': 0.8,
        'ageRange': [5, 14],
        'why': 'Team sport to build social skills and healthy habits.',
        'address': 'Park Field, Cambridge, MA',
        'phone': '(617) 555-0202',
        'latitude': 42.3751,
        'longitude': -71.1056,
    },
    {
        'title': 'City Library Creative Writing',
        'priceMonthly': 10,
        'distanceMiles': 0.5,
        'ageRange': [8, 16],
        'why': 'Boosts language, imagination, and expressive skills.',
        'address': 'Central Library, Cambridge, MA',
        'phone': '(617) 555-0303',
        'latitude': 42.3770,
        'longitude': -71.1167,
    },
    {
        'title': 'Art Explorers Studio',
        'priceMonthly': 120,
        'distanceMiles': 2.5,
        'ageRange': [4, 10],
        'why': 'Creative play focusing on materials and divergent thinking.',
        'address': 'Art Ave, Cambridge, MA',
        'phone': '(617) 555-0404',
        'latitude': 42.3601,
        'longitude': -71.0942,
    },
    {
        'title': 'Weekend Nature Walks (Free)',
        'priceMonthly': 0,
        'distanceMiles': 3.1,
        'ageRange': [3, 12],
        'why': 'Outdoor activity emphasizing curiosity, health, and low cost.',
        'address': 'River Trail, Cambridge, MA',
        'phone': '(617) 555-0505',
        'latitude': 42.3584,
        'longitude': -71.0598,
    },
]

def migrate_data():
    firebase_service = FirebaseService()
    success = firebase_service.add_programs_batch(demo_programs)
    
    if success:
        print("✅ Demo data successfully migrated to Firebase!")
    else:
        print("❌ Failed to migrate demo data")

if __name__ == '__main__':
    migrate_data()
