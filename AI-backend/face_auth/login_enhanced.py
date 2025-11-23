import cv2
import os
import pickle
import numpy as np
import sys
import time

# Simple face detection without DeepFace
# Use absolute path to ensure database is in AI-backend root directory
DB_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "face_db.pkl")

# Load Haar cascade for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# ------------------ Database Utils ------------------
def load_db():
    if os.path.exists(DB_FILE):
        with open(DB_FILE, "rb") as f:
            return pickle.load(f)
    return {}

# ------------------ Simple Face Matching ------------------
def verify_face(embedding, embeddings, threshold=0.8):
    """
    Simple face verification using Euclidean distance
    """
    if embedding is None or len(embeddings) == 0:
        return 0.0

    min_distance = float('inf')
    for stored_embedding in embeddings:
        # Euclidean distance
        distance = np.linalg.norm(embedding - stored_embedding)
        min_distance = min(min_distance, distance)

    # Convert distance to similarity score (higher is better)
    # Normalize distance (assuming max reasonable distance is around 1000)
    similarity = max(0, 1 - (min_distance / 1000))
    return similarity

# ------------------ Simple Face Detection ------------------
def detect_face(frame):
    """Simple face detection using Haar cascades"""
    try:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)

        if len(faces) > 0:
            # Return a simple feature vector based on face position and size
            x, y, w, h = faces[0]  # Use first detected face
            # Create a simple embedding based on face characteristics
            embedding = np.array([x, y, w, h, w/h, gray[y:y+h, x:x+w].mean(), gray[y:y+h, x:x+w].std()])
            return embedding
        else:
            return None
    except Exception as e:
        print(f"[WARNING] Face detection failed: {e}")
        return None

# ------------------ Enhanced Login ------------------
def login(max_attempts=50, confidence_threshold=0.65):
    """
    Enhanced login with more frames and better verification
    """
    db = load_db()
    if not db:
        print("[ERROR] No users found in database. Please register first.")
        return None

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("[ERROR] Cannot access the camera")
        return None

    print("Enhanced face login started. Please look at the camera.")
    print("The system will analyze multiple frames for better accuracy.")

    # Warmup period
    print("Camera warming up...")
    for i in range(10):
        cap.read()
        time.sleep(0.1)

    authenticated_user = None
    attempt_count = 0
    best_match_score = 0
    best_match_user = None

    # Collect multiple frames for verification
    verification_frames = 15

    while attempt_count < max_attempts:
        ret, frame = cap.read()
        if not ret:
            print("[WARNING] Failed to capture frame")
            attempt_count += 1
            continue

        # Flip frame horizontally for mirror effect
        frame = cv2.flip(frame, 1)

        # Display status
        status_text = f"Verifying... Frame {min(attempt_count + 1, verification_frames)}/{verification_frames}"
        cv2.putText(frame, status_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

        if best_match_user:
            cv2.putText(frame, f"Best match: {best_match_user} ({best_match_score:.2f})", (10, 60),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

        cv2.imshow("Enhanced Login - Press Q to quit", frame)

        # Try to detect face
        embedding = detect_face(frame)

        if embedding is not None:
            attempt_count += 1

            # Check against all users
            for name, embeddings in db.items():
                score = verify_face(embedding, embeddings)

                if score > best_match_score:
                    best_match_score = score
                    best_match_user = name

                if score > confidence_threshold:
                    authenticated_user = name
                    print(f"[INFO] High confidence match found for {name} (score: {score:.3f})")
                    break

            print(f"[INFO] Frame {attempt_count}/{verification_frames} processed. Best match: {best_match_user} (score: {best_match_score:.3f})")

            # Check if we have enough frames and high confidence
            if attempt_count >= verification_frames and best_match_score > confidence_threshold:
                authenticated_user = best_match_user
                break

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()

    if authenticated_user and best_match_score > confidence_threshold:
        print(f"[SUCCESS] Logged in as {authenticated_user} (confidence: {best_match_score:.3f})")
        return authenticated_user
    else:
        if best_match_user:
            print(f"[INFO] Best match was {best_match_user} with score {best_match_score:.3f}, but below threshold")
        print("[ERROR] Login failed - user not recognized or confidence too low")
        return None

if __name__ == "__main__":
    user = login()
    if user:
        print(f"Welcome back, {user}!")
    else:
        print("Authentication failed.")