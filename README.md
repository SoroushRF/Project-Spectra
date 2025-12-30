# 🌌 Project Spectra

## Real-Time, Local-First Adaptive Emotion Intelligence

<p align="center">
  <img src="https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
</p>

---

**Spectra** is a cutting-edge, cross-platform mood detection ecosystem built on the principle of **Client-Side Edge AI**. We prioritize user privacy by processing all biometric data locally, ensuring that high-resolution facial streams never leave the device.

---

## �️ The Full-Spectrum Tech Stack

Our stack is engineered for high-performance inference and cross-platform flexibility.

### 🧠 Intelligence (The Brain)
*   **Language:** `Python 3.12`
*   **Deep Learning:** `TensorFlow 2.15+`, `Keras`

*   **Deployment Formats:** `LiteRT (TFLite)`, `TensorFlow.js (JSON)`
*   **Computer Vision:** `OpenCV`, `MediaPipe Face Mesh`
*   **Data Analysis:** `Pandas`, `NumPy`, `Matplotlib`
*   **Preprocessing:** `Scikit-learn`
*   **Optimization:** `8-bit Post-Training Quantization`

### 💻 Platform: Web (The Shell)
*   **Framework:** `React.js v18`
*   **Runtime:** `Node.js`
*   **Inference Engine:** `@tensorflow/tfjs`, `@tensorflow/tfjs-tflite`
*   **Vision Pipe:** `@mediapipe/face_detection`
*   **Styling:** `Vanilla CSS` (Glassmorphism), `Framer Motion` (Animations)
*   **Storage:** `IndexedDB` (for local weight deltas)
*   **Hosting:** `Vercel`

### 📱 Platform: Mobile (The Body)
*   **Framework:** `Flutter v3.0+`
*   **Language:** `Dart`
*   **Inference Engine:** `tflite_flutter` / `google_mlkit_face_detection`
*   **Image Processing:** `Camera API`, `ImageLib`
*   **Smoothing Algorithm:** `EWMA (Exponentially Weighted Moving Average)`

---

## 🚀 Technical Core

### 1. Custom CNN Architecture
We don't use high-latency, generic APIs. Spectra features a custom 4-layer CNN trained from scratch on the **FER-2013** dataset, optimized for micro-expression detection.

### 2. Client-Side Efficiency
*   **Quantization:** 32-bit to 8-bit weight conversion for **<15MB** model footprints.
*   **Privacy:** 100% On-device processing. No raw frames ever touch a network socket.
*   **On-Device Personalization:** Local SGD (Stochastic Gradient Descent) for user-specific weight updates.

---

## 📂 Project Architecture

```text
ProjectSpectra/
├── � intelligence/         # Soroush's Domain: Model Research & Training
│   ├── data/               # FER-2013 Datasets (Raw/Cleaned)
│   ├── models/             # Final Exports (.tflite, .json, .bin)
│   ├── notebooks/          # Training Experiments & Data Cleaning
│   └── src/                # Preprocessing & Export Logic
├── 🌐 platforms/            # Shervin's Domain: Cross-Platform Shells
│   ├── web/                # React Shell (TensorFlow.js)
│   └── mobile/             # Flutter Shell (LiteRT/TFLite)
├── 📦 shared/               # Universal design assets & branding
├── � master_plan.md        # The project blueprint (Revision 5.0)
└── 🛡️ .gitignore            # Security for biometric data
```

---

<p align="center">
  <b>Built with ❤️ by Soroush & Shervin</b><br>
  <i>"Spectra: See the emotion, keep the privacy."</i>
</p>
