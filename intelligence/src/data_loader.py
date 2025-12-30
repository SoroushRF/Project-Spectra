import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import os

# SPECTRA PROTOCOL CONSTANTS
IMG_SIZE = 48
BATCH_SIZE = 64
TRAIN_DIR = os.path.join("intelligence", "data", "archive", "train")
TEST_DIR = os.path.join("intelligence", "data", "archive", "test")

def get_data_generators():
    """
    Creates the training and validation data generators with the AI Stream Augmentation Protocol.
    """
    print("🚚 Initializing AI Stream Data Pipeline...")

    # 1. Training Augmentation Protocol (Revision 5.0)
    train_datagen = ImageDataGenerator(
        rescale=1./255,          # Normalization protocol
        rotation_range=15,       # ±15 degrees
        zoom_range=0.1,          # 10% zoom
        horizontal_flip=True,    # Symmetry check
        brightness_range=[0.8, 1.2], # ±20% lighting
        validation_split=0.2     # Use 20% of train for dev validation
    )

    # 2. Testing Protocol (Only Rescale, no Augmentation)
    test_datagen = ImageDataGenerator(rescale=1./255)

    # 3. Create the Training Generator
    train_generator = train_datagen.flow_from_directory(
        TRAIN_DIR,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        color_mode="grayscale",
        class_mode="categorical",
        subset="training",
        shuffle=True
    )

    # 4. Create the Validation Generator (Internal)
    val_generator = train_datagen.flow_from_directory(
        TRAIN_DIR,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        color_mode="grayscale",
        class_mode="categorical",
        subset="validation",
        shuffle=True
    )

    # 5. Create the Test Generator (Final Eval)
    test_generator = test_datagen.flow_from_directory(
        TEST_DIR,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        color_mode="grayscale",
        class_mode="categorical",
        shuffle=False
    )

    print(f"✅ Pipeline Configured: {train_generator.num_classes} Emotion Categories Identified.")
    return train_generator, val_generator, test_generator

if __name__ == "__main__":
    # Test run
    train, val, test = get_data_generators()
    print(f"🕵️  Test Batch Shape: {train[0][0].shape}") 
