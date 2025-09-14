from flask import Flask, jsonify, request
from app import create_app
from utils.maps_service import GoogleMapsService
from firebase_service import FirebaseService
from anthropic_service import AnthropicService
from openai_service import ParentingChatService
from dotenv import load_dotenv
import requests
import logging
import os

load_dotenv()

app = create_app()

# Consider moving these into create_app() and storing on app.config/app.extensions
maps_service = GoogleMapsService()
firebase_service = FirebaseService()
anthropic_service = AnthropicService()
chat_service = ParentingChatService()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Flask backend server is running!', 'status': 'success'})

@app.route('/api/programs', methods=['GET'])
def get_programs():
    try:
        zip_code = request.args.get('zip')
        max_price = request.args.get('max_price', type=int)

        filters = {}
        if zip_code:
            filters['zip'] = zip_code
        if max_price is not None:
            filters['max_price'] = max_price

        programs = firebase_service.get_programs(filters)
        return jsonify({'programs': programs})
    except Exception as e:
        logger.exception("Failed to fetch programs")
        return jsonify({'error': str(e)}), 500

@app.route('/api/programs', methods=['POST'])
def add_programs():
    try:
        data = request.get_json(silent=True) or {}
        if isinstance(data, list):
            success = firebase_service.add_programs_batch(data)
        else:
            success = firebase_service.add_program(data)

        if success:
            return jsonify({'message': 'Programs added successfully'}), 201
        return jsonify({'error': 'Failed to add programs'}), 500
    except Exception as e:
        logger.exception("Failed to add programs")
        return jsonify({'error': str(e)}), 500

@app.route('/api/geocode', methods=['GET'])
def geocode():
    address = request.args.get('address')
    if not address:
        return jsonify({'error': 'Address parameter required'}), 400
    results = maps_service.geocode_address(address)
    return jsonify({'results': results})

@app.route('/api/nearby-places', methods=['GET'])
def nearby_places():
    try:
        lat = request.args.get('lat', type=float)
        lng = request.args.get('lng', type=float)
        if lat is None or lng is None:
            return jsonify({'error': 'lat and lng are required'}), 400
        place_type = request.args.get('type', default='hospital')
        radius = request.args.get('radius', default=5000, type=int)

        results = maps_service.search_nearby_places(lat, lng, place_type, radius)
        return jsonify({'results': results})
    except ValueError:
        return jsonify({'error': 'Invalid lat/lng parameters'}), 400
    except Exception as e:
        logger.exception("nearby-places failed")
        return jsonify({'error': str(e)}), 500

