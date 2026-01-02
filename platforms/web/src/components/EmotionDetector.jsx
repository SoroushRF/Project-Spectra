import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceDetection from '@tensorflow-models/face-detection';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';

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
    const loopGeneration = useRef(0); // Security Badge for loops
    const debugCanvasRef = useRef();
    const { metrics, metricsRef, updateMetrics } = usePerformanceMonitor();

    useEffect(() => {
        async function init() {
            try {
                await tf.ready();
                await tf.setBackend('webgl'); // Restore GPU for performance (Input Tensor fix should allow this now)

                // Load Emotion Model
                const loadedModel = await tf.loadLayersModel('/models/model.json');

                // Initialize Face Detector
                const detectorModel = faceDetection.SupportedModels.MediaPipeFaceDetector;
                const detectorConfig = {
                    runtime: 'tfjs', // Reverting to tfjs to fix WASM crash
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

    const predict = async (genId) => {
        // KILL ORDER: If this isn't the active generation, DIE.
        if (genId !== loopGeneration.current) return;

        if (!model || !detector || !videoRef.current || videoRef.current.readyState < 2) {
            requestRef.current = requestAnimationFrame(() => predict(genId));
            return;
        }

        try {
            const startTime = performance.now();
            
            // 1. Detect Face First
            const detectStart = performance.now();
            const inputTensor = tf.browser.fromPixels(videoRef.current);
            const faces = await detector.estimateFaces(inputTensor, { flipHorizontal: false });
            inputTensor.dispose();
            const detectEnd = performance.now();

            let faceBox = null;
            let results = null;

            if (Math.random() < 0.01) {
                console.log('Detector: Pulse Check - Faces found:', faces?.length);
                if (faces?.[0]) console.log('Detector: RAW FACE DATA:', faces[0]);
            }

            if (faces && faces.length > 0) {
                const face = faces[0];
                if (!face || !face.box) {
                    requestRef.current = requestAnimationFrame(predict);
                    return;
                }
                faceBox = face.box;

                // CRITICAL FIX: Handle Normalized Coordinates
                // If the detector returns 0-1 values, we MUST scale them to pixels
                // otherwise the crop will be 0x0 (Grey Square) -> Model sees nothing -> Defaults to Neutral
                if (faceBox.xMin < 2 && faceBox.width < 2) {
                    const vid = videoRef.current;
                    faceBox = {
                        xMin: faceBox.xMin * vid.videoWidth,
                        yMin: faceBox.yMin * vid.videoHeight,
                        width: faceBox.width * vid.videoWidth,
                        height: faceBox.height * vid.videoHeight,
                        // Optional: xMax/yMax if used elsewhere
                        xMax: (faceBox.xMin + faceBox.width) * vid.videoWidth,
                        yMax: (faceBox.yMin + faceBox.height) * vid.videoHeight
                    };
                    // console.log("Spectra: Coordinates Denormalized", faceBox);
                }

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
                    // Luma Grayscale (Match Python cv2.COLOR_BGR2GRAY)
                    const rgb = cropped.toFloat();
                    const [r, g, b] = tf.split(rgb, 3, 2);
                    const gray = r.mul(0.299).add(g.mul(0.587)).add(b.mul(0.114));
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

                    // Task 1.2: Verify Tensor Shape & Range
                    if (Math.random() < 0.01) {
                         const shape = normalized.shape;
                         const minVal = normalized.min().dataSync()[0];
                         const maxVal = normalized.max().dataSync()[0];
                         console.log(`Detector Check: Shape=${shape}, Range=[${minVal.toFixed(2)}, ${maxVal.toFixed(2)}]`);
                    }

                    const scores = prediction.dataSync();
                    return EMOTIONS.map((label, index) => ({
                        label,
                        score: scores[index]
                    }));
                });
            }

            const endTime = performance.now();

            // Update performance engine
            updateMetrics({
                detection: detectEnd - detectStart,
                inference: results ? (endTime - detectEnd) : 0,
                total: endTime - startTime
            });

            // Pulse check log (Now using Ref for non-zero data)
            if (Math.random() < 0.05) {
                const live = metricsRef.current;
                console.log(
                    `%c[Spectra Lab]%c FPS: ${live.fps} | Detect: ${live.detectionLatency}ms | Infer: ${live.inferenceLatency}ms | VRAM: ${live.gpuMemory}MB`,
                    "color: #00f2ff; font-weight: bold;",
                    "color: inherit;"
                );
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

        // Sequential Loop: Pass the Generation Badge forward
        requestRef.current = requestAnimationFrame(() => predict(genId));
    };

    useEffect(() => {
        if (detector && model) {
            // New Generation: Kills any ghost loops still waiting on the GPU
            loopGeneration.current += 1;
            predict(loopGeneration.current);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            loopGeneration.current += 1; // Mark current gen as dead
        };
    }, [detector, model]);

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

            {/* NEW STEADY HUD: Performance metrics stay fixed here */}
            {!loading && (
                <div className="perf-hud" style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '20px',
                    padding: '10px 15px',
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0, 242, 255, 0.3)',
                    borderRadius: '12px',
                    display: 'flex',
                    gap: '20px',
                    zIndex: 9999,
                    fontFamily: 'monospace',
                    fontSize: '0.7rem'
                }}>
                    <div style={{ color: 'var(--neon-cyan)' }}>FPS: <span style={{ color: '#fff' }}>{metrics.fps}</span></div>
                    <div style={{ color: 'var(--neon-cyan)' }}>DET: <span style={{ color: '#fff' }}>{metrics.detectionLatency}ms</span></div>
                    <div style={{ color: 'var(--neon-cyan)' }}>INF: <span style={{ color: '#fff' }}>{metrics.inferenceLatency}ms</span></div>
                    <div style={{ 
                        color: metrics.isMemoryLeaking ? '#ff4444' : 'var(--neon-cyan)',
                        transition: 'color 0.3s ease'
                    }}>
                        MEM: <span style={{ color: '#fff' }}>{metrics.gpuMemory}MB</span>
                        {metrics.isMemoryLeaking && <span title="Potential Memory Leak Detected!" style={{ marginLeft: '5px' }}>⚠️</span>}
                    </div>
                </div>
            )}
        </div>
    );
}
