import cv2
import numpy as np
import tensorflow as tf
import os
import time

# --- CONFIGURATION ---
MODEL_PATH = os.path.join("intelligence", "models", "spectra_best_model.keras")
EMOTIONS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']

def main():
    print("🎥 Initializing Spectra Live Inference...")
    
    # 1. Load Model
    if not os.path.exists(MODEL_PATH):
        print(f"❌ Error: Model not found at {MODEL_PATH}")
        return

    print("🧠 Loading model... (This might take a moment)")
    model = tf.keras.models.load_model(MODEL_PATH)
    print("✅ Model loaded successfully!")

    # 2. Setup Webcam
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Error: Could not open webcam.")
        return

    # 3. Setup Face Detection (Standard OpenCV Haar Cascade)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

    print("\n🟢 SPECTRA LIVE | Press 'Q' to quit")
    print("-" * 50)

    # Frame timing for FPS
    prev_time = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            print("❌ Error: Failed to capture frame.")
            break

        # Mirror the frame (more natural)
        frame = cv2.flip(frame, 1)
        
        # Convert to Grayscale (Model expects 1 channel)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Detect Faces
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5, minSize=(30, 30))

        # Process each face
        for (x, y, w, h) in faces:
            # ROI (Region of Interest)
            roi_gray = gray[y:y+h, x:x+w]
            
            # Preprocessing (Match training logic!)
            # 1. Resize to 48x48
            roi_resized = cv2.resize(roi_gray, (48, 48))
            
            # 2. Normalize (0-1)
            roi_norm = roi_resized.astype('float32') / 255.0
            
            # 3. Reshape for Model (Batch=1, H=48, W=48, C=1)
            roi_input = np.expand_dims(roi_norm, axis=0)
            roi_input = np.expand_dims(roi_input, axis=-1)

            # Inference
            prediction = model.predict(roi_input, verbose=0)
            score = np.max(prediction)
            label_idx = np.argmax(prediction)
            label = EMOTIONS[label_idx]

            # Visuals
            color = (0, 255, 0) # Green
            if label in ['Angry', 'Disgust', 'Fear', 'Sad']:
                color = (0, 0, 255) # Red for negative
            elif label == 'Neutral':
                color = (255, 255, 0) # Cyan

            # Draw Rect & Label
            cv2.rectangle(frame, (x, y), (x+w, y+h), color, 2)
            cv2.putText(frame, f"{label} ({int(score*100)}%)", (x, y-10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)

            # Terminal Output (Simple logging)
            print(f"\r>> DETECTED: {label.upper()} [{score:.2f}]   ", end="")

        # Compute FPS
        curr_time = time.time()
        fps = 1 / (curr_time - prev_time)
        prev_time = curr_time
        cv2.putText(frame, f"FPS: {int(fps)}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

        # Show Display
        cv2.imshow('Project Spectra: Live Inference', frame)

        # Exit on Q
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Cleanup
    cap.release()
    cv2.destroyAllWindows()
    print("\n🔴 Session Ended.")

if __name__ == "__main__":
    main()
