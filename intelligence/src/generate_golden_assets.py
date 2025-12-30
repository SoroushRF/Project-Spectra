import cv2
import numpy as np
import os

# CONFIG
TEST_ASSETS_DIR = os.path.join("shared", "test_assets")
GOLDEN_IMAGE_PATH = os.path.join(TEST_ASSETS_DIR, "golden_face_target.png")
GOLDEN_TENSOR_PATH = os.path.join(TEST_ASSETS_DIR, "golden_tensor.npy")

def generate_golden_assets():
    print("🌟 Generating Spectra Golden Test Assets...")
    
    # 1. Create a Synthetic "Face" Target (1024x1024)
    # Why? Synthetic images are pixel-perfect and don't have camera noise.
    img_size = 1024
    image = np.zeros((img_size, img_size), dtype=np.uint8)
    
    # Add a gradient (detects normalization/bit-depth issues)
    for i in range(img_size):
        image[i, :] = i // 4 
        
    # Add a circle (detects aspect ratio/resizing distortion)
    cv2.circle(image, (img_size//2, img_size//2), 300, 255, -1)
    
    # Add a grid (detects interpolation/aliasing issues)
    for i in range(0, img_size, 64):
        cv2.line(image, (i, 0), (i, img_size), 128, 2)
        cv2.line(image, (0, i), (img_size, i), 128, 2)

    cv2.imwrite(GOLDEN_IMAGE_PATH, image)
    print(f"✅ Golden Image created: {GOLDEN_IMAGE_PATH}")

    # 2. Process using the SPECTRA PROTOCOL (The Reference Implementation)
    
    # A. Crop to center 1:1 (already 1:1 here, but we do it for logic)
    h, w = image.shape
    crop_size = min(h, w)
    start_h = (h - crop_size) // 2
    start_w = (w - crop_size) // 2
    cropped = image[start_h:start_h+crop_size, start_w:start_w+crop_size]
    
    # B. Resize 48x48 (using INTER_AREA as it's best for shrinking)
    resized = cv2.resize(cropped, (48, 48), interpolation=cv2.INTER_AREA)
    
    # C. Normalize 0.0 to 1.0
    normalized = resized.astype(np.float32) / 255.0
    
    # 3. Save as Reference Tensor
    np.save(GOLDEN_TENSOR_PATH, normalized)
    print(f"✅ Reference Tensor created: {GOLDEN_TENSOR_PATH}")
    
    # Also save a visual representation of the 48x48 tensor for quick debugging
    cv2.imwrite(os.path.join(TEST_ASSETS_DIR, "golden_48x48_preview.png"), (normalized * 255).astype(np.uint8))

if __name__ == "__main__":
    generate_golden_assets()
