# 📦 Integration Memo: Phase 1 (Dummy Brain)
**Handoff Version:** 1.0  
**Status:** READY FOR PIPELINE TEST

To: **Shervin (Platform)**  
From: **Soroush (Intelligence)**

### 1. Asset Locations
*   **Flutter (Mobile):** `platforms/mobile/assets/spectra_dummy_model.tflite`
*   **React (Web):** `platforms/web/public/models/model.json` (and binary shards)

### 2. The Integration Handshake (Non-Negotiable)
To avoid "Inference Error" or garbage results, ensure your image processing pipeline matches these specs exactly:

| Property | Requirement |
| :--- | :--- |
| **Input Shape** | `[1, 48, 48, 1]` (Batch, Height, Width, Grayscale) |
| **Data Type** | `Float32` |
| **Normalization** | Pixel values must be divided by `255.0` (Scale: 0.0 to 1.0) |
| **Labels (Indices)** | `0:Angry, 1:Disgust, 2:Fear, 3:Happy, 4:Sad, 5:Surprise, 6:Neutral` |

### 3. Verification Test
If your pipeline is correct, passing a **pure white** image ($48 \times 48$ pixels of $1.0$) should return a stable probability array. If the app crashes or returns an array of size other than 7, check the tensor resizing logic.

---
*Next: Moving to Phase 2 (Real Training) once you confirm the webcam -> model bridge is green.*
