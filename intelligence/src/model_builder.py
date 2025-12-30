import tensorflow as tf
from tensorflow.keras import layers, models

def build_spectra_cnn(num_classes=7):
    """
    Builds the Project Spectra CNN Architecture:
    A high-performance, 4-layer convolutional network optimized for 
    on-device inference in Flutter and React.
    """
    print("🏗️  Building AI Stream CNN Architecture...")
    
    model = models.Sequential([
        # LAYER 1: Feature Extraction (Edges)
        layers.Conv2D(32, (3, 3), padding='same', activation='relu', input_shape=(48, 48, 1)),
        layers.BatchNormalization(),
        layers.Conv2D(32, (3, 3), padding='same', activation='relu'),
        layers.BatchNormalization(),
        layers.MaxPooling2D(pool_size=(2, 2)),
        layers.Dropout(0.25),

        # LAYER 2: Pattern Extraction (Textures)
        layers.Conv2D(64, (3, 3), padding='same', activation='relu'),
        layers.BatchNormalization(),
        layers.Conv2D(64, (3, 3), padding='same', activation='relu'),
        layers.BatchNormalization(),
        layers.MaxPooling2D(pool_size=(2, 2)),
        layers.Dropout(0.25),

        # LAYER 3: Part Extraction (Eyes, Mouth)
        layers.Conv2D(128, (3, 3), padding='same', activation='relu'),
        layers.BatchNormalization(),
        layers.Conv2D(128, (3, 3), padding='same', activation='relu'),
        layers.BatchNormalization(),
        layers.MaxPooling2D(pool_size=(2, 2)),
        layers.Dropout(0.25),

        # LAYER 4: Final Part Refinement
        layers.Conv2D(256, (3, 3), padding='same', activation='relu'),
        layers.BatchNormalization(),
        layers.MaxPooling2D(pool_size=(2, 2)),
        layers.Dropout(0.25),

        # DENSE LAYERS: Decision Making
        layers.Flatten(),
        layers.Dense(512, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.5),
        
        layers.Dense(256, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.5),

        # OUTPUT: 7-way Softmax
        layers.Dense(num_classes, activation='softmax', name='spectra_output')
    ])

    print("✅ CNN Architecture built.")
    return model

if __name__ == "__main__":
    # Internal visualization of the model
    model = build_spectra_cnn()
    model.summary()
