import React, { useState, useRef, useEffect } from 'react';
import EmotionDetector from './components/EmotionDetector';
import CalibrationModal from './components/CalibrationModal';
import { loadProfile, saveProfile, applySensitivity } from './profileService';
import { Activity, Camera, Settings2, Sparkles, Terminal, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

function App() {
    const [results, setResults] = useState([]);
    const [rawResults, setRawResults] = useState([]);
    const videoRef = useRef(null);
    const [hasCamera, setHasCamera] = useState(false);
    const [profile, setProfile] = useState(loadProfile());
    const [isCalibrating, setIsCalibrating] = useState(false);
    const [faceBox, setFaceBox] = useState(null);
    const overlayRef = useRef(null);

    useEffect(() => {
        async function setupCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 1280, height: 720 },
                    audio: false
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setHasCamera(true);
                }
            } catch (err) {
                console.error('Core: Sensor Failure:', err);
            }
        }
        setupCamera();
    }, []);

    const handleResults = ({ emotions, faceBox }) => {
        setRawResults(emotions);
        const personalized = applySensitivity(emotions, profile.sensitivity);
        setResults(personalized);
        setFaceBox(faceBox);
    };

    const handleCalibrationComplete = (newSensitivity) => {
        const newProfile = { ...profile, sensitivity: { ...profile.sensitivity, ...newSensitivity } };
        setProfile(newProfile);
        saveProfile(newProfile);
        setIsCalibrating(false);
    };

    const sortedResults = results.length > 0
        ? [...results].sort((a, b) => b.score - a.score)
        : [];

    const topEmotion = sortedResults[0] || {
        label: results.length === 0 && hasCamera ? 'STREAMS_IDLE' : 'SYNCHRONIZING...',
        score: 0
    };

    // Draw Overlay Logic
    useEffect(() => {
        if (!overlayRef.current || !videoRef.current) return;
        const ctx = overlayRef.current.getContext('2d');
        const video = videoRef.current;

        // 1. Safety Loop: Ensure video has dimensions before drawing
        if (video.videoWidth === 0 || video.videoHeight === 0) return;

        // 2. Resolution Sync: Set canvas to match source video exactly (e.g., 1280x720)
        // This ensures 1:1 coordinate mapping with the detection results
        if (overlayRef.current.width !== video.videoWidth || overlayRef.current.height !== video.videoHeight) {
            overlayRef.current.width = video.videoWidth;
            overlayRef.current.height = video.videoHeight;
        }

        ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);

        // 3. Draw Condition: Draw if we have a face, even if emotions are processing
        if (faceBox) {
            // Robust extraction
            const x = faceBox.xMin ?? faceBox.x ?? 0;
            const y = faceBox.yMin ?? faceBox.y ?? 0;
            const w = faceBox.width ?? faceBox.w ?? 100;
            const h = faceBox.height ?? faceBox.h ?? 100;

            // Draw RAW JSON
            ctx.save();
            ctx.scale(-1, 1);
            ctx.fillStyle = 'yellow';
            ctx.font = '24px monospace';
            const raw = JSON.stringify(faceBox);
            ctx.fillText(raw.substring(0, 40), -1200, 100); 
            ctx.fillText(raw.substring(40), -1200, 140);
            ctx.fillText(`Mapped: x=${x} y=${y} w=${w} h=${h}`, -800, 180);
            ctx.restore();

            // Simple Green Box
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 4;
            ctx.strokeRect(x, y, w, h);
            
            // Red backup fill
            ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
            ctx.fillRect(x, y, w, h);
        }
    }, [faceBox, results, topEmotion]);

    return (
        <div className="app-container">
            <header className="interface-header">
                <div className="brand">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >SPECTRA PROTOCOL</motion.h1>
                    <span className="version-tag">SYSTEM v1.0.4 // LOCAL_INTELLIGENCE</span>
                </div>
                <div className="status-pill">
                    <div className="pulse-dot"></div>
                    INF_STREAM_ACTIVE
                </div>
            </header>

            <main className="main-layout" style={{ gridTemplateColumns: '1fr' }}>
                <section className="viewport-section">
                    <div className="video-frame" style={{ maxHeight: '600px' }}>
                        {!hasCamera && (
                            <div className="camera-placeholder">
                                <Camera size={48} className="animate-pulse opacity-20" />
                                <p>AWAITING OPTICAL FEED...</p>
                            </div>
                        )}
                        <video ref={videoRef} autoPlay playsInline muted />
                        <canvas ref={overlayRef} className="video-overlay-canvas" />
                        <div className="video-overlay"></div>

                        {hasCamera && results.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="detection-badge"
                            >
                                <Activity size={18} className="text-cyan-400" />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.6rem', opacity: 0.5, letterSpacing: '1px' }}>PRIMARY_INTENT</span>
                                    <span style={{ fontWeight: 800, letterSpacing: '2px' }}>{topEmotion.label.toUpperCase()}</span>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    <div className="action-row" style={{ justifyContent: 'center' }}>
                        <EmotionDetector videoRef={videoRef} onResults={handleResults} />
                    </div>
                </section>

                <div className="inspector-panel" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                    <div className="panel-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Terminal size={14} />
                            PROBABILITY_MATRIX
                        </div>
                        <Settings2 size={14} />
                    </div>

                    <div className="stream-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        {(results.length > 0 ? results : [
                            { label: 'Angry', score: 0 },
                            { label: 'Disgust', score: 0 },
                            { label: 'Fear', score: 0 },
                            { label: 'Happy', score: 0 },
                            { label: 'Neutral', score: 0 },
                            { label: 'Sad', score: 0 },
                            { label: 'Surprise', score: 0 }
                        ]).map((res) => (
                            <div key={res.label} className="emotion-node">
                                <div className="node-label">
                                    <span>{res.label.toUpperCase()}</span>
                                    <span style={{
                                        color: res.label === topEmotion.label && res.score > 0.1 ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                                        fontFamily: 'monospace'
                                    }}>
                                        {(res.score * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="node-bar-bg">
                                    <motion.div
                                        className={`node-bar-fill ${res.label === topEmotion.label ? 'active' : ''}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(res.score * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <AnimatePresence>
                {isCalibrating && (
                    <CalibrationModal
                        activeResults={rawResults}
                        onComplete={handleCalibrationComplete}
                        onCancel={() => setIsCalibrating(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

export default App;
