# Spectra Performance Lab: Implementation Plan

This document outlines the roadmap for benchmarking and optimizing Project Spectra's GPU-accelerated AI across Web (Desktop/Mobile) and its future integration into Flutter.

---

## **Phase 1: Core Metrics Engine (Web Foundations)**
*Goal: Establish high-precision measurement for every stage of the AI pipeline.*

### **Task 1: The Instrumentation Wrapper**
- [x] **1.1: Create `usePerformanceMonitor` Hook:** A centralized logic hub for tracking frame-by-frame data.
- [x] **1.2: AI Pipeline Timing:** Wrap `detector.estimateFaces` and `model.predict` with `performance.now()` high-resolution timestamps.
- [x] **1.3: Memory Tracking:** Integrate `tf.memory()` calls to track active tensor count and GPU VRAM footprint.
- [x] **1.4: Sliding Window Averaging:** Implement a 60-frame rolling average for FPS and Latency to provide stable, readable data.

- [ ] **2.1: Preprocessing Audit:** Measure the cost of `tf.browser.fromPixels`, cropping, and grayscale conversion.
- [ ] **2.2: CPU-GPU Sync Latency:** Measure the "blocking" time where the CPU waits for the GPU to return results.
- [ ] **2.3: Resolution Decoupling (Critical Fix):** Implement an off-screen fixed-size canvas (640x480) to decouple AI performance from window size.

---

## **Phase 2: Mobile-First Optimization & Adaptive Logic**
*Goal: Ensure the app remains responsive on thermal-constrained and battery-saving devices.*

### **Task 3: Thermal & Power Awareness**
- [ ] **3.1: Thermal Throttling Detection:** Log performance trends over a 5-minute window; identify if FPS decays as heat increases.
- [ ] **3.2: Low-Power Mode Detection:** Detect if the browser is capping the requestAnimationFrame (e.g., 30FPS cap on iOS Power Save).
- [ ] **3.3: Hardware Fingerprinting:** Capture device model, OS, and GPU Renderer (e.g., Apple GPU vs Adreno) to categorize performance tiers.

### **Task 4: The Adaptive Controller**
- [ ] **4.1: Dynamic Resolution Scaling:** Implement logic to swap internal input resolution (e.g. 480p down to 320p) if inference slows down.
- [ ] **4.2: Decoupled AI Loops:** Allow the UI to run at 60FPS while the AI loop runs at 30FPS internally.

---

## **Phase 3: Hardware Monitor HUD (The "Pulse" View)**
*Goal: Provide a premium, real-time visualization of system health.*

### **Task 5: The Debug Overlay**
- [ ] **5.1: Premium Glassmorphic UI:** A sleek, semi-transparent dashboard for real-time metrics.
- [ ] **5.2: Sparkline Visualization:** Mini-graphs showing Latency "spikes" and FPS stability.
- [ ] **5.3: Interactive Toggles:** Add a "Stress Test" button to run the AI at maximum possible speed (ignoring VSync).
- [ ] **5.4: Keyboard/Gesture Trigger:** Toggle HUD visibility (Desktop: `~` key, Mobile: Triple-tap).

---

## **Phase 4: Telemetry & Reporting**
*Goal: Collect "Lab Results" from real-world mobile testing.*

### **Task 6: Session Reporting**
- [ ] **6.1: Export Performance Report:** Generate a shareable JSON/CSV including hardware specs and median latencies.
- [ ] **6.2: Pulse Check Persistence:** Save "Personal Best" (lowest latency) to LocalStorage to detect performance regressions after code updates.

---

## **Phase 5: Flutter / Native Blueprinting**
*Goal: Bridge the gap between Web performance and Native speed.*

### **Task 7: The Flutter Mirror**
- [ ] **7.1: Dart Metric Standard:** Define a shared `SpectraMetric` class in Dart to match the Web implementation.
- [ ] **7.2: Isolate Latency Tracking:** Measure time spent moving image data between the Camera Isolate and the AI Isolate.
- [ ] **7.3: GPU Delegate Benchmark:** Create a test suite to compare TFLite "Metal/Vulkan" delegate performance vs the WebGL baseline.
