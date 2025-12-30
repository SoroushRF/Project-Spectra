import cv2
import numpy as np
import tensorflow as tf
import time
import os

# CONFIGURATION
MODEL_PATH = os.path.join("intelligence", "models", "spectra_dummy_model.tflite")
LABELS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
INTERVAL = 2  # Seconds

def run_pipeline_test():
    print("🎬 Initializing Project Spectra: Terminal Mood Tracker...")
    
    # 1. Load the TFLite Model
    try:
        interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
        interpreter.allocate_tensors()
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        print(f"✅ Model Loaded: {MODEL_PATH}")
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        return

    # 2. Access Webcam
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Error: Could not open webcam.")
        return
    
    print(f"🚀 Tracking started. Updating every {INTERVAL}s. Press Ctrl+C to stop.\n")

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("❌ Failed to grab frame.")
                break

            # --- PREPROCESSING PER PROTOCOL ---
            
            # Step A: Convert to Grayscale
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Step B: Center Crop & Resize to 48x48
            # (In production, this is done after face detection)
            h, w = gray.shape
            size = min(h, w)
            start_h = (h - size) // 2
            start_w = (w - size) // 2
            cropped = gray[start_h:start_h+size, start_w:start_w+size]
            resized = cv2.resize(cropped, (48, 48))
            
            # Step C: Normalize (0 to 1.0)
            normalized = resized.astype(np.float32) / 255.0
            
            # Step D: Reshape for Model [1, 48, 48, 1]
            input_tensor = np.expand_dims(np.expand_dims(normalized, axis=0), axis=-1)

            # --- INFERENCE ---
            interpreter.set_tensor(input_details[0]['index'], input_tensor)
            interpreter.invoke()
            predictions = interpreter.get_tensor(output_details[0]['index'])[0]
            
            # Get max prediction
            top_index = np.argmax(predictions)
            emotion = LABELS[top_index]
            confidence = predictions[top_index]

            # --- OUTPUT ---
            timestamp = time.strftime("%H:%M:%S")
            print(f"[{timestamp}] Mood: {emotion:<10} | Confidence: {confidence:.2%}")
            
            # Wait for interval
            time.sleep(INTERVAL)

    except KeyboardInterrupt:
        print("\n🛑 Tracking stopped by user.")
    finally:
        cap.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    run_pipeline_test()
