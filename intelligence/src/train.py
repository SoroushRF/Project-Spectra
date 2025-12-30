import tensorflow as tf
from data_loader import get_data_generators
from model_builder import build_spectra_cnn
import os

# TRAINING CONFIG
EPOCHS = 50
LR = 0.001
MODELS_DIR = os.path.join("intelligence", "models")
os.makedirs(MODELS_DIR, exist_ok=True)

def train_spectra_model():
    print("🔥 Starting AI Stream Training Session...")

    # 1. Pipeline Hook
    train_gen, val_gen, test_gen = get_data_generators()

    # 2. Model Hook
    model = build_spectra_cnn(num_classes=7)

    # 3. Compilation
    optimizer = tf.keras.optimizers.Adam(learning_rate=LR)
    model.compile(
        optimizer=optimizer,
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    # 4. Callbacks: Safety & Savings
    callbacks = [
        # Save the best weights automatically
        tf.keras.callbacks.ModelCheckpoint(
            filepath=os.path.join(MODELS_DIR, "spectra_best_model.h5"),
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1
        ),
        # Stop training if it plateaus (Privacy-friendly compute)
        tf.keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=5,
            restore_best_weights=True,
            verbose=1
        ),
        # Dynamic Learning Rate
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.2,
            patience=3,
            min_lr=0.00001,
            verbose=1
        )
    ]

    # 5. EXECUTION: The Convergence Loop
    print(f"📈 Training on {train_gen.samples} images...")
    history = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=EPOCHS,
        callbacks=callbacks
    )

    # 6. Evaluation
    print("\n🏁 Final Evaluation on Test Set:")
    test_loss, test_acc = model.evaluate(test_gen)
    print(f"📊 Final Accuracy: {test_acc:.2%}")


    # 7. Local Export
    model.save(os.path.join(MODELS_DIR, "spectra_final_model.h5"))
    print(f"✅ Training Session Complete. Final model saved to {MODELS_DIR}")

if __name__ == "__main__":
    train_spectra_model()
