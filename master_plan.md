# 📕 THE SPECTRA BIBLE: ARCHITECTURAL SPECIFICATIONS & ENCYCLOPEDIA

**Project:** Spectra (Local-First Adaptive Emotion Intelligence)
**Architects:** Soroush (Intelligence) & Shervin (Platform)
**Revision:** 5.0 (Absolute Detail)

---

## 1. THE FOUNDATIONAL THEORY: CLIENT-SIDE EDGE AI

Spectra is built on the principle of **Client-Side Inference**. Traditional AI sends video to a server; Spectra downloads the "Brain" to the user's hardware.

### 1.1 The Privacy Paradox

By running inference in the browser (React/TFJS) or natively (Flutter/TFLite), we ensure that the **Biometric Data Stream** never touches a network socket. This bypasses GDPR/CCPA storage risks entirely.

### 1.2 Performance Bottlenecks

* **Web:** Limited by WebGL/WebGPU overhead.
* **Native:** Limited by CPU/GPU thermal throttling on mobile (Android).
* **Solution:** Soroush must prioritize "Model Pruning" and Shervin must prioritize "Frame Skipping" (running inference every 3rd frame while the UI renders at 60fps).

---

## 2. THE SOROUSH PROTOCOL: INTELLIGENCE DESIGN (THE BRAIN)

Soroush is responsible for the **Latent Space** of the model. If the model cannot distinguish between a "smirk" and a "scowl," the project fails.

### 2.1 Dataset Engineering (FER-2013+)

* **Standardization:** Soroush must clean the FER-2013 dataset. It contains "noise" (cartoons or poorly cropped faces).
* **Augmentation Strategy:** To make the model robust, Soroush will apply:
  * **Rotation:** ±15 degrees.
  * **Zoom:** 10% (simulating users sitting closer/further).
  * **Brightness/Contrast:** ±20% (simulating bad lighting).
  * **Horizontal Flip:** Because emotions are largely symmetrical.

### 2.2 CNN Architecture Depth

The model is a **Convolutional Neural Network**.

* **Layer 1-2:** Feature Extraction (Edges, textures).
* **Layer 3-4:** Part extraction (Eyes, mouth curves).
* **Dense Layers:** Decision making.
* **Final Layer:** 7-way Softmax output.

### 2.3 On-Device Training (The Holy Grail)

Soroush must export the model with **LiteRT Training Signatures**.

* **Unlocked Layers:** Only the final `Dense` layer and `Softmax` layer are trainable.
* **Optimizer:** SGD (Stochastic Gradient Descent) is used on-device for simplicity and speed.

---

## 3. THE SHERVIN PROTOCOL: PLATFORM DESIGN (THE BODY)

Shervin is responsible for the **Inference Pipeline**. If the camera feed is laggy, the AI feels broken.

### 3.1 The "Eye" (MediaPipe Integration)

Shervin must implement a high-speed detection loop.

* **Web:** Use the `@mediapipe/face_detection` package.
* **Native:** Use `google_mlkit_face_detection`.
* **Process:** 1. Capture 1080p stream.
    2. Extract Face ROI (Region of Interest).
    3. Crop to 1:1 Square.
    4. **Critical:** Downsample to $48 \times 48$ using Bi-linear Interpolation.

### 3.2 The Smoothing Logic (EWMA)

AI output is "twitchy." Shervin must implement an **Exponentially Weighted Moving Average**:
$$\text{Filtered\_Score}_t = \alpha \cdot \text{Raw\_Score}_t + (1 - \alpha) \cdot \text{Filtered\_Score}_{t-1}$$
*Where $\alpha$ (alpha) is typically 0.2 to 0.4.*

### 3.3 The Local Filing Cabinet (Storage)

Shervin must manage the **Weight Deltas**.

* **Format:** A `.bin` or `.json` file containing only the weights for the final layer.
* **Logic:** On startup, load the base model, then "inject" the saved user weights.

---

## 4. THE INTEGRATION CONTRACT (THE HANDSHAKE)

Soroush and Shervin must agree on this **Tensor Format** or the model will output gibberish.

| Property | Value | Why? |
| :--- | :--- | :--- |
| **Tensor Shape** | `[1, 48, 48, 1]` | 1 image, height, width, 1 color channel. |
| **DType** | `float32` | Standard for neural network math. |
| **Normalization** | $x / 255.0$ | Maps 0-255 pixels to 0.0-1.0. |
| **Labels** | 0-6 | Fixed order: Angry, Disgust, Fear, Happy, Sad, Surprise, Neutral. |

---

## 5. PHASE-BY-PHASE EXECUTION GUIDE

