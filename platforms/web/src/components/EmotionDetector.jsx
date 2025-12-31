import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceDetection from '@tensorflow-models/face-detection';

const EMOTIONS = [
    'Angry',    // 0
    'Disgust',  // 1
    'Fear',     // 2
    'Happy',    // 3
    'Neutral',  // 4
    'Sad',      // 5
    'Surprise'  // 6
];

export default function EmotionDetector({ videoRef, onResults }) {
    const [model, setModel] = useState(null);
    const [detector, setDetector] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isTooDark, setIsTooDark] = useState(false);
    const requestRef = useRef();
    const debugCanvasRef = useRef();

    useEffect(() => {
        async function init() {
            try {
                await tf.ready();

                // Load Emotion Model
                const loadedModel = await tf.loadLayersModel('/models/model.json');

                // Initialize Face Detector
                const detectorModel = faceDetection.SupportedModels.MediaPipeFaceDetector;
                const detectorConfig = {
                    runtime: 'tfjs', // Use tfjs runtime within the app
                    maxFaces: 1,
                    modelType: 'short'
                };
                const loadedDetector = await faceDetection.createDetector(detectorModel, detectorConfig);

                // Warmup model
                tf.tidy(() => {
                    loadedModel.predict(tf.zeros([1, 48, 48, 1]));
                });

                setModel(loadedModel);
                setDetector(loadedDetector);
                setLoading(false);
                console.log('Detector: Systems Synchronized (Face + Emotion).');
                console.log('Detector: Emotion Model Input Shape:', loadedModel.inputs[0].shape);
            } catch (err) {
                console.error('Detector: Load Failure:', err);
                setLoading(false);
            }
        }
        init();
    }, []);

    const predict = async () => {
        if (!model || !detector || !videoRef.current || videoRef.current.readyState < 2) {
            requestRef.current = requestAnimationFrame(predict);
            return;
        }

        try {
            // 1. Detect Face First
            const faces = await detector.estimateFaces(videoRef.current, { flipHorizontal: false });

            if (Math.random() < 0.01) {
                console.log('Detector: Pulse Check - Faces found:', faces?.length);
            }

            let faceBox = null;
            let results = null;

            if (faces && faces.length > 0) {
                const face = faces[0];
                if (!face || !face.box) {
                    requestRef.current = requestAnimationFrame(predict);
                    return;
                }
                faceBox = face.box;

                results = tf.tidy(() => {
                    // 2. Capture pixels
                    const img = tf.browser.fromPixels(videoRef.current);

                    // 3. Crop to face
                    const { xMin, yMin, width, height } = faceBox;

                    // Safety padding and bounds check
                    const startX = Math.max(0, Math.floor(xMin));
                    const startY = Math.max(0, Math.floor(yMin));
                    const cropWidth = Math.max(1, Math.min(img.shape[1] - startX, Math.floor(width)));
                    const cropHeight = Math.max(1, Math.min(img.shape[0] - startY, Math.floor(height)));

                    const cropped = img.slice([startY, startX, 0], [cropHeight, cropWidth, 3]);
                    const gray = cropped.mean(2).expandDims(-1);
                    const resized = gray.resizeBilinear([48, 48]);

                    // 4. Debug visualization
                    if (debugCanvasRef.current) {
                        const viewTensor = resized.div(255);
                        tf.browser.toPixels(viewTensor, debugCanvasRef.current);
                    }

                    // 5. Prediction
                    const normalized = resized.toFloat().div(tf.scalar(255.0)).expandDims(0);
                    const prediction = model.predict(normalized);

                    if (!prediction) {
                        console.error('Detector: Model prediction returned undefined');
                        return null;
                    }

                    const scores = prediction.dataSync();
                    return EMOTIONS.map((label, index) => ({
                        label,
                        score: scores[index]
                    }));
                });
            }

            if (results) {
                if (isTooDark) setIsTooDark(false);
                onResults({ emotions: results, faceBox });
            } else if (faceBox) {
                onResults({ emotions: [], faceBox });
            } else {
                onResults({ emotions: [], faceBox: null });
            }
        } catch (e) {
            console.error('Detector Loop Error:', e);
            onResults({ emotions: [], faceBox: null });
        }

        requestRef.current = requestAnimationFrame(predict);
    };

    useEffect(() => {
        if (model) {
            requestRef.current = requestAnimationFrame(predict);
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [model]);

    return (
        <div className="detector-bundle" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <div className="debug-box" style={{
                width: '64px', height: '64px',
                border: '2px solid var(--neon-cyan)', borderRadius: '8px',
                padding: '2px', background: '#000',
                boxShadow: '0 0 15px rgba(0, 242, 255, 0.3)'
            }}>
                <canvas ref={debugCanvasRef} width="48" height="48" style={{ width: '100%', height: '100%', imageRendering: 'pixelated' }} />
                <div style={{ position: 'absolute', transform: 'translateY(-70px)', fontSize: '0.4rem', opacity: 0.5 }}>AI_VIEW_48x48</div>
            </div>

            <div className="status-pill" style={{ border: '1px solid var(--neon-cyan)', padding: '0.5rem 1.2rem', borderRadius: '99px', background: 'rgba(0,0,0,0.5)' }}>
                <div className={`pulse-dot ${loading ? 'opacity-50' : (isTooDark ? 'bg-red-500' : '')}`}
                    style={{ background: isTooDark ? '#ff4444' : (loading ? '#ffbb00' : '#00f2ff') }}
                />
                <span style={{ fontSize: '0.7rem', letterSpacing: '1px', fontWeight: 800 }}>
                    {loading ? 'CALIBRATING...' : (isTooDark ? 'LOW_LIGHT' : 'STREAM_LIVE')}
                </span>
            </div>
        </div>
    );
}
