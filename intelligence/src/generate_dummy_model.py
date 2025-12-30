import tensorflow as tf
import os
import subprocess

# Define the model parameters based on The Spectra Bible (Revision 5.0)
INPUT_SHAPE = (1, 48, 48, 1)
NUM_CLASSES = 7
MODEL_NAME = "spectra_dummy_model"
OUTPUT_DIR = os.path.join("intelligence", "models")

def create_and_export_dummy_model():
    print("🚀 Starting Dummy Model Generation...")
    
    # 1. Build a tiny "Dummy" Model that detects pixel brightness
    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(48, 48, 1), name='input_layer'),
        tf.keras.layers.GlobalAveragePooling2D(),
        tf.keras.layers.Dense(NUM_CLASSES, activation='softmax', name='output_layer')
    ])
    
    # Compile with dummy loss
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    
    print("✅ Dummy Model architecture built.")
    
    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # 2. Export to native Keras (.h5) for archival
    h5_path = os.path.join(OUTPUT_DIR, f"{MODEL_NAME}.h5")
    model.save(h5_path)
    print(f"✅ Saved Keras model to: {h5_path}")
    
    # 3. Export to LiteRT (TFLite) for Flutter
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    tflite_model = converter.convert()
    tflite_path = os.path.join(OUTPUT_DIR, f"{MODEL_NAME}.tflite")
    
    with open(tflite_path, "wb") as f:
        f.write(tflite_model)
    print(f"✅ Saved TFLite model to: {tflite_path}")
    
    # 4. Export to TensorFlow.js (JSON) for React
    tfjs_output_dir = os.path.join(OUTPUT_DIR, "tfjs_model")
    os.makedirs(tfjs_output_dir, exist_ok=True)
    
    print("📡 Converting to TensorFlow.js...")
    try:
        import tensorflowjs as tfjs
        tfjs.converters.save_keras_model(model, tfjs_output_dir)
        print(f"✅ Saved TFJS model to: {tfjs_output_dir}")
    except Exception as e:
        print(f"❌ TFJS Conversion failed: {e}")

if __name__ == "__main__":
    create_and_export_dummy_model()
