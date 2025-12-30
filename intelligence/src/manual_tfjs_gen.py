import json
import numpy as np
import os

# Create the TFJS directory
OUT_DIR = os.path.join("intelligence", "models", "tfjs_model")
os.makedirs(OUT_DIR, exist_ok=True)

# 1. Define the model.json (Minimal standard for a single layer model)
# This mimics what TFJS expects for a basic Sequential model
model_json = {
    "format": "layers-model",
    "generatedBy": "Spectra Manual Generator",
    "convertedBy": "Lead AI Engineer",

    "modelTopology": {
        "class_name": "Sequential",
        "config": {
            "name": "sequential",
            "layers": [
                {
                    "class_name": "InputLayer",
                    "config": {
                        "batch_input_shape": [None, 48, 48, 1],
                        "dtype": "float32",
                        "sparse": False,
                        "name": "input_layer"
                    }
                },
                {
                    "class_name": "Flatten",
                    "config": {"name": "flatten", "trainable": True}
                },
                {
                    "class_name": "Dense",
                    "config": {
                        "name": "output_layer",
                        "trainable": True,
                        "units": 7,
                        "activation": "softmax",
                        "use_bias": True,
                        "kernel_initializer": {"class_name": "GlorotUniform", "config": {"seed": None}},
                        "bias_initializer": {"class_name": "Zeros", "config": {}}
                    }
                }
            ]
        },
        "keras_version": "2.15.0",
        "backend": "tensorflow"
    },
    "weightsManifest": [
        {
            "paths": ["group1-shard1of1.bin"],
            "weights": [
                {"name": "output_layer/kernel", "shape": [2304, 7], "dtype": "float32"},
                {"name": "output_layer/bias", "shape": [7], "dtype": "float32"}
            ]
        }
    ]
}

with open(os.path.join(OUT_DIR, "model.json"), "w") as f:
    json.dump(model_json, f, indent=2)

# 2. Generate random weights to fill the buffer
# Flatten(48,48,1) = 2304 inputs. Dense(7) = 2304 * 7 weights + 7 biases.
kernel = np.random.randn(2304, 7).astype(np.float32)
bias = np.zeros(7).astype(np.float32)

with open(os.path.join(OUT_DIR, "group1-shard1of1.bin"), "wb") as f:
    f.write(kernel.tobytes())
    f.write(bias.tobytes())

print(f"✅ MANUALLY GENERATED TFJS MODEL IN: {OUT_DIR}")
