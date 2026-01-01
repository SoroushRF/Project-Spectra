# Spectra Repair Implementation Plan

## Phase 1: Core Intelligence Synchronization ("The Brain")
**Objective:** Align the Web frontend's image preprocessing **exactly** with the Python training pipeline to fix the "Fear/Neutral" default bias.

### Task 1.1: Implement Luma Grayscale Conversion
- **File:** `platforms/web/src/components/EmotionDetector.jsx`
- **Location:** Line 97 (`const gray = cropped.mean(2)...`)
- **Action:** 
  1. Remove the simple `.mean(2)` averaging method.
  2. Implement the standard photometric/digital ITU-R BT.601 conversion formula using `tf.tidy`:
     ```javascript
     // Formula: Y = 0.299*R + 0.587*G + 0.114*B
     const rgb = cropped.toFloat();
     const [r, g, b] = tf.split(rgb, 3, 2);
     const gray = r.mul(0.299).add(g.mul(0.587)).add(b.mul(0.114)).expandDims(-1);
     ```
  3. Ensure the tensor is cast to `int32` or kept as valid pixels before resizing if necessary, matching `cv2.resize` behavior.

### Task 1.2: Verify Tensor Shape & Range
- **File:** `platforms/web/src/components/EmotionDetector.jsx`
- **Action:** Ensure the final input to `model.predict` is normalized to `[0, 1]` (div 255) and has shape `[1, 48, 48, 1]`.

---

## Phase 2: Visual Telemetry Repair ("The Eyes")
**Objective:** Restore the live tracking box by handling coordinate normalization and canvas synchronization issues.

### Task 2.1: Robust Canvas Synchronization
- **File:** `platforms/web/src/App.jsx`
- **Location:** The `Draw Overlay Logic` useEffect (Line 61).
- **Action:**
  1. Add an explicit check for `video.videoWidth`.
  2. If the canvas dimensions do not match the video dimensions, forcibly update them:
     ```javascript
     overlayRef.current.width = video.videoWidth;
     overlayRef.current.height = video.videoHeight;
     ```

### Task 2.2: Coordinate System Normalization
- **File:** `platforms/web/src/App.jsx`
- **Action:** Implement a heuristic to detect normalized coordinates (0.0 - 1.0) vs Pixel coordinates.
  - **Logic:**
    ```javascript
    let { xMin, yMin, width, height } = faceBox;
    // Auto-detect normalized coordinates (if values are < 2.0, assume normalized)
    if (xMin < 2 && width < 2) {
       xMin *= video.videoWidth;
       yMin *= video.videoHeight;
       width *= video.videoWidth;
       height *= video.videoHeight;
    }
    ```

### Task 2.3: Fix Drawing Context Transformation
- **File:** `platforms/web/src/App.jsx`
- **Action:** Review the `ctx.scale(-1, 1)` logic.
  - If the CSS already mirrors the `<video>` element (`transform: scaleX(-1)`), the specific standard for the drawing canvas needs to be verified.
  - **Fix:** If the canvas is overlaid *on top* of the mirrored video, we usually want to draw *unmirrored* on the canvas and let CSS mirror the canvas too, OR draw mirrored on the canvas.
  - **Step:** Apply `className="video-overlay-canvas"` (which has `transform: scaleX(-1)`) to the canvas. Ensure we draw **normal coordinates** (don't subtract from width) so the CSS flips it correctly to match the video.

## Phase 3: Final Verification
### Task 3.1: Browser Testing
- **Action:** Run `npm run dev` and verified:
  1. "Pulse Check" logs in console show detection.
  2. Green Box aligns with face (even when moving).
  3. Emotions vary naturally (Happy, Sad, Surprise) and don't get stuck on Fear/Neutral.
