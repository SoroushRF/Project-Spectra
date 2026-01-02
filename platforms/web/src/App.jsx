import React, { useState, useRef, useEffect } from 'react';
import EmotionDetector from './components/EmotionDetector';
import CalibrationModal from './components/CalibrationModal';
import AnalyticsView from './components/AnalyticsView';
import DocumentationView from './components/DocumentationView';
import { loadProfile, saveProfile, applySensitivity } from './profileService';
import { Activity, Camera, Settings2, Sparkles, Terminal, ShieldCheck, BarChart3, Radio, BookOpen } from 'lucide-react';
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

    // Navigation State
    const [activeTab, setActiveTab] = useState('live'); // 'live' | 'analytics' | 'docs'

    // Analytics State
    const [sessionData, setSessionData] = useState({
        happy: 0,
        neutral: 0,
        sad: 0,
        angry: 0,
        fear: 0,
        surprise: 0,
        disgust: 0
    });
    const lastUpdateRef = useRef(Date.now());
    const [totalTimeMs, setTotalTimeMs] = useState(0);

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
        const now = Date.now();
        const delta = now - lastUpdateRef.current;
        lastUpdateRef.current = now;

        setRawResults(emotions);
        const personalized = applySensitivity(emotions, profile.sensitivity);
        setResults(personalized);
        setFaceBox(faceBox);

        // Update Analytics Data
        if (personalized.length > 0) {
            // Find dominant emotion
            const dominant = personalized.reduce((prev, current) =>
                (prev.score > current.score) ? prev : current
            );

            if (dominant && dominant.score > 0.3) {
                const label = dominant.label.toLowerCase();
                setSessionData(prev => ({
                    ...prev,
                    [label]: (prev[label] || 0) + delta
                }));
                // Only increment total time if we actually detected something significant?
                // Or just always increment time? Let's just add delta.
                setTotalTimeMs(prev => prev + delta);
            }
        }
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

    // Smooth Tracking Logic
    const targetBoxRef = useRef(null);
    const smoothBoxRef = useRef(null);

    // Update target ref when state changes
    useEffect(() => {
        targetBoxRef.current = faceBox;
    }, [faceBox]);

    // Animation Loop
    useEffect(() => {
        if (!overlayRef.current || !videoRef.current) return;
        const ctx = overlayRef.current.getContext('2d');
        let animationFrameId;

        const renderLoop = () => {
            const video = videoRef.current;

            // Sync Resolution if needed
            if (video.videoWidth > 0 && (overlayRef.current.width !== video.videoWidth || overlayRef.current.height !== video.videoHeight)) {
                overlayRef.current.width = video.videoWidth;
                overlayRef.current.height = video.videoHeight;
            }

            const target = targetBoxRef.current;

            ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);

            if (target) {
                // Initialize smooth box if first detection
                if (!smoothBoxRef.current) {
                    smoothBoxRef.current = { ...target };
                }

                const smooth = smoothBoxRef.current;
                const alpha = 0.2; // Smoothness factor

                // LERP
                const tx = target.xMin ?? target.x ?? 0;
                const ty = target.yMin ?? target.y ?? 0;
                const tw = target.width ?? target.w ?? 100;
                const th = target.height ?? target.h ?? 100;

                smooth.x = (smooth.x ?? tx) + (tx - (smooth.x ?? tx)) * alpha;
                smooth.y = (smooth.y ?? ty) + (ty - (smooth.y ?? ty)) * alpha;
                smooth.w = (smooth.w ?? tw) + (tw - (smooth.w ?? tw)) * alpha;
                smooth.h = (smooth.h ?? th) + (th - (smooth.h ?? th)) * alpha;

                // Draw Smooth Box only on Live tab
                if (activeTab === 'live') {
                    ctx.strokeStyle = '#00f2ff';
                    ctx.lineWidth = 3;

                    // Neon Glow
                    ctx.shadowColor = '#00f2ff';
                    ctx.shadowBlur = 20;

                    ctx.strokeRect(smooth.x, smooth.y, smooth.w, smooth.h);
                    ctx.shadowBlur = 0;

                    // Fill
                    ctx.fillStyle = 'rgba(0, 242, 255, 0.05)';
                    ctx.fillRect(smooth.x, smooth.y, smooth.w, smooth.h);
                }

            } else {
                smoothBoxRef.current = null;
            }

            animationFrameId = requestAnimationFrame(renderLoop);
        };

        renderLoop();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [activeTab]);

    return (
        <div className="app-container">
            <div className="max-width-wrapper">
                <nav className="site-nav">
                    <div className="brand">
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >SPECTRA</motion.h1>
                    </div>

                    <div className="nav-links">
                        <span
                            className={`nav-link ${activeTab === 'live' ? 'active' : ''}`}
                            onClick={() => setActiveTab('live')}
                        >
                            <Radio size={16} style={{ display: 'inline', marginRight: '6px' }} />
                            Live Interface
                        </span>
                        <span
                            className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
                            onClick={() => setActiveTab('analytics')}
                        >
                            <BarChart3 size={16} style={{ display: 'inline', marginRight: '6px' }} />
                            Analytics
                        </span>
                        <span
                            className={`nav-link ${activeTab === 'docs' ? 'active' : ''}`}
                            onClick={() => setActiveTab('docs')}
                        >
                            <BookOpen size={16} style={{ display: 'inline', marginRight: '6px' }} />
                            Documentation
                        </span>
                    </div>

                    <div className="status-pill">
                        <div className="pulse-dot"></div>
                        SYSTEM_ONLINE
                    </div>
                </nav>

                <main className="main-layout">
                    {/* Always keep the EmotionDetector mounted to track data in background. 
                        We hide the visuals when not in live mode, but the component needs to stay alive
                        to keep updating the analytics via onResults. */}

                    <div style={{ display: activeTab === 'live' ? 'block' : 'none' }}>
                        {/* Hero Section with Video */}
                        <section className="viewport-section" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
                            <div className="video-frame">
                                {!hasCamera && (
                                    <div className="camera-placeholder">
                                        <Camera size={48} className="animate-pulse opacity-20" />
                                        <p>INITIALIZING OPTICAL SENSORS...</p>
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
                                        <Activity size={20} className="text-cyan-400" />
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '1rem' }}>
                                                <span style={{ fontSize: '0.6rem', opacity: 0.7, letterSpacing: '1px' }}>PRIMARY INTENT</span>
                                                <span style={{ fontSize: '0.6rem', color: 'var(--neon-cyan)', fontWeight: 'bold' }}>
                                                    {(topEmotion.score * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                            <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '2px', lineHeight: '1.2' }}>
                                                {topEmotion.label.toUpperCase()}
                                            </span>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            <div className="action-row" style={{ marginTop: '2rem', justifyContent: 'center' }}>
                                <EmotionDetector videoRef={videoRef} onResults={handleResults} />
                            </div>
                        </section>

                        {/* Stats Section below Hero */}
                        <div className="inspector-panel" style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', background: 'transparent', border: 'none' }}>
                            <div className="panel-header" style={{ justifyContent: 'center', fontSize: '0.9rem', opacity: 0.6 }}>
                                REAL-TIME EMOTIONAL METRICS
                            </div>

                            <div className="stream-list" style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                                gap: '1.5rem',
                                maxWidth: '1200px',
                                margin: '0 auto',
                                width: '100%'
                            }}>
                                {(results.length > 0 ? results : [
                                    { label: 'Angry', score: 0 },
                                    { label: 'Disgust', score: 0 },
                                    { label: 'Fear', score: 0 },
                                    { label: 'Happy', score: 0 },
                                    { label: 'Neutral', score: 0 },
                                    { label: 'Sad', score: 0 },
                                    { label: 'Surprise', score: 0 }
                                ]).map((res) => (
                                    <div key={res.label} className="emotion-node" style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        padding: '1.5rem',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        <div className="node-label" style={{ marginBottom: '1rem' }}>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{res.label.toUpperCase()}</span>
                                            <span style={{
                                                color: res.label === topEmotion.label && res.score > 0.1 ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                                                fontFamily: 'monospace',
                                                fontSize: '1rem'
                                            }}>
                                                {(res.score * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                        <div className="node-bar-bg" style={{ height: '8px' }}>
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
                    </div>

                    {/* Analytics View */}
                    {activeTab === 'analytics' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <AnalyticsView sessionData={sessionData} totalTimeMs={totalTimeMs} />
                        </motion.div>
                    )}

                    {/* Documentation View */}
                    {activeTab === 'docs' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <DocumentationView />
                        </motion.div>
                    )}

                </main>
            </div>

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
