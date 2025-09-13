from flask import Flask, jsonify
from flask_cors import CORS

# Create Flask application instance
app = Flask(__name__)

# Enable CORS for all routes (allows frontend to communicate with backend)
CORS(app)

# Basic route for testing server connectivity
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'Flask backend server is running!',
        'status': 'success'
    })

# Run the application
if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=8001,
        debug=True
    )