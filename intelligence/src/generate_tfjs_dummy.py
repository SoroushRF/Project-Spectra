import tensorflow as tf
import os
import shutil

# DUMMY MODEL SPECS
INPUT_SHAPE = (1, 48, 48, 1)
NUM_CLASSES = 7
OUTPUT_DIR = os.path.join("intelligence", "models", "tfjs_model")

def generate_tfjs_dummy():
    print("🛠️ Generating TFJS Dummy Model...")
    
    # 1. Create a very simple model
    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(48, 48, 1)),
        tf.keras.layers.Flatten(),
        tf.keras.layers.Dense(NUM_CLASSES, activation='softmax')
    ])
    
    # 2. Save as SavedModel
    temp_saved_model = "temp_saved_model"
    model.save(temp_saved_model)
    
    # 3. Attempt conversion using the CLI (more robust than the API sometimes)
    # We use a system call to bypass Python's buggy import chain if possible
    try:
        import tensorflowjs as tfjs
        # We manually call the conversion logic that doesn't trigger the estimator bug
        # By using the CLI-style entry point directly
        from tensorflowjs.converters import converter
        
        if os.path.exists(OUTPUT_DIR):
            shutil.rmtree(OUTPUT_DIR)
        os.makedirs(OUTPUT_DIR)
        
        # This is the CLI command equivalent: 
        # tensorflowjs_converter --input_format=tf_saved_model [temp] [out]
        converter.dispatch_python_args([
            "--input_format=tf_saved_model",
            temp_saved_model,
            OUTPUT_DIR
        ])
        
        print(f"✅ SUCCESS: TFJS model generated in {OUTPUT_DIR}")
    except Exception as e:
        print(f"❌ FAILED: {e}")
    finally:
        if os.path.exists(temp_saved_model):
            shutil.rmtree(temp_saved_model)

if __name__ == "__main__":
    generate_tfjs_dummy()
