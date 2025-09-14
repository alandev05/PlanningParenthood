from flask import Flask, jsonify, request
from flask_cors import CORS
from utils.maps_service import GoogleMapsService
from firebase_service import FirebaseService
from anthropic_service import AnthropicService
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create Flask application instance
app = Flask(__name__)

# Enable CORS for all routes (allows frontend to communicate with backend)
CORS(app)

# Initialize services
maps_service = GoogleMapsService()
firebase_service = FirebaseService()
anthropic_service = AnthropicService()

# Basic route for testing server connectivity
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'Flask backend server is running!',
        'status': 'success'
    })

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
        lat = float(request.args.get('lat'))
        lng = float(request.args.get('lng'))
        place_type = request.args.get('type', 'hospital')
        radius = int(request.args.get('radius', 5000))
        
        results = maps_service.search_nearby_places(lat, lng, place_type, radius)
        return jsonify({'results': results})
    except (TypeError, ValueError):
        return jsonify({'error': 'Invalid lat/lng parameters'}), 400

@app.route('/api/extraordinary-people', methods=['POST'])
def generate_extraordinary_people():
    try:
        data = request.get_json()
        search_query = data.get('query', '')
        
        if not search_query:
            return jsonify({'error': 'Query parameter required'}), 400
        
        profiles = anthropic_service.generate_profiles(search_query)
        interpretation = anthropic_service.interpret_search(search_query)
        
        return jsonify({
            'profiles': profiles,
            'interpretation': interpretation
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Run the application
if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=8001,
        debug=True
    )