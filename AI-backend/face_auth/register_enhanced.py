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
def save_user_embeddings(name, embeddings):
    """
    Save user embeddings directly (for API use)
    """
    try:
        db = load_db()
        db[name] = embeddings
        save_db(db)
        print(f"[SUCCESS] {name} registered successfully with {len(embeddings)} face embeddings")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to save embeddings for {name}: {e}")
        return False

if __name__ == "__main__":
    user_name = input("Enter your name for registration: ")
    success = register_user(user_name)
    if success:
        print("Registration completed successfully!")
    else:
        print("Registration failed. Please try again.")