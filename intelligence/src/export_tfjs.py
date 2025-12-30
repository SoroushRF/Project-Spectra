import json
import numpy as np
import os
import tensorflow as tf

# Paths
INPUT_MODEL = os.path.join("intelligence", "models", "spectra_best_model.keras")
OUT_DIR = os.path.join("platforms", "web", "public", "models")
os.makedirs(OUT_DIR, exist_ok=True)

print(f"🧠 Loading {INPUT_MODEL}...")
model = tf.keras.models.load_model(INPUT_MODEL)

# Prepare buffers
weight_data = bytearray()
weights_list = [] # For manifest
total_bytes = 0

print("🔧 Extracting weights manually...")

for layer in model.layers:
    if not layer.weights:
        continue
    
    # Get values (numpy) and variables (names)
    layer_values = layer.get_weights()
    layer_vars = layer.weights
    
    if len(layer_values) != len(layer_vars):
        print(f"⚠️  Mismatch in {layer.name}: {len(layer_values)} values vs {len(layer_vars)} vars")
        # Fallback: trust get_weights logic and construct names if possible, but for now just skip/warn
        continue

    for val, var in zip(layer_values, layer_vars):
        # Clean name: remove :0 and potentially layer prefix if duplicated
        # Keras 3 names might be like 'conv2d/kernel:0'
        # TFJS expects specific names matching topology. 
        # Usually 'layer_name/kernel', 'layer_name/bias' works.
        
        # We use the variable name but sanitize it
        clean_name = var.name.split(":")[0]
        
        # Ensure float32 (TFJS standard)
        val_f32 = val.astype(np.float32)
        
        # Add to manifest list
        weights_list.append({
            "name": clean_name,
            "shape": list(val_f32.shape), # Convert tuple to list for JSON
            "dtype": "float32"
        })
        
        # Add bytes
        b = val_f32.tobytes()
        weight_data.extend(b)
        total_bytes += len(b)
        print(f"   + {clean_name} {val_f32.shape}")

# Write binary shard
shard_name = "group1-shard1of1.bin"
shard_path = os.path.join(OUT_DIR, shard_name)
with open(shard_path, "wb") as f:
    f.write(weight_data)

print(f"📦 Wrote binary shard: {total_bytes/1024/1024:.2f} MB")

# Construct model.json
config = model.get_config()

model_json = {
    "format": "layers-model",
    "generatedBy": "Spectra Manual Export",
    "convertedBy": "Soroush",
    "modelTopology": {
        "class_name": "Sequential",
        "config": config,
        "keras_version": tf.keras.__version__,
        "backend": "tensorflow"
    },
    "weightsManifest": [
        {
            "paths": [shard_name],
            "weights": weights_list
        }
    ]
}

idx_path = os.path.join(OUT_DIR, "model.json")
with open(idx_path, "w") as f:
    json.dump(model_json, f, indent=2)

print(f"✅ Success! TFJS model generated at {OUT_DIR}")