### Phase 1: The "Pipeline" Proof (Soroush & Shervin)

* **Soroush:** Exports a "Dummy" model that just detects if a pixel is bright or dark.
* **Shervin:** Sets up Flutter and React. Proves he can send a $48 \times 48$ grayscale crop from the webcam to the dummy model and get *any* result back.
* **Target:** Establish communication across all 4 platforms (Web, Win, Mac, Android).

### Phase 2: The "Intelligence" Drop (Soroush)

* **Soroush:** Trains the real CNN. Optimizes for **Quantization** (converting weights from 32-bit to 8-bit) to shrink the model for Shervin.
* **Shervin:** Implements the Neon UI. Displays the "Confidence Bar" (e.g., Happy 85%).
* **Target:** A functional, non-adaptive detector.

### Phase 3: The "Personalization" (Shervin & Soroush)

* **Soroush:** Provides the `train` signature.
* **Shervin:** Connects the "Personalization Toggle."
    * If user clicks "I'm not Sad, I'm Neutral," Shervin triggers the training loop.
* **Target:** The final Spectra App.

---

## 6. DISASTER RECOVERY & HUDDLES

* **Problem:** Model works in Python but not in React.
    * **Check:** Is Shervin using RGB instead of Grayscale? Is the normalization $/255.0$ missing?
* **Problem:** Android app crashes after 5 minutes.
    * **Check:** Shervin is likely not disposing of the `CameraImage` buffer. Memory leak.
* **Problem:** Model says "Happy" when the user is crying.
    * **Check:** Soroush needs to check the "Sad" class in FER-2013 for bad data samples.

---

## 7. HOSTING & PACKAGING (THE FINAL DELIVERY)

*   **Web:** Shervin pushes React `build/` to **Vercel**.
*   **Android:** Shervin builds the `.apk` using `flutter build apk --split-per-abi`.
*   **Windows/Mac:** Shervin builds the `.exe` and `.app`.
*   **Distribution:** Soroush and Shervin upload all binaries to **GitHub Releases v1.0**.

---

## 8. THE GITHUB SYNC PROTOCOL (COLLABORATION)

To prevent merge conflicts between the Intelligence and Interface streams, we will use a **Branch-Per-Stream** strategy.

### 8.1 Branching Rules

* **`main`**: The "Holy" branch. Only contains verified, working code.
* **`stream/intelligence`**: Soroush’s workspace. For data cleaning, training, and export scripts.
* **`stream/interface`**: Shervin’s workspace. For Flutter and React UI code.
* **`feat/*`**: Temporary branches for specific features (e.g., `feat/ewma-logic`).

### 8.2 Push/Merge Workflow

1. **Work on your stream branch.**
2. **Model Handoff:** When Soroush finishes a model, he pushes it to `intelligence/models/`.
3. **Cross-Check:** Shervin pulls `intelligence/models/` into the `interface` branch to test.

4. **The Great Merge:** Once Phase 1/2/3 is complete, merge both streams into `main`.

### 8.3 Git LFS (Large File Storage)

Since `.h5` and `.tflite` files can be large, we must use **Git LFS** to track files in the `intelligence/models/` directory to keep the repository snappy.

---

## 9. UNIVERSAL DIRECTORY ARCHITECTURE

This structure is designed to isolate the Python environment from the Mobile/Web frameworks while keeping shared assets accessible.

```text
ProjectSpectra/
├── .github/                # GitHub Actions & CI/CD workflows
├── intelligence/           # THE BRAIN (Soroush's domain)
│   ├── data/               # FER-2013 (Raw/Cleaned/Augmented)
│   ├── models/             # EXPORTS (.tflite, .json, .h5, .bin)
│   ├── notebooks/          # Training Experiments (Jupyter)
│   ├── src/                # Preprocessing & Export Scripts
│   └── requirements.txt    # Python Dependencies
├── platforms/              # THE BODY (Shervin's domain)
│   ├── web/                # React Shell (TensorFlow.js)
│   │   ├── public/         # Static assets + Symlink to models/
│   │   ├── src/            # Components, Hooks, Inference Logic
│   │   └── package.json
│   └── mobile/             # Flutter Shell (LiteRT/TFLite)
│       ├── assets/         # Embedded Model Files
│       ├── lib/            # Viewfinders, UI, Smoothing Logic
│       └── pubspec.yaml
├── shared/                 # Universal assets (App Icons, Branding)
├── docs/                   # Visual design specs & diagrams
├── .gitignore              # Global rules (ignores .env, datasets, weights)
├── README.md               # Summary for external viewers
└── master_plan.md          # THIS BIBLE
```
