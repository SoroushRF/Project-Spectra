import unittest
import os
import tensorflow as tf
import numpy as np
import json
import time
import sys

# --- CONFIG ---
MODELS_DIR = os.path.join("intelligence", "models")
WEB_MODEL_DIR = os.path.join("platforms", "web", "public", "models")
MOBILE_ASSET_DIR = os.path.join("platforms", "mobile", "assets")

KERAS_PATH = os.path.join(MODELS_DIR, "spectra_best_model.keras")
TFLITE_PATH = os.path.join(MOBILE_ASSET_DIR, "spectra_model.tflite")
JSON_PATH = os.path.join(WEB_MODEL_DIR, "model.json")
BIN_PATH = os.path.join(WEB_MODEL_DIR, "group1-shard1of1.bin")

# --- APP LOGIC MOCKS (To be mirrored in JS/Dart) ---
def check_brightness(frame_array, threshold=20):
    """Simulates the App's Darkness Check Logic."""
    avg = np.mean(frame_array) * 255 if np.max(frame_array) <= 1.0 else np.mean(frame_array)
    return avg >= threshold

def apply_sensitivity(scores, sensitivity):
    """Simulates the App's Adaptation Logic."""
    if not isinstance(scores, dict): raise TypeError("Scores must be a dict")
    if not isinstance(sensitivity, dict): raise TypeError("Sensitivity must be a dict")
    
    adjusted = {k: max(0.0, v * sensitivity.get(k, 1.0)) for k, v in scores.items()}
    return adjusted

# --- GLOBAL SINGLETONS ---
_KERAS_MODEL = None
_TFLITE_INTERPRETER = None

def get_keras_model():
    global _KERAS_MODEL
    if _KERAS_MODEL is None: _KERAS_MODEL = tf.keras.models.load_model(KERAS_PATH)
    return _KERAS_MODEL

def get_tflite_interpreter():
    global _TFLITE_INTERPRETER
    if _TFLITE_INTERPRETER is None:
        _TFLITE_INTERPRETER = tf.lite.Interpreter(model_path=TFLITE_PATH)
        _TFLITE_INTERPRETER.allocate_tensors()
    return _TFLITE_INTERPRETER

# --- TEST SUITE ---
class SpectraTestCase(unittest.TestCase): pass

class T01_FileIntegrity(SpectraTestCase):
    """Verifying build artifacts."""
    def test_01_keras_exists(self): self.assertTrue(os.path.exists(KERAS_PATH))
    def test_02_tflite_exists(self): self.assertTrue(os.path.exists(TFLITE_PATH))
    def test_03_json_exists(self): self.assertTrue(os.path.exists(JSON_PATH))
    def test_04_bin_exists(self): self.assertTrue(os.path.exists(BIN_PATH), "Binary weights missing")
    def test_05_json_schema(self):
        with open(JSON_PATH, 'r') as f: data = json.load(f)
        self.assertIn("weightsManifest", data)
        self.assertEqual(data["weightsManifest"][0]["paths"][0], "group1-shard1of1.bin")

class T02_ModelContract(SpectraTestCase):
    """Verifying the mathematical core."""
    def test_06_input_shape(self):
        self.assertEqual(get_keras_model().input_shape[1:], (48, 48, 1))
    def test_07_output_shape(self):
        self.assertEqual(get_keras_model().output_shape[1:], (7,))
    def test_08_probability_bounds(self):
        dummy = np.random.rand(1, 48, 48, 1).astype(np.float32)
        out = get_keras_model().predict(dummy, verbose=0)
        self.assertTrue(np.all((out >= 0) & (out <= 1.00001)))
    def test_09_softmax_sum(self):
        dummy = np.random.rand(1, 48, 48, 1).astype(np.float32)
        out = get_keras_model().predict(dummy, verbose=0)
        self.assertAlmostEqual(np.sum(out), 1.0, places=4)

