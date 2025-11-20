import cv2
import os
import pickle
import numpy as np
import sys
import time

# Simple face detection without DeepFace
DB_FILE = "face_db.pkl"

# Load Haar cascade for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# ------------------ Database Utils ------------------
def load_db():
    if os.path.exists(DB_FILE):
        with open(DB_FILE, "rb") as f:
            return pickle.load(f)
    return {}

def save_db(db):
    with open(DB_FILE, "wb") as f:
        pickle.dump(db, f)

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

# ------------------ Enhanced Registration ------------------
def register_user(name, num_frames=30):
    """
    Enhanced registration with more frames and better quality control
    """
    db = load_db()

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("[ERROR] Cannot access the camera")
        return False

    print(f"Starting enhanced registration for {name}")
    print("Please look at the camera and move your head slightly for better recognition")

    embeddings = []
    count = 0
    consecutive_failures = 0
    max_consecutive_failures = 10

    # Warmup period
    print("Camera warming up...")
    for i in range(10):
        cap.read()
        time.sleep(0.1)

    while count < num_frames and consecutive_failures < max_consecutive_failures:
        ret, frame = cap.read()
        if not ret:
            print("[WARNING] Failed to capture frame")
            consecutive_failures += 1
            continue

        # Flip frame horizontally for mirror effect
        frame = cv2.flip(frame, 1)

        # Display progress
        progress_text = f"Registration: {count}/{num_frames} frames"
        cv2.putText(frame, progress_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

        # Show quality indicators
        if consecutive_failures > 0:
            cv2.putText(frame, f"Face detection issues: {consecutive_failures}", (10, 60),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 165, 255), 2)

        cv2.imshow("Enhanced Registration - Press Q to quit", frame)

        # Try to detect face
        embedding = detect_face(frame)

        if embedding is not None:
            embeddings.append(embedding)
            count += 1
            consecutive_failures = 0
            print(f"[INFO] Captured {count}/{num_frames} frames for {name}")

            # Add small delay between captures for natural movement
            time.sleep(0.2)
        else:
            consecutive_failures += 1
            print(f"[WARNING] Face not detected, consecutive failures: {consecutive_failures}")

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()

    if len(embeddings) >= num_frames * 0.7:  # Accept if we got at least 70% of target frames
        db[name] = embeddings
        save_db(db)
        print(f"[SUCCESS] {name} registered successfully with {len(embeddings)} face embeddings")
        return True
    else:
        print(f"[ERROR] Registration failed for {name}. Only captured {len(embeddings)}/{num_frames} frames")
        return False

if __name__ == "__main__":
    user_name = input("Enter your name for registration: ")
    success = register_user(user_name)
    if success:
        print("Registration completed successfully!")
    else:
        print("Registration failed. Please try again.")