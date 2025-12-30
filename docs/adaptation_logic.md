# Project Spectra: Adaptation & Personalization Logic
**Version:** 1.0  
**Target:** Interface Stream (Flutter/React)

## 1. The Problem: "The Neutral Sinkhole"
The base Spectra model (v1) is conservative. It tends to classify subtle expressions as **NEUTRAL**.
*   **Symptom:** User makes a "Sad" face.
*   **Model Output:** `Neutral: 0.55`, `Sad: 0.35`
*   **Result:** The UI shows "Neutral", frustrating the user.

## 2. The Solution: Adaptive Sensitivity (Ghost Weights)
Instead of retraining the neural network on the device (CPU heavy, battery drain), we use **Post-Processing Calibration**.
Every user gets a local `profile.json` that biases the final scores.

---

## 3. The Implementation Algorithm

### A. The Data Structure
Store a `sensitivity` float for each emotion (Default = 1.0).
```json
// user_profile.json
{
  "user_id": "soroush_01",
  "sensitivity": {
    "Angry": 1.2,    // Boost Angry score by 20%
    "Disgust": 1.0,
    "Fear": 1.0,
    "Happy": 0.8,    // Suppress Happy (if model is too eager)
    "Neutral": 0.9,  // Suppress Neutral (to let others shine)
    "Sad": 1.3,      // Boost Sad significantly
    "Surprise": 1.4  // Boost Surprise significantly
  }
}
```

### B. The "Nudge" Equation (Inference Time)
Run this logic **after** getting the raw probability from the model, but **before** deciding the label.

```javascript
function getPersonalizedPrediction(rawScores, sensitivityProfile) {
    let adjustedScores = {};
    let maxScore = -1;
    let finalLabel = "Unknown";

    // 1. Apply Multiplier
    for (const [emotion, score] of Object.entries(rawScores)) {
        // Boost weak emotions based on profile
        adjustedScores[emotion] = score * sensitivityProfile[emotion];
    }

    // 2. Re-Normalize (Softmax style - optional but good for UI)
    // ... logic to scale back to 0-1 range ...

    // 3. Select Winner
    for (const [emotion, score] of Object.entries(adjustedScores)) {
        if (score > maxScore) {
            maxScore = score;
            finalLabel = emotion;
        }
    }
    
    return { label: finalLabel, score: maxScore };
}
```

---

## 4. The Calibration UX (How to set the values)
Do not ask the user to input numbers. Use a **"Mirror Game"**.

1.  **App Prompt:** "Show me your **SURPRISED** face!" 😲
2.  **User Action:** (Makes face).
3.  **Model Raw Output:** `Surprise: 0.30`, `Neutral: 0.60`.
4.  **Calibration Logic:**
    *   Target: We want `Surprise` to beat `Neutral`.
    *   Compute Boost: `Neutral (0.60) / Surprise (0.30) = 2.0`.
    *   **Action:** Update `sensitivity.Surprise` to `2.1` (just enough to win).
5.  **Save:** Update `user_profile.json`.

## 5. Summary
This method allows Project Spectra to "learn" the user's face instantly without expensive backpropagation.
*   **Fixes "Sad/Angry" issues:** By boosting their sensitivity multipliers.
*   **Fixes "Neutral Bias":** By slightly lowering Neutral sensitivity (e.g. 0.9).

**Signed:** Lead AI Engineer
