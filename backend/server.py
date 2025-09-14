from flask import Flask, jsonify, request
from app import create_app
from utils.maps_service import GoogleMapsService
from firebase_service import FirebaseService
from anthropic_service import AnthropicService
from dotenv import load_dotenv
import logging
import os

load_dotenv()

app = create_app()

# Consider moving these into create_app() and storing on app.config/app.extensions
maps_service = GoogleMapsService()
firebase_service = FirebaseService()
anthropic_service = AnthropicService()

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

        # Robust bool parsing
        raw_spouse = request.args.get('spouse', default=None)
        spouse = None
        if raw_spouse is not None:
            spouse = str(raw_spouse).lower() in {'1','true','t','yes','y','on'}

        parenting_style = request.args.get('parenting_style')
        number_of_kids = request.args.get('number_of_kids', type=int)
        area_type = request.args.get('area_type')
        priorities_ranked = request.args.getlist('priorities_ranked')

        logger.info("Recommendation request received")

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
            priorities_ranked=priorities_ranked
        ) or []

        if not recommendations:
            recommendations = [{
                "activity_id": "server_fallback",
                "id": "server_fallback",
                "title": "Family Activity Time",
                "description": "Dedicated time for family bonding and activities",
                "category": "social",
                "price_monthly": 0,
                "age_min": 0,
                "age_max": 18,
                "match_score": 0.7,
                "ai_explanation": "Quality family time is always beneficial for development",
                "practical_tips": "Set aside regular time for family activities",
                "developmental_benefits": "Supports overall child development and family bonding",
                "address": "At home",
                "phone": "No phone needed",
                "website": "",
                "latitude": 42.3601,
                "longitude": -71.0589
            }]

        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'total_count': len(recommendations),
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
                'priorities_ranked': priorities_ranked
            }
        }), 200
    except Exception as e:
        logger.exception("recommend endpoint failed")
        return jsonify({'error': f'Failed to get recommendations: {str(e)}'}), 500

if __name__ == '__main__':
    # If you stick with module-level singletons, disable the reloader to avoid double init
    app.run(host='0.0.0.0', port=8001, debug=True, use_reloader=False)
