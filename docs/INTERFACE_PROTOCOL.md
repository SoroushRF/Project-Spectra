# 🛡️ PROJECT SPECTRA: INTERFACE PROTOCOL (The Shervin Guidelines)
**Status:** MANDATORY READ  
**Version:** 1.0 (End of Phase 3)  
**Author:** Intelligence Stream (Soroush)

---

## 1. PROJECT STATE OF THE UNION
We are currently at the **Midpoint Crossroad** of Project Spectra.

### ✅ COMPLETED (The Brain)
The Intelligence Stream has finished its mandate. The "Brain" is trained, optimized, and serialized.
*   **Core Model:** CNN v1.0 (Accuracy: ~59%)
*   **Exports:** TensorFlow.js (Web) and TFLite (Mobile)
*   **Optimization:** Quantized to <2MB / <8MB without accuracy loss.
*   **Logic:** Personalization/Adaptation algorithms defined.

### ⏳ PENDING (The Body)
The Interface Stream (Shervin) has **NOT STARTED**.
*   **Web Platform:** 0%
*   **Mobile Platform:** 0%
*   **Integration:** 0%

---

## 2. THE "IRON GATES" (Strict Boundaries)
To ensure the integrity of the trained model, the following Rules of Engagement are **ABSOLUTE**.

### ⛔ FORBIDDEN ZONES (Read-Only)
**You (Platform Engineer) and your AI Assistant are STRICTLY PROHIBITED from modifying files in:**
*   ❌ `intelligence/*` (Everything)
    *   *Reason:* Changing training scripts or data loaders now will likely break the exported models you are about to use.
*   ❌ `shared/test_assets/*`
    *   *Reason:* These are the "Golden Targets" used to verify your math. Do not touch them.

### ✅ CONSTRUCTION ZONES (Write Access)
You have full autonomy within:
*   ✅ `platforms/web/*` (Build your React app here)
*   ✅ `platforms/mobile/*` (Build your Flutter app here)

---

## 3. THE HANDOFF PACKAGE
We have generated strict documentation for you. **Read them in this order:**

1.  **`docs/handoff_v2.md`**  
    *   *What it is:* The technical manual for the models.
    *   *Use it for:* Getting the exact Model Paths, Input Shapes, and Label Maps.
    *   *CRITICAL:* Requires normalization (`pixel / 255.0`). Failure to normalize = Garbage output.

2.  **`docs/adaptation_logic.md`**  
    *   *What it is:* The algorithm for "Personalization".
    *   *Use it for:* Implementing the "Sensitivity Calibration" feature.
    *   *Constraint:* Do **NOT** attempt backpropagation on the device. CPU usage must remain low. Use the "Ghost Weights" logic defined here.

3.  **`master_plan.md`** (Sections 5 & 6)
    *   *What it is:* The roadmap for Phase 4 (Interface) and Phase 5 (Integration).

---

## 4. INTEGRATION HYGIENE (The "Big No-Nos")

### 💀 1. DO NOT Resize the Model
The model expects `48x48` pixels.
*   **Wrong:** Resizing the model architecture.
*   **Right:** Resizing your *camera feed* to match the model.

### 💀 2. DO NOT "Re-Train"
*   Do not try to load the `.keras` model in Python to "tweak" it.
*   The provided `.tflite` and `.json` files are **Frozen**.
*   Any "learning" must happen via the `adaptation_logic.md` (post-processing multipliers).

### 💀 3. DO NOT Ignore Grayscale
*   The webcams give you RGB (3 channels).
*   The model eats Grayscale (1 channel).
*   **Rule:** You MUST convert RGB -> Gray -> Normalize (0-1) before inference.

### 💀 4. DO NOT Process "Pitch Black" Frames
*   **Discovery:** In low light (Black Screen), the model tends to default to "Angry" (or 0-index).
*   **Fix:** Check average pixel brightness before inference.
*   **Rule:** If `avg_brightness < 20` (out of 255), display "Too Dark" and skip inference.

---

## 5. YOUR MISSION (Phase 4 Tasks)

### Task 4.1: The Mirror (Web)
1.  Initialize `platforms/web` (React/Next.js/Vite).
2.  Install `tensorflow/tfjs`.
3.  Load `/models/model.json`.
4.  Feed it the webcam stream (Mirrored!).
5.  Display the raw probabilities in a debug panel.

### Task 4.2: The Mirror (Mobile)
1.  Initialize `platforms/mobile` (Flutter).
2.  Install `tflite_flutter`.
3.  Load `assets/spectra_model.tflite`.
4.  Achieve >30 FPS inference on a standard phone.

### Task 4.3: The Adaptation
1.  Implement the `user_profile.json` logic.
2.  Create the "Sensitivity Calibration" UI ("Show me a surprised face!").
3.  Prove that the "Neutral Bias" is gone for your face.

---

**Signed,**  
*The Intelligence Stream*
