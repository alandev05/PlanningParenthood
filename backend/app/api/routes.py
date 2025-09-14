from flask import jsonify, request
from app.api import api_bp
from app.models import Family, FamilyPriorities, KidTraits, Activity, Recommendation

@api_bp.route('/', methods=['GET'])
def api_home():
    """API health check endpoint"""
    return jsonify({
        'message': 'Parenting Recommendations API is running!',
        'status': 'success',
        'version': '1.0.0',
        'database': 'Firebase Firestore'
    })

@api_bp.route('/health', methods=['GET'])
def health_check():
    """Detailed health check including Firebase and Redis connectivity"""
    from app import db, redis_client
    
    health_status = {
        'api': 'healthy',
        'firebase': 'unknown',
        'redis': 'unknown'
    }
    
    # Check Firebase connectivity
    try:
        if db:
            # Try to read from a test collection
            test_ref = db.collection('health_check').limit(1)
            list(test_ref.stream())  # This will fail if Firebase is not connected
            health_status['firebase'] = 'healthy'
        else:
            health_status['firebase'] = 'not initialized'
    except Exception as e:
        health_status['firebase'] = f'unhealthy: {str(e)}'
    
    # Check Redis connectivity
    if redis_client:
        try:
            redis_client.ping()
            health_status['redis'] = 'healthy'
        except Exception as e:
            health_status['redis'] = f'unhealthy: {str(e)}'
    else:
        health_status['redis'] = 'not configured'
    
    return jsonify(health_status)

@api_bp.route('/family', methods=['POST'])
def create_family():
    """Create a new family profile from intake form data"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['zip_code', 'child_age', 'budget', 'availability']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create family profile
        family = Family()
        family.zip_code = data['zip_code']
        family.child_age = data['child_age']
        family.budget = data['budget']
        family.availability = data['availability']
        
        family_id = family.save()
        
        return jsonify({
            'success': True,
            'family_id': family_id,
            'message': 'Family profile created successfully'
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Failed to create family profile: {str(e)}'}), 500

@api_bp.route('/family/<family_id>/priorities', methods=['POST'])
def save_family_priorities(family_id):
    """Save family priorities (happiness, success, social, health)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['happiness', 'success', 'social', 'health']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create or update priorities
        priorities = FamilyPriorities()
        priorities.family_id = family_id
        priorities.happiness = float(data['happiness'])
        priorities.success = float(data['success'])
        priorities.social = float(data['social'])
        priorities.health = float(data['health'])
        
        priorities.save()
        
        return jsonify({
            'success': True,
            'message': 'Family priorities saved successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to save priorities: {str(e)}'}), 500

@api_bp.route('/family/<family_id>/traits', methods=['POST'])
def save_kid_traits(family_id):
    """Save kid personality traits from quiz"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['creativity', 'sociability', 'outdoors', 'energy', 'curiosity', 'kinesthetic']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create or update traits
        traits = KidTraits()
        traits.family_id = family_id
        traits.creativity = float(data['creativity'])
        traits.sociability = float(data['sociability'])
        traits.outdoors = float(data['outdoors'])
        traits.energy = float(data['energy'])
        traits.curiosity = float(data['curiosity'])
        traits.kinesthetic = float(data['kinesthetic'])
        
        traits.save()
        
        return jsonify({
            'success': True,
            'message': 'Kid traits saved successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to save kid traits: {str(e)}'}), 500

@api_bp.route('/recommendations', methods=['GET'])
def get_recommendations():
    """Get personalized recommendations for a family"""
    try:
        family_id = request.args.get('family_id')
        if not family_id:
            return jsonify({'error': 'family_id parameter required'}), 400
        
        # Get family data
        family = Family.get(family_id)
        if not family:
            return jsonify({'error': 'Family not found'}), 404
        
        priorities = FamilyPriorities.get_by_family(family_id)
        traits = KidTraits.get_by_family(family_id)
        
        # Get all activities for now (placeholder logic)
        activities = Activity.get_all()
        
        # Simple placeholder recommendation logic
        recommendations = []
        for activity in activities:
            # Basic filtering by age
            if family.child_age >= activity.age_min and family.child_age <= activity.age_max:
                # Simple scoring based on priorities and traits
                match_score = 0.5  # Base score
                
                # Adjust score based on priorities (placeholder logic)
                if priorities:
                    if activity.category == 'physical' and priorities.health > 7:
                        match_score += 0.2
                    elif activity.category == 'social' and priorities.social > 7:
                        match_score += 0.2
                    elif activity.category == 'cognitive' and priorities.success > 7:
                        match_score += 0.2
                
                # Adjust score based on traits (placeholder logic)
                if traits:
                    if activity.category == 'physical' and traits.energy > 0.7:
                        match_score += 0.1
                    elif activity.category == 'cognitive' and traits.curiosity > 0.7:
                        match_score += 0.1
                    elif activity.category == 'social' and traits.sociability > 0.7:
                        match_score += 0.1
                
                # Only include activities with decent match scores
                if match_score > 0.6:
                    recommendation = {
                        'activity_id': activity.id,
                        'title': activity.title,
                        'description': activity.description,
                        'category': activity.category,
                        'price_monthly': activity.price_monthly,
                        'age_min': activity.age_min,
                        'age_max': activity.age_max,
                        'address': activity.address,
                        'phone': activity.phone,
                        'website': activity.website,
                        'latitude': activity.latitude,
                        'longitude': activity.longitude,
                        'match_score': round(match_score, 2),
                        'ai_explanation': f"This {activity.category} activity matches your child's age and your family's priorities."
                    }
                    recommendations.append(recommendation)
        
        # Sort by match score (highest first)
        recommendations.sort(key=lambda x: x['match_score'], reverse=True)
        
        return jsonify({
            'success': True,
            'family_id': family_id,
            'recommendations': recommendations,
            'total_count': len(recommendations)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get recommendations: {str(e)}'}), 500