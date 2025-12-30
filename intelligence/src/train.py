import tensorflow as tf
from data_loader import get_data_generators
from model_builder import build_spectra_cnn
import os

# PERFORMANCE CONFIG
EPOCHS = 100
BATCH_SIZE = 128 # The i7 Sweet Spot
LR = 0.0005      # Lowering LR for fine-tuning during resume

MODELS_DIR = os.path.join("intelligence", "models")
os.makedirs(MODELS_DIR, exist_ok=True)

def train_spectra_model():
    print("🔥 Starting Parallel CPU-Saturating Training...")

    # 1. Load Data into RAM
    (X_train, y_train), (X_val, y_val), (X_test, y_test) = get_data_generators()

    # 2. Parallel Augmentation Pipeline
    augment_layer = tf.keras.Sequential([
        tf.keras.layers.RandomFlip("horizontal"),
        tf.keras.layers.RandomRotation(0.1),
        tf.keras.layers.RandomZoom(0.1),
    ])

    def augment_fn(x, y):
        return augment_layer(x, training=True), y

    # Efficient tf.data Pipeline
    train_ds = tf.data.Dataset.from_tensor_slices((X_train, y_train))
    train_ds = train_ds.shuffle(len(X_train)).batch(BATCH_SIZE)
    train_ds = train_ds.map(augment_fn, num_parallel_calls=tf.data.AUTOTUNE)
    train_ds = train_ds.prefetch(buffer_size=tf.data.AUTOTUNE)

    val_ds = tf.data.Dataset.from_tensor_slices((X_val, y_val)).batch(BATCH_SIZE).prefetch(tf.data.AUTOTUNE)
    test_ds = tf.data.Dataset.from_tensor_slices((X_test, y_test)).batch(BATCH_SIZE).prefetch(tf.data.AUTOTUNE)

    # 3. Model Logic (New or Resume)
    BEST_MODEL_PATH = os.path.join(MODELS_DIR, "spectra_best_model.keras")
    
    if os.path.exists(BEST_MODEL_PATH):
        print(f"♻️  RESUMING: Loading existing best model from {BEST_MODEL_PATH}")
        model = tf.keras.models.load_model(BEST_MODEL_PATH)
    else:
        print("🆕 STARTING FRESH: Building new CNN.")
        model = build_spectra_cnn(num_classes=7)
        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=LR),
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )


    # 4. Callbacks
    callbacks = [
        tf.keras.callbacks.ModelCheckpoint(
            filepath=os.path.join(MODELS_DIR, "spectra_best_model.keras"),
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1
        ),
        tf.keras.callbacks.EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True),
        tf.keras.callbacks.ReduceLROnPlateau(monitor='val_loss', factor=0.2, patience=5)
    ]

    # 5. EXECUTION
    print(f"📈 Parallel Dispatch Initialized. Saturing i7 cores...")
    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS,
        callbacks=callbacks
    )

    # 6. Evaluation
    print("\n🏁 Final Evaluation:")
    model.evaluate(test_ds)
    model.save(os.path.join(MODELS_DIR, "spectra_final_model.keras"))

if __name__ == "__main__":
    train_spectra_model()
