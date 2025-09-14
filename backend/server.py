from app import create_app
from utils.maps_service import GoogleMapsService
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create Flask application using the factory pattern
app = create_app()

# Initialize Google Maps service
maps_service = GoogleMapsService()

# Basic route for testing server connectivity
@app.route('/', methods=['GET'])
def home():
    from flask import jsonify
    return jsonify({
        'message': 'Flask backend server is running!',
        'status': 'success'
    })

@app.route('/api/geocode', methods=['GET'])
def geocode():
    from flask import jsonify, request
    address = request.args.get('address')
    if not address:
        return jsonify({'error': 'Address parameter required'}), 400
    
    results = maps_service.geocode_address(address)
    return jsonify({'results': results})

@app.route('/api/nearby-places', methods=['GET'])
def nearby_places():
    from flask import jsonify, request
    try:
        lat = float(request.args.get('lat'))
        lng = float(request.args.get('lng'))
        place_type = request.args.get('type', 'hospital')
        radius = int(request.args.get('radius', 5000))
        
        results = maps_service.search_nearby_places(lat, lng, place_type, radius)
        return jsonify({'results': results})
    except (TypeError, ValueError):
        return jsonify({'error': 'Invalid lat/lng parameters'}), 400

@app.route('/api/recommend', methods=['GET'])
def recommend():
    """Get recommendations based on intake form payload as query parameters"""
    from flask import jsonify, request
    from utils.recommend import get_recommendations
    
    try:
        # Extract all the intake form parameters
        budget_per_week = request.args.get('budget_per_week_usd', type=float)
        support_available = request.args.getlist('support_available')  # Multiple values
        transport = request.args.get('transport')
        hours_per_week_with_kid = request.args.get('hours_per_week_with_kid', type=int)
        spouse = request.args.get('spouse', type=bool)
        parenting_style = request.args.get('parenting_style')
        number_of_kids = request.args.get('number_of_kids', type=int)
        child_age = request.args.get('child_age', type=int)
        area_type = request.args.get('area_type')
        priorities_ranked = request.args.getlist('priorities_ranked')  # Multiple values
        
        # Validate required parameters
        if budget_per_week is None or child_age is None:
            return jsonify({'error': 'Missing required parameters: budget_per_week_usd and child_age'}), 400
        
        # Log the received parameters for debugging
        print(f"Received recommendation request:")
        print(f"  Budget per week: ${budget_per_week}")
        print(f"  Support available: {support_available}")
        print(f"  Transport: {transport}")
        print(f"  Hours per week with kid: {hours_per_week_with_kid}")
        print(f"  Has spouse: {spouse}")
        print(f"  Parenting style: {parenting_style}")
        print(f"  Number of kids: {number_of_kids}")
        print(f"  Child age: {child_age}")
        print(f"  Area type: {area_type}")
        print(f"  Priorities ranked: {priorities_ranked}")
        
        # Call the recommendation engine
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
        )
        
        print(f"Generated {len(recommendations)} recommendations")
        
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
        print(f"Error in recommend endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to get recommendations: {str(e)}'}), 500

# Run the application
if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=8001,
        debug=True
    )