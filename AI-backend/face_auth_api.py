from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import base64
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Try to import optional dependencies
try:
    import cv2
    from PIL import Image
    import io
    DEPENDENCIES_AVAILABLE = True
except ImportError:
    print("[WARNING] Some dependencies not available. Running in mock mode.")
    DEPENDENCIES_AVAILABLE = False

# ------------------ Face Authentication API ------------------

@app.route('/api/face/register', methods=['POST'])
def register_face():
    """
    Register a user with face authentication
    Expected JSON: {"username": "user_name", "num_frames": 30}
    """
    try:
        data = request.get_json()

        if not data or 'username' not in data:
            return jsonify({
                'success': False,
                'error': 'Username is required'
            }), 400

        username = data['username']
        num_frames = data.get('num_frames', 30)

        # Lazy import to avoid TensorFlow loading at startup
        sys.path.append(os.path.join(os.path.dirname(__file__), 'face_auth'))
        from face_auth.register_enhanced import register_user as face_register

        # Call the enhanced registration function
        success = face_register(username, num_frames)

        if success:
            return jsonify({
                'success': True,
                'message': f'User {username} registered successfully with face authentication'
            }), 201
        else:
            return jsonify({
                'success': False,
                'error': 'Face registration failed. Please try again.'
            }), 400

    except Exception as e:
        print(f"[ERROR] Face registration API error: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error during registration'
        }), 500

@app.route('/api/face/login', methods=['POST'])
def login_face():
    """
    Login a user with face authentication
    Expected JSON: {"max_attempts": 50, "confidence_threshold": 0.65}
    """
    try:
        data = request.get_json() or {}
        max_attempts = data.get('max_attempts', 50)
        confidence_threshold = data.get('confidence_threshold', 0.65)

        # Lazy import to avoid TensorFlow loading at startup
        sys.path.append(os.path.join(os.path.dirname(__file__), 'face_auth'))
        from face_auth.login_enhanced import login as face_login

        # Call the enhanced login function
        authenticated_user = face_login(max_attempts, confidence_threshold)

        if authenticated_user:
            return jsonify({
                'success': True,
                'username': authenticated_user,
                'message': f'Successfully authenticated as {authenticated_user}'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Face authentication failed'
            }), 401

    except Exception as e:
        print(f"[ERROR] Face login API error: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error during authentication'
        }), 500

@app.route('/api/face/register-embeddings', methods=['POST'])
def register_face_embeddings():
    """
    Register a user with face embeddings
    Expected JSON: {"username": "user_name", "embeddings": [[...], [...], ...]}
    """
    try:
        data = request.get_json()

        if not data or 'username' not in data or 'embeddings' not in data:
            return jsonify({
                'success': False,
                'error': 'Username and embeddings are required'
            }), 400

        username = data['username']
        embeddings = data['embeddings']

        if not isinstance(embeddings, list) or len(embeddings) == 0:
            return jsonify({
                'success': False,
                'error': 'Embeddings must be a non-empty array'
            }), 400

        # Lazy import to avoid TensorFlow loading at startup
        sys.path.append(os.path.join(os.path.dirname(__file__), 'face_auth'))
        from face_auth.register_enhanced import save_user_embeddings

        # Save the embeddings for the user
        success = save_user_embeddings(username, embeddings)

        if success:
            return jsonify({
                'success': True,
                'message': f'User {username} registered successfully with face embeddings'
            }), 201
        else:
            return jsonify({
                'success': False,
                'error': 'Face registration failed. Please try again.'
            }), 400

    except Exception as e:
        print(f"[ERROR] Face embeddings registration API error: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error during registration'
        }), 500
@app.route('/api/face/verify-frame', methods=['POST'])
def verify_face_frame():
    """
    Verify a single face frame (for real-time verification)
    Expected JSON: {"image": "base64_encoded_image"}
    """
    try:
        data = request.get_json()

        if not data or 'image' not in data:
            return jsonify({
                'success': False,
                'error': 'Image data is required'
            }), 400

        # Decode base64 image
        if DEPENDENCIES_AVAILABLE:
            # Strip data URL prefix if present (e.g., 'data:image/jpeg;base64,')
            image_str = data['image']
            if ',' in image_str:
                image_str = image_str.split(',', 1)[1]
            
            image_data = base64.b64decode(image_str)
            image = Image.open(io.BytesIO(image_data))
            frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

            # Lazy import face detection functions
            sys.path.append(os.path.join(os.path.dirname(__file__), 'face_auth'))
            from face_auth.login_enhanced import detect_face, load_db, verify_face

            # Detect face in the frame
            embedding = detect_face(frame)
        else:
            # Mock face detection
            embedding = [0.1 + i * 0.01 for i in range(128)]  # Mock embedding

        if embedding is None:
            return jsonify({
                'success': False,
                'error': 'No face detected in the image'
            }), 400

        # Check against all registered users
        db = load_db()
        best_match = None
        best_score = 0

        for username, embeddings in db.items():
            score = verify_face(embedding, embeddings)
            if score > best_score:
                best_score = score
                best_match = username

        return jsonify({
            'success': True,
            'detected': True,
            'best_match': best_match,
            'confidence': float(best_score),
            'threshold_met': best_score > 0.65
        }), 200

    except Exception as e:
        print(f"[ERROR] Frame verification error: {e}")
        return jsonify({
            'success': False,
            'error': 'Error processing face frame'
        }), 500

@app.route('/api/face/status', methods=['GET'])
def get_face_auth_status():
    """
    Get the status of face authentication system
    """
    try:
        # Check for database in both possible locations
        db_path_root = os.path.join(os.path.dirname(__file__), 'face_db.pkl')
        db_path_subdir = os.path.join(os.path.dirname(__file__), 'face_auth', 'face_db.pkl')
        
        db_exists = os.path.exists(db_path_root) or os.path.exists(db_path_subdir)
        db_path = db_path_root if os.path.exists(db_path_root) else db_path_subdir

        if db_exists:
            # Load database directly
            import pickle
            with open(db_path, 'rb') as f:
                db = pickle.load(f)
            user_count = len(db)
            print(f"[INFO] Database found at {db_path} with {user_count} users: {list(db.keys())}")
        else:
            user_count = 0
            print(f"[INFO] No database found. Checked: {db_path_root} and {db_path_subdir}")

        return jsonify({
            'success': True,
            'database_exists': db_exists,
            'registered_users': user_count,
            'status': 'ready' if db_exists else 'no_database',
            'users': list(db.keys()) if db_exists else []
        }), 200

    except Exception as e:
        print(f"[ERROR] Status check error: {e}")
        return jsonify({
            'success': False,
            'error': 'Error checking face auth status'
        }), 500

if __name__ == '__main__':
    print("Starting Face Authentication API Server...")
    print("Available endpoints:")
    print("POST /api/face/register - Register user with face")
    print("POST /api/face/login - Login with face")
    print("POST /api/face/verify-frame - Verify single frame")
    print("GET /api/face/status - Check system status")

    app.run(host='127.0.0.1', port=5002, debug=False)