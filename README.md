# 🌌 Project Spectra

## Real-Time, Local-First Adaptive Emotion Intelligence

[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.15+-FF6F00?logo=tensorflow&logoColor=white)](https://tensorflow.org)
[![Flutter](https://img.shields.io/badge/Flutter-v3.0+-02569B?logo=flutter&logoColor=white)](https://flutter.dev)
[![React](https://img.shields.io/badge/React-v18+-61DAFB?logo=react&logoColor=black)](https://reactjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

**Spectra** is a cutting-edge, cross-platform mood detection ecosystem built on the principle of **Client-Side Edge AI**. We prioritize user privacy by processing all biometric data locally, ensuring that high-resolution facial streams never leave the device.

---

## 🚀 Technical Core: The Intelligence Stream

Developing a robust emotion engine requires a balance between raw accuracy and hardware constraints. Our approach focuses on two critical pillars:

### 1. The "from-scratch" CNN Architecture 🧠

Unlike generic pre-trained models, Spectra's brain is a custom-engineered **Convolutional Neural Network** trained on the **FER-2013** dataset.

* **Custom Layers:** A 4-layer CNN designed specifically to extract micro-expressions (eye contours, lip curvature).
* **Data Augmentation:** To ensure the AI works in real-world lighting, we use a rigorous augmentation pipeline:
  * `±15°` Rotation & `10%` Zoom for variable camera angles.
  * `±20%` Brightness/Contrast shifts for low-light environments.
  * Horizontal flipping to maintain emotional symmetry.
* **On-Device Personalization:** Using **LiteRT Training Signatures**, our model allows users to correct predictions locally, running a single training epoch on the final layers to adapt to *their* unique face.

### 2. Extreme Client-Side Efficiency ⚡

To achieve sub-100ms inference on browsers and mobile devices, we implemented aggressive optimization:

* **8-bit Quantization:** Reducing weights from 32-bit floats to 8-bit integers, shrinking the model size to **<15MB** without sacrificing precision.
* **Pruning:** Eliminating redundant neural connections to lower the Flops required for each frame.
* **Dual-runtime support:** Seamlessly exporting to `.tflite` for native mobile performance and `.json` for WebGL-accelerated browser inference.

---

## 📂 Project Architecture

The repository is structured to separate the **Intelligence (The Brain)** from the **Platform (The Body)**.

```text
ProjectSpectra/
├── 🧠 intelligence/         # Soroush's Domain: Model Research & Training
│   ├── data/               # FER-2013 Datasets (Raw/Cleaned)
│   ├── models/             # Final Exports (.tflite, .json, .bin)
│   ├── notebooks/          # Training Experiments & Data Cleaning
│   └── src/                # Preprocessing & Export Logic
├── 📱 platforms/            # Shervin's Domain: Cross-Platform Shells
│   ├── web/                # React Shell (TensorFlow.js)
│   └── mobile/             # Flutter Shell (LiteRT/TFLite)
├── 🎨 shared/               # Universal design assets & branding
├── 📄 master_plan.md        # The project blueprint (Revision 5.0)
└── ⚙️ .gitignore            # Security for biometric data
```

---

## 🛠️ The Local-First Workflow

1. **Detection:** MediaPipe identifies the face ROI.
2. **Normalization:** The image is converted to $48 \times 48$ Grayscale.
3. **Inference:** The local model outputs 7 emotional probabilities.
4. **Smoothing:** An **Exponentially Weighted Moving Average (EWMA)** filters "twitchy" results for a fluid UI.
5. **Persistence:** Local weight deltas are saved to `IndexDB` or mobile storage for a truly personalized experience.

---

## 🤝 Collaborative Sync

We operate on a **Stream-Based Branching** model to ensure simultaneous development:

* `stream/intelligence`: Model architecture, training, and 8-bit quantization.
* `stream/interface`: UI/UX, Camera integration, and Smoothing logic.

---

**Built with ❤️ by Soroush & Shervin**  
*"Spectra: See the emotion, keep the privacy."*
