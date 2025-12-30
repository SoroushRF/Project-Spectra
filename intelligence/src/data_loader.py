import os
import cv2
import numpy as np
import tensorflow as tf

# SPECTRA PROTOCOL CONSTANTS
IMG_SIZE = 48
BATCH_SIZE = 128
TRAIN_DIR = os.path.join("intelligence", "data", "archive", "train")
TEST_DIR = os.path.join("intelligence", "data", "archive", "test")

EMOTIONS = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']
LABEL_MAP = {emotion: i for i, emotion in enumerate(EMOTIONS)}

def load_data_from_disk(directory):
    """
    Manually loads images into RAM to bypass Windows Disk I/O bottlenecks.
    """
    images = []
    labels = []
    
    print(f"📂 Loading data from: {directory}")
    for emotion in EMOTIONS:
        emotion_path = os.path.join(directory, emotion)
        if not os.path.exists(emotion_path):
            continue
            
        label = LABEL_MAP[emotion]
        files = [f for f in os.listdir(emotion_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        
        print(f"  - Reading '{emotion}' ({len(files)} files)...")
        for f in files:
            img_path = os.path.join(emotion_path, f)
            # Read as Grayscale
            img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
            if img is not None:
                img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
                images.append(img)
                labels.append(label)
                
    # Convert to NumPy and Normalize
    X = np.array(images, dtype='float32').reshape(-1, IMG_SIZE, IMG_SIZE, 1) / 255.0
    y = tf.keras.utils.to_categorical(np.array(labels), num_classes=len(EMOTIONS))
    
    return X, y

def get_data_generators():
    """
    Spectra 'Total Recall' Mode: Loads entire dataset into RAM.
    """
    print("🧠 Initializing Spectra 'Total Recall' (RAM Binding) Pipeline...")

    # Load everything into memory
    X_train_full, y_train_full = load_data_from_disk(TRAIN_DIR)
    X_test, y_test = load_data_from_disk(TEST_DIR)

    # Manual Validation Split
    from sklearn.model_selection import train_test_split
    X_train, X_val, y_train, y_val = train_test_split(
        X_train_full, y_train_full, test_size=0.2, random_state=42, stratify=y_train_full
    )

    print(f"✅ RAM Loading Complete.")
    print(f"📍 Train: {len(X_train)} | Val: {len(X_val)} | Test: {len(X_test)}")
    
    return (X_train, y_train), (X_val, y_val), (X_test, y_test)

if __name__ == "__main__":
    train, val, test = get_data_generators()
    print(f"🕵️  Memory Usage Check (X_train): {train[0].nbytes / 1e6:.2f} MB")