@app.route('/api/extraordinary-people', methods=['POST'])
def generate_extraordinary_people():
    try:
        payload = request.get_json(silent=True) or {}
        search_query = (payload.get('query') or '').strip()

        if not search_query:
            return jsonify({'error': 'Query parameter required'}), 400
        if len(search_query) > 500:
            return jsonify({'error': 'Query too long'}), 413  # payload too large

        # Optional: defensive prompt-hardening (very light)
        # e.g., reject obvious prompt-injection markers if you plan to chain to LLMs

        profiles = anthropic_service.generate_profiles(search_query)

        # Attempt to enrich with image URLs (best-effort)
        def enrich_with_image(name: str) -> str | None:
            try:
                # 1) Try Wikipedia title search for the person
                s = requests.get(
                    'https://en.wikipedia.org/w/rest.php/v1/search/title',
                    params={'q': name, 'limit': 1}, timeout=5
                )
                if s.ok:
                    data = s.json() or {}
                    pages = data.get('pages') or []
                    if pages:
                        key = pages[0].get('key')
                        if key:
                            # 2) Fetch summary to get thumbnail/original image
                            summary = requests.get(
                                f'https://en.wikipedia.org/api/rest_v1/page/summary/{key}',
                                timeout=5
                            )
                            if summary.ok:
                                js = summary.json() or {}
                                img = (
                                    (js.get('originalimage') or {}).get('source')
                                    or (js.get('thumbnail') or {}).get('source')
                                )
                                return img
            except Exception:
                pass
            return None

        for p in profiles or []:
            if not p.get('imageUrl') and p.get('name'):
                img = enrich_with_image(p['name'])
                if img:
                    p['imageUrl'] = img
        interpretation = anthropic_service.interpret_search(search_query)

        return jsonify({
            'profiles': profiles or [],
            'interpretation': interpretation or {}
        })
    except TimeoutError:
        return jsonify({'error': 'Upstream model timeout'}), 504
    except Exception as e:
        logger.exception("extraordinary-people failed")
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        messages = data.get('messages', [])
        user_id = data.get('user_id', 'default_user')  # In real app, get from auth
        
        if not messages:
            return jsonify({'error': 'Messages are required'}), 400
        
        # Get child age and kid traits from database
        child_age = None
        kid_traits = None
        try:
            user_data = firebase_service.get_user_data(user_id)
            print(f"🔍 Chat - Retrieved user data: {user_data}")
            
            if user_data and 'child_age' in user_data:
                child_age = user_data['child_age']
            if user_data and 'kid_traits' in user_data:
                kid_traits = user_data['kid_traits']
                print(f"🧒 Found kid traits: {kid_traits}")
            else:
                print("❌ No kid traits found in user data")
        except Exception as e:
            print(f"Could not fetch user data: {e}")
        
        # Use provided age as fallback
        if not child_age:
            child_age = data.get('child_age')
        
        parenting_style = data.get('parenting_style')
        specific_challenge = data.get('specific_challenge')
        
        response = chat_service.get_parenting_advice(
            messages, child_age, parenting_style, specific_challenge, kid_traits
        )
        
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/family/<family_id>/traits', methods=['POST'])
def save_kid_traits(family_id):
    try:
        data = request.get_json()
        
        # Save traits to user data (using family_id as user_id for simplicity)
        user_data = firebase_service.get_user_data(family_id) or {}
        user_data['kid_traits'] = data
        
        success = firebase_service.save_user_data(family_id, user_data)
        
        if success:
            return jsonify({'message': 'Kid traits saved successfully'})
        else:
            return jsonify({'error': 'Failed to save kid traits'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/<user_id>', methods=['GET'])
def get_user_data(user_id):
    try:
        user_data = firebase_service.get_user_data(user_id)
        print(f"🔍 Retrieved user data for {user_id}: {user_data}")
        
        if user_data:
            return jsonify(user_data)
        else:
            # Create default user if not found
            default_data = {
                'child_age': 5,
                'parenting_style': 'balanced',
                'number_of_kids': 1,
                'created_at': '2025-01-01',
                'kid_traits': {
                    'creativity': 0.8,  # More creative
                    'sociability': 0.6,  # Moderately social
                    'outdoors': 0.7,    # Enjoys outdoor activities
                    'energy': 0.9,
                    'curiosity': 0.8,
                    'kinesthetic': 0.5,
                }
            }
            firebase_service.save_user_data(user_id, default_data)
            return jsonify(default_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze-behavior', methods=['POST'])
def analyze_behavior():
    try:
        data = request.get_json()
        behavior = data.get('behavior_description', '')
        child_age = data.get('child_age', '')
        context = data.get('context', '')
        
        if not behavior or not child_age:
            return jsonify({'error': 'Behavior description and child age are required'}), 400
        
        response = chat_service.analyze_child_behavior(behavior, child_age, context)
        
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-activities', methods=['POST'])
def generate_activities():
    try:
        data = request.get_json()
        child_age = data.get('child_age', '')
        interests = data.get('interests', '')
        available_time = data.get('available_time', '30 minutes')
        materials = data.get('materials_available', 'basic household items')
        
        if not child_age or not interests:
            return jsonify({'error': 'Child age and interests are required'}), 400
        
        response = chat_service.generate_activities(child_age, interests, available_time, materials)
        
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/deep-research', methods=['POST'])
def deep_research():
    try:
        data = request.get_json()
        query = data.get('query', '')
        
        if not query:
            return jsonify({'error': 'Query is required'}), 400
        
        # Generate deep research profiles
        profiles = anthropic_service.deep_research(query)

        # Best-effort image enrichment for deep research as well
        def enrich_with_image(name: str) -> str | None:
            try:
                s = requests.get(
                    'https://en.wikipedia.org/w/rest.php/v1/search/title',
                    params={'q': name, 'limit': 1}, timeout=5
                )
                if s.ok:
                    data = s.json() or {}
                    pages = data.get('pages') or []
                    if pages:
                        key = pages[0].get('key')
                        if key:
                            summary = requests.get(
                                f'https://en.wikipedia.org/api/rest_v1/page/summary/{key}',
                                timeout=5
                            )
                            if summary.ok:
                                js = summary.json() or {}
                                img = (
                                    (js.get('originalimage') or {}).get('source')
                                    or (js.get('thumbnail') or {}).get('source')
                                )
                                return img
            except Exception:
                pass
            return None

        for p in profiles or []:
            if not p.get('imageUrl') and p.get('name'):
                img = enrich_with_image(p['name'])
                if img:
                    p['imageUrl'] = img

        interpretation = anthropic_service.interpret_search(f"Deep research on: {query}")
        
        return jsonify({
            'profiles': profiles,
            'interpretation': interpretation
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recommend', methods=['GET'])
def recommend():
    from utils.recommend import get_recommendations
    try:
        budget_per_week = request.args.get('budget_per_week_usd', type=float)
        child_age = request.args.get('child_age', type=int)
        if budget_per_week is None or child_age is None:
            return jsonify({'error': 'Missing required parameters: budget_per_week_usd and child_age'}), 400

        support_available = request.args.getlist('support_available')
        transport = request.args.get('transport')
        hours_per_week_with_kid = request.args.get('hours_per_week_with_kid', type=int)

        # spouse removed; covered by support_available
        spouse = None

        parenting_style = request.args.get('parenting_style')
        # number_of_kids removed; assume 1
        number_of_kids = 1
        area_type = request.args.get('area_type')
        priorities_ranked = request.args.getlist('priorities_ranked')
        # Optional location inputs
        lat = request.args.get('lat', type=float)
        lng = request.args.get('lng', type=float)
        user_zip = request.args.get('zip')
        if (lat is None or lng is None) and user_zip:
            try:
                geo = maps_service.geocode_address(user_zip)
                if geo:
                    loc = (geo[0].get('geometry') or {}).get('location') or {}
                    lat = loc.get('lat')
                    lng = loc.get('lng')
            except Exception:
                pass
        
        # Get family ID to retrieve kid traits
        family_id = request.args.get('family_id', 'default_user')
        logger.info(f"🔍 Recommendation request for family_id: {family_id}")
        kid_traits = None
        
        try:
            user_data = firebase_service.get_user_data(family_id)
            logger.info(f"📊 Retrieved user data for {family_id}: {user_data}")
            if user_data and 'kid_traits' in user_data:
                kid_traits = user_data['kid_traits']
                logger.info(f"✅ Successfully retrieved kid traits for recommendations: {kid_traits}")
            else:
                logger.warning(f"⚠️ No kid traits found for family_id: {family_id}")
        except Exception as e:
            logger.warning(f"❌ Could not retrieve kid traits for {family_id}: {e}")

        logger.info("Comprehensive recommendation request received")

        recommendations = get_recommendations(
            budget_per_week=budget_per_week,
            support_available=support_available,
            transport=transport,
            hours_per_week_with_kid=hours_per_week_with_kid,
            spouse=spouse,
            parenting_style=parenting_style,
            number_of_kids=number_of_kids,
            child_age=child_age,
            area_type=area_type,
            priorities_ranked=priorities_ranked,
            kid_traits=kid_traits,
            zip_code=user_zip
        ) or {}

        # Enrich local opportunities using Google Maps if we have a location
        try:
            if isinstance(recommendations, dict) and lat is not None and lng is not None:
                domain_to_types = {
                    'cognitive': ['library','museum'],
                    'physical': ['park','gym'],
                    'emotional': ['art_gallery','community_center'],
                    'social': ['community_center','school']
                }
                radius = 8000
                for domain, types in domain_to_types.items():
                    dom = recommendations.get(domain)
                    if not isinstance(dom, dict):
                        continue
                    collected = []
                    for t in types:
                        results = maps_service.search_nearby_places(lat, lng, t, radius) or []
                        for r in results:
                            details = maps_service.get_place_details(r.get('place_id')) if r.get('place_id') else {}
                            collected.append({
                                'name': r.get('name'),
                                'description': f"{t.replace('_',' ').title()} near you",
                                'address': (details.get('formatted_address') or r.get('vicinity') or ''),
                                'phone': details.get('formatted_phone_number') or 'Contact for details',
                                'website': details.get('website') or '',
                                'price_info': 'Varies',
                                'age_range': 'All ages',
                                'transportation_notes': f"Accessible by {transport or 'your transport'}",
                                'match_reason': f"Relevant {domain} opportunity near {user_zip or 'you'}",
                                'latitude': (r.get('geometry') or {}).get('location',{}).get('lat'),
                                'longitude': (r.get('geometry') or {}).get('location',{}).get('lng'),
                            })
                            if len(collected) >= 2:
                                break
                        if len(collected) >= 2:
                            break
                    # Replace or set local_opportunities
                    dom['local_opportunities'] = collected[:2] or dom.get('local_opportunities') or []
        except Exception as e:
            logger.warning(f"Nearby enrichment failed: {e}")

        if not recommendations:
            # Fallback to simple format for backward compatibility
            recommendations = {
                "cognitive": {
                    "parenting_advice": "Focus on age-appropriate learning activities that match your child's interests",
                    "activity_types": ["Reading together", "Educational games", "STEM activities"],
                    "local_opportunities": [{
                        "name": "Local Library",
                        "description": "Free educational resources and programs",
                        "address": "Check your local library",
                        "phone": "Contact local library",
                        "website": "",
                        "price_info": "Free",
                        "age_range": "All ages",
                        "transportation_notes": "Accessible by your transportation method",
                        "match_reason": "Supports cognitive development within budget"
                    }]
                },
                "physical": {
                    "parenting_advice": "Encourage regular physical activity appropriate for your child's age",
                    "activity_types": ["Outdoor play", "Sports", "Dance"],
                    "local_opportunities": [{
                        "name": "Local Park",
                        "description": "Free outdoor play space",
                        "address": "Check local parks",
                        "phone": "Contact parks department",
                        "website": "",
                        "price_info": "Free",
                        "age_range": "All ages",
                        "transportation_notes": "Accessible by your transportation method",
                        "match_reason": "Supports physical development"
                    }]
                },
                "emotional": {
                    "parenting_advice": "Create a supportive environment for emotional expression and regulation",
                    "activity_types": ["Art therapy", "Mindfulness", "Emotional check-ins"],
                    "local_opportunities": [{
                        "name": "Home Activities",
                        "description": "Emotional development through daily interactions",
                        "address": "At home",
                        "phone": "No phone needed",
                        "website": "",
                        "price_info": "Free",
                        "age_range": "All ages",
                        "transportation_notes": "No transportation needed",
                        "match_reason": "Supports emotional development"
                    }]
                },
                "social": {
                    "parenting_advice": "Provide opportunities for social interaction and relationship building",
                    "activity_types": ["Play dates", "Group activities", "Community events"],
                    "local_opportunities": [{
                        "name": "Community Center",
                        "description": "Local programs and social activities",
                        "address": "Check local community center",
                        "phone": "Contact community center",
                        "website": "",
                        "price_info": "Varies",
                        "age_range": "All ages",
                        "transportation_notes": "Accessible by your transportation method",
                        "match_reason": "Supports social development"
                    }]
                }
            }
        print("SERVER_FINAL_RECS_KEYS", list(recommendations.keys()) if isinstance(recommendations, dict) else type(recommendations))
        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'parameters_received': {
                'budget_per_week_usd': budget_per_week,
                'support_available': support_available,
                'transport': transport,
                'hours_per_week_with_kid': hours_per_week_with_kid,
                'spouse': spouse,
                'parenting_style': parenting_style,
                'number_of_kids': number_of_kids,
                'child_age': child_age,
                'area_type': area_type,
                'priorities_ranked': priorities_ranked,
                'kid_traits_used': kid_traits is not None,
                'lat': lat,
                'lng': lng,
                'zip': user_zip
            }
        }), 200
    except Exception as e:
        logger.exception("recommend endpoint failed")
        return jsonify({'error': f'Failed to get recommendations: {str(e)}'}), 500

if __name__ == '__main__':
    # If you stick with module-level singletons, disable the reloader to avoid double init
    app.run(host='0.0.0.0', port=8001, debug=True, use_reloader=False)
