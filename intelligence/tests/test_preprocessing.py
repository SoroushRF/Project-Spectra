import pytest
import numpy as np
import cv2
import os

# PATHS
GOLDEN_IMAGE = os.path.join("shared", "test_assets", "golden_face_target.png")
GOLDEN_TENSOR = os.path.join("shared", "test_assets", "golden_tensor.npy")

def test_spectra_preprocessing_protocol():
    """
    VERIFIES: The Python preprocessing pipeline produces the exact same output 
    as the project's Golden Standard.
    """
    # 1. Load Ground Truth
    if not os.path.exists(GOLDEN_IMAGE) or not os.path.exists(GOLDEN_TENSOR):
        pytest.fail("Golden assets missing. Run generate_golden_assets.py first.")
    
    reference_tensor = np.load(GOLDEN_TENSOR)
    
    # 2. Execute Local Implementation of Protocol
    raw_img = cv2.imread(GOLDEN_IMAGE, cv2.IMREAD_GRAYSCALE)
    
    # --- The Spectra Protocol Scripted ---
    h, w = raw_img.shape
    size = min(h, w)
    sh, sw = (h - size) // 2, (w - size) // 2
    cropped = raw_img[sh:sh+size, sw:sw+size]
    
    resized = cv2.resize(cropped, (48, 48), interpolation=cv2.INTER_AREA)
    local_tensor = resized.astype(np.float32) / 255.0
    # -------------------------------------

    # 3. Compare (Allow for tiny floating point noise)
    difference = np.abs(local_tensor - reference_tensor)
    max_diff = np.max(difference)
    
    print(f"Max pixel difference: {max_diff}")
    
    assert max_diff < 1e-5, f"LOCAL PIPELINE DIVERGED! Max diff: {max_diff}"
    print("✅ Local pipeline matches Golden Standard.")

if __name__ == "__main__":
    # Allow running directly or via pytest
    test_spectra_preprocessing_protocol()
