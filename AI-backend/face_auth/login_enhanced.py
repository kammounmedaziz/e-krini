import cv2
import os
import pickle
import numpy as np
import sys
import time
# Add parent directory to path to import from project root
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from deepface import DeepFace

DB_FILE = "face_db.pkl"

# ------------------ Database Utils ------------------
def load_db():
    if os.path.exists(DB_FILE):
        with open(DB_FILE, "rb") as f:
            return pickle.load(f)
    return {}

# ------------------ Enhanced Face Matching ------------------
def verify_face(embedding, embeddings, threshold=0.6):
    """
    Enhanced face verification with multiple similarity checks
    """
    similarities = []
    for stored_embedding in embeddings:
        # Cosine similarity
        cos_sim = np.dot(embedding, stored_embedding) / (np.linalg.norm(embedding) * np.linalg.norm(stored_embedding))
        similarities.append(cos_sim)

    # Use multiple metrics for better accuracy
    avg_similarity = np.mean(similarities)
    max_similarity = np.max(similarities)
    min_similarity = np.min(similarities)

    # Weighted score: favor higher similarities
    weighted_score = (avg_similarity * 0.5) + (max_similarity * 0.3) + (min_similarity * 0.2)

    return weighted_score

# ------------------ Enhanced Face Detection ------------------
def detect_face(frame):
    """Enhanced face detection with preprocessing"""
    try:
        # Use DeepFace for face detection and embedding
        embedding = DeepFace.represent(frame, model_name="Facenet", enforce_detection=False)
        return embedding[0]["embedding"]
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