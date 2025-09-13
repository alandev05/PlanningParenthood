from flask import jsonify
from app.api import api_bp

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