class T03_CrossConsistency(SpectraTestCase):
    """Verifying Keras == TFLite."""
    def test_10_random_drift(self):
        dummy = np.random.rand(1, 48, 48, 1).astype(np.float32)
        k = get_keras_model().predict(dummy, verbose=0)[0]
        
        tf = get_tflite_interpreter()
        idx_in = tf.get_input_details()[0]['index']
        idx_out = tf.get_output_details()[0]['index']
        tf.set_tensor(idx_in, dummy)
        tf.invoke()
        t = tf.get_tensor(idx_out)[0]
        
        mse = np.mean((k - t) ** 2)
        self.assertLess(mse, 0.01, f"MSE Drift too high: {mse}")

class T04_EdgeCases(SpectraTestCase):
    """Checking known failure modes."""
    def test_11_black_screen_output(self):
        # We know it defaults to Angry, but verify it doesn't crash
        dummy = np.zeros((1, 48, 48, 1), dtype=np.float32)
        out = get_keras_model().predict(dummy, verbose=0)
        self.assertEqual(out.shape, (1, 7))

class T05_AppLogic(SpectraTestCase):
    """Verifying the Algorithms defined in Protocols."""
    
    # -- Darkness Check --
    def test_12_darkness_filter_pass(self):
        # Bright image (0.5 val = 127 intensity)
        img = np.ones((48, 48)) * 0.5 
        self.assertTrue(check_brightness(img))
    
    def test_13_darkness_filter_fail(self):
        # Dark image (0.05 val = ~12 intensity) - Should be < 20
        img = np.ones((48, 48)) * 0.05
        self.assertFalse(check_brightness(img), "Darkness check allowed Pitch Black")

    # -- Adaptation --
    def test_14_adaptation_boost(self):
        scores = {'A': 0.6, 'B': 0.4}
        sens = {'B': 2.0}
        res = apply_sensitivity(scores, sens)
        self.assertEqual(max(res, key=res.get), 'B')

    def test_15_adaptation_suppress(self):
        scores = {'A': 0.6, 'B': 0.4}
        sens = {'A': 0.5}
        res = apply_sensitivity(scores, sens)
        self.assertEqual(max(res, key=res.get), 'B')

    def test_16_adaptation_negative_input(self):
        # Even if profile has negative multiplier, logic should clamp to 0
        scores = {'A': 0.5}
        sens = {'A': -1.0}
        res = apply_sensitivity(scores, sens)
        self.assertEqual(res['A'], 0.0)

    def test_17_bad_types(self):
        with self.assertRaises(TypeError):
            apply_sensitivity(['list'], {})

# --- RUNNER ---
GREEN = "\033[92m"
RED = "\033[91m"
RESET = "\033[0m"
BOLD = "\033[1m"

def run_suite():
    print(f"\n{BOLD}� PROJECT SPECTRA v1.0: PRE-FLIGHT CHECKLIST{RESET}\n")
    try:
        get_keras_model()
        get_tflite_interpreter()
    except Exception as e:
        print(f"{RED}CRTICAL ERROR: MODELS DEAD. {e}{RESET}")
        return

    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    classes = [T01_FileIntegrity, T02_ModelContract, T03_CrossConsistency, T04_EdgeCases, T05_AppLogic]
    
    tests = []
    for c in classes:
        tests.extend(loader.loadTestsFromTestCase(c))
    
    passed = 0
    total = 0
    
    for test in tests:
        # Standard unittest flattening for iteration
        if isinstance(test, unittest.TestSuite):
            subtests = list(test)
            for t in subtests:
                total += 1
                res = unittest.TestResult()
                t.run(res)
                name = t.id().split('.')[-1]
                if res.wasSuccessful():
                    passed += 1
                    print(f" {GREEN}[PASS]{RESET} {name}")
                else:
                    print(f" {RED}[FAIL]{RESET} {name}")
                    print(f"        Reason: {res.failures[0][1] if res.failures else res.errors[0][1].splitlines()[-1]}")
        else:
            # Single test
            total += 1
            res = unittest.TestResult()
            test.run(res)
            name = test.id().split('.')[-1]
            if res.wasSuccessful():
                passed += 1
                print(f" {GREEN}[PASS]{RESET} {name}")
            else:
                print(f" {RED}[FAIL]{RESET} {name}")
    
    print("-" * 30)
    print(f"RESULT: {passed}/{total} ({(passed/total)*100:.0f}%)")
    if passed != total: sys.exit(1)

if __name__ == '__main__':
    run_suite()
