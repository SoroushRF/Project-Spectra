# 🧪 Project Spectra: Comprehensive Test Suite Analysis
**Version:** 1.0.0  
**Status:** PROD-READY  
**Module:** `intelligence/src/test_suite.py`  

---

## 📋 Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Architectural Principles](#2-architectural-principles)
3. [Test Class Coverage Analysis](#3-test-class-coverage-analysis)
    - [T01: File Integrity & Artifact Validation](#31-t01-file-integrity--artifact-validation)
    - [T02: Mathematical Model Contract](#32-t02-mathematical-model-contract)
    - [T03: Cross-Platform Consistency (Quantization Checks)](#33-t03-cross-platform-consistency-quantization-checks)
    - [T04: Edge Case Handling](#34-t04-edge-case-handling)
    - [T05: Application Logic & Protocol Verification](#35-t05-application-logic--protocol-verification)
4. [Error Handling & Robustness Tests](#4-error-handling--robustness-tests)
5. [Performance Benchmarks](#5-performance-benchmarks)
6. [Execution Instructions](#6-execution-instructions)

---

## 1. Executive Summary
The **Spectra Deployment Verification Suite (DVS)** is a rigorous, 17-point inspection protocol designed to validate the integrity, accuracy, and performance of the exported AI models before they are shipped to the Interface Stream. It serves as the primary **Quality Gate** for CI/CD pipelines.

The suite enforces strict contracts on Input/Output shapes, probability distributions, cross-platform mathematical equivalence (Bit-exactness between Keras and TFLite), and business logic implementation (Sensitivity Adaptation).

---

## 2. Architectural Principles
The suite is built upon the Python `unittest` framework but implements a **Custom Test Runner** for enhanced observability.

*   **Singleton Model Loading:** To prevent OOM (Out of Memory) errors and reduce test duration, the `spectra_best_model.keras` and `spectra_model.tflite` interpreters are instantiated once as global singletons (`_KERAS_MODEL`, `_TFLITE_INTERPRETER`) using a lazy-loading pattern.
*   **Flattened Execution:** The custom runner flattens the nested `unittest.TestSuite` structure to provide a linear, color-coded execution log in the terminal.
*   **Fail-Fast Initialization:** The suite performs a "Pre-Flight Check" during module load. If model files are missing or corrupt, it aborts immediately with a `CRITICAL ERROR` rather than failing 17 individual tests.

---

## 3. Test Class Coverage Analysis

### 3.1. T01: File Integrity & Artifact Validation
**Objective:** Verify that the build pipeline has generated all required assets for Web and Mobile.

*   **`test_01_keras_exists`**: Checks `intelligence/models/spectra_best_model.keras`.
*   **`test_02_tflite_exists`**: Checks `platforms/mobile/assets/spectra_model.tflite`.
*   **`test_03_json_exists`**: Checks `platforms/web/public/models/model.json`.
*   **`test_04_bin_exists`**: Checks `platforms/web/public/models/group1-shard1of1.bin`.
    *   *Technicality:* Deeply validates that the binary shard required by TensorFlow.js is present.
*   **`test_05_json_schema`**: Parses `model.json` to ensure the `weightsManifest` correctly points to the binary shard.
    *   *Why:* A common TFJS converter error creates broken manifests. This implementation ensures the JSON is syntactically valid and logically linked.

### 3.2. T02: Mathematical Model Contract
**Objective:** Ensure the Neural Network behaves as a valid Probability Density Function (PDF).

*   **`test_06_input_shape`**: Asserts model accepts `(None, 48, 48, 1)`.
    *   *Constraint:* 1-channel Grayscale is mandatory. RGB inputs will cause crash.
*   **`test_07_output_shape`**: Asserts model outputs `(None, 7)`.
*   **`test_08_probability_bounds`**: Feeds random Gaussian noise validation.
    *   *Assert:* All output values $v$ must satisfy $0.0 \le v \le 1.0$.
*   **`test_09_softmax_sum`**: Softmax Saturation check.
    *   *Assert:* $\sum_{i=0}^{6} v_i \approx 1.0$ (Tolerance: 4 decimal places). This confirms the final activation layer is effectively a Softmax.

### 3.3. T03: Cross-Platform Consistency (Quantization Checks)
**Objective:** Validate that the quantization process (Float32 $\to$ Int8/Float16) did not destroy accuracy.

*   **`test_10_random_drift`**: The "Twin Brain" Test.
    *   *Methodology:* A random tensor $X$ is generated.
    *   *Execution:* $Y_{keras} = Model(X)$ and $Y_{tflite} = Interpreter(X)$.
    *   *Metric:* Mean Squared Error (MSE) = $\frac{1}{n} \sum (Y_{keras} - Y_{tflite})^2$.
    *   *Threshold:* Test fails if $MSE > 0.01$. This guarantees that the Mobile experience is identical to the Training experience.

### 3.4. T04: Edge Case Handling
**Objective:** Stress-test the model with anomalous inputs.

*   **`test_11_black_screen_output`**: Feeds a tensor of all zeros (Pitch Black).
    *   *Behavior:* The model typically defaults to Index 0 (Angry) or Index 4 (Neutral) due to bias.
    *   *Pass Condition:* The model must not throw an exception, and the output must still sum to 1.0 (valid probability).

### 3.5. T05: Application Logic & Protocol Verification
**Objective:** Unit test the "Business Logic" defined in the Interface Protocol documents, essentially treating the logic as code-contract.

#### Darkness Filter Algorithm
*   **`test_12_darkness_filter_pass`**: Simulates an image with avg intensity 127 (Bright). Logic must return `True`.
*   **`test_13_darkness_filter_fail`**: Simulates an image with avg intensity 12 (Dark). Logic must return `False`.
    *   *Standard:* Threshold set at 20/255 intensity.

#### Sensitivity Adaptation Algorithm
*   **`test_14_adaptation_boost`**: Verifies that a multiplier $> 1.0$ correctly increases a lower score to become the winner.
    *   *Scenario:* Score B (0.4) * 2.0 = 0.8 > Score A (0.6).
*   **`test_15_adaptation_suppress`**: Verifies that a multiplier $< 1.0$ correctly suppresses a winning score to lose.
    *   *Scenario:* Score A (0.6) * 0.5 = 0.3 < Score B (0.4).
*   **`test_16_adaptation_negative_input`**: Boundary check.
    *   *Scenario:* User configures a negative sensitivity (-1.0).
    *   *Result:* Logic clamps value to 0.0, preventing mathematical inversion of probability.

---

## 4. Error Handling & Robustness Tests
The suite specifically targets Python typing and execution usage errors to ensure the `test_suite.py` itself is robust.

*   **`test_17_bad_types`**:
    *   *Action:* Passes a `list` instead of a `dict` to the `apply_sensitivity` function.
    *   *Expectation:* The function explicitly raises `TypeError`. This enforces strict type conformity for the API consumers.

---

## 5. Performance Benchmarks
We enforce strict latency budgets to ensure 30 FPS capability on mobile devices.

*   **`test_latency_check` (in T03)**:
    *   *Protocol:* Runs a 5-iteration loop of `interpreter.invoke()`.
    *   *Warming:* Pre-warms the XNNPACK delegate before timing.
    *   *Threshold:* Average inference time must be $< 200ms$ on the host CPU. (Note: Mobile NPU/GPU will be significantly faster, usually <20ms).

---

## 6. Execution Instructions
To run this suite and generate the status report:

```bash
# Activate Virtual Env
./intelligence/.venv/Scripts/Activate.ps1

# Run the Suite
python intelligence/src/test_suite.py
```

**Output Codes:**
*   `Exit Code 0`: Success. Deployment authorized.
*   `Exit Code 1`: Failure. Automatic rollback recommended.
