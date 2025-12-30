# Project Spectra: Handoff v2 (Phase 3 Release)

**Date:** 2025-12-30  
**From:** Soroush (Intelligence)  
**To:** Shervin (Platform)  

---

## 📦 Delivered Assets

We have successfully trained, quantized, and exported the "Spectra Brain" (v1.0) for both Web and Mobile.

| Platform | Format | Location | Size | Accuracy |
| :--- | :--- | :--- | :--- | :--- |
| **Web** | TensorFlow.js | `platforms/web/public/models/` | **7.3 MB** | 58.7% |
| **Mobile** | TFLite (Int8) | `platforms/mobile/assets/spectra_model.tflite` | **1.8 MB** | ~58% |

---

## 🧠 Model Specifications (The "Golden Handshake")

Both models share the exact same I/O contract.

### **Input**
- **Shape:** `[1, 48, 48, 1]` (Batch, Height, Width, Channels)
- **Color:** Grayscale (0-255 mapped to 0.0-1.0)
- **Normalization:** `pixel / 255.0` (Mandatory)

### **Output**
- **Shape:** `[1, 7]` (7 probabilities summing to 1.0)
- **Labels Map:**
  ```javascript
  const EMOTIONS = [
    'Angry',    // 0
    'Disgust',  // 1
    'Fear',     // 2
    'Happy',    // 3
    'Neutral',  // 4
    'Sad',      // 5
    'Surprise'  // 6
  ];
  ```

---

## 💻 Web Implementation (React)

```javascript
// 1. Load the model
const model = await tf.loadLayersModel('/models/model.json');

// 2. Predict (Preprocessing)
const tensor = tf.tidy(() => {
  return tf.browser.fromPixels(videoElement, 1) // 1 channel = grayscale
    .resizeBilinear([48, 48])
    .toFloat()
    .div(255.0) // Normalize!
    .expandDims(0);
});

// 3. Inference
const prediction = model.predict(tensor);
const scores = await prediction.data();
```

---

## 📱 Mobile Implementation (Flutter)

```dart
// 1. Load (tflite_flutter)
final interpreter = await Interpreter.fromAsset('assets/spectra_model.tflite');

// 2. Input Buffer (Float32 [1, 48, 48, 1])
var input = List.filled(1 * 48 * 48 * 1, 0.0).reshape([1, 48, 48, 1]);

// ... fill input with grayscale bytes / 255.0 ...

// 3. Output Buffer
var output = List.filled(1 * 7, 0.0).reshape([1, 7]);

// 4. Run
interpreter.run(input, output);
// output[0] contains the 7 scores
```

---

## ⚠️ Critical Notes
1. **Mirroring:** Ensure the camera feed is mirrored naturally, but the *inference* image should match the user's face.
2. **Lighting:** The model was trained with brightness augmentation, but extreme darkness will reduce accuracy.
3. **Threshold:** If the highest score is `< 0.4`, consider displaying "Analyzing..." or "Unknown".

**Signed:** Lead AI Engineer
