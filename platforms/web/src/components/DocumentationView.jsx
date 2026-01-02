import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Brain, Cpu, Eye, Zap, AlertTriangle, FileJson, BookOpen } from 'lucide-react';

export default function DocumentationView() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="documentation-container" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>
            <header className="page-header" style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '2px', marginBottom: '0.5rem' }}>
                    SYSTEM PROTOCOLS
                </h2>
                <p style={{ color: 'var(--text-secondary)', letterSpacing: '1px' }}>
                    TECHNICAL REFERENCE MANUAL v1.0.4
                </p>
            </header>

            <motion.div
                className="docs-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}
            >
                {/* Core Architecture */}
                <motion.div variants={itemVariants} className="glass-card" style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '24px',
                    padding: '2rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'rgba(0, 242, 255, 0.1)', padding: '0.8rem', borderRadius: '12px', color: 'var(--neon-cyan)' }}>
                            <Cpu size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Core Architecture</h3>
                    </div>

                    <p style={{ opacity: 0.8, lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                        SPECTRA operates on a client-side neural inference engine. It utilizes a quantized TensorFlow.js model optimized for WebGL acceleration.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.8rem', borderRadius: '8px' }}>
                            <Eye size={16} style={{ color: 'var(--neon-cyan)' }} />
                            <span style={{ fontSize: '0.9rem' }}>MediaPipe Face Detection (Short-range)</span>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.8rem', borderRadius: '8px' }}>
                            <Brain size={16} style={{ color: '#bc13fe' }} />
                            <span style={{ fontSize: '0.9rem' }}>CNN Emotion Classifier (FER-2013 Architecture)</span>
                        </div>
                    </div>
                </motion.div>

                {/* Privacy & Security */}
                <motion.div variants={itemVariants} className="glass-card" style={{
                    background: 'linear-gradient(135deg, rgba(0, 255, 76, 0.05), rgba(0,0,0,0))',
                    border: '1px solid rgba(0, 255, 76, 0.2)',
                    borderRadius: '24px',
                    padding: '2rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'rgba(0, 255, 76, 0.1)', padding: '0.8rem', borderRadius: '12px', color: '#00ff4c' }}>
                            <Shield size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Zero-Trust Privacy</h3>
                    </div>

                    <p style={{ opacity: 0.8, lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '1rem' }}>
                        This system is designed with a strict "Air-Gapped Logic" philosophy.
                    </p>

                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <li style={{ display: 'flex', gap: '0.8rem', alignItems: 'start' }}>
                            <span style={{ color: '#00ff4c', fontSize: '1.2rem' }}>•</span>
                            <span style={{ opacity: 0.7, fontSize: '0.9rem' }}>Video streams are processed exclusively in your browser's memory.</span>
                        </li>
                        <li style={{ display: 'flex', gap: '0.8rem', alignItems: 'start' }}>
                            <span style={{ color: '#00ff4c', fontSize: '1.2rem' }}>•</span>
                            <span style={{ opacity: 0.7, fontSize: '0.9rem' }}>No biometric data is ever transmitted to external servers.</span>
                        </li>
                        <li style={{ display: 'flex', gap: '0.8rem', alignItems: 'start' }}>
                            <span style={{ color: '#00ff4c', fontSize: '1.2rem' }}>•</span>
                            <span style={{ opacity: 0.7, fontSize: '0.9rem' }}>Session analytics are ephemeral and destroyed upon tab closure.</span>
                        </li>
                    </ul>
                </motion.div>

                {/* Operating Guide */}
                <motion.div variants={itemVariants} className="glass-card" style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '24px',
                    padding: '2rem',
                    gridColumn: '1 / -1'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'rgba(255, 187, 0, 0.1)', padding: '0.8rem', borderRadius: '12px', color: '#ffbb00' }}>
                            <BookOpen size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Operating Manual</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                        <div className="instruction-step">
                            <h4 style={{ color: 'var(--neon-cyan)', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>01. Initialization</h4>
                            <p style={{ opacity: 0.7, fontSize: '0.9rem', lineHeight: '1.5' }}>
                                Ensure adequate frontal lighting. The system requires a clear view of facial landmarks. Avoid strong backlighting or partial face occlusion.
                            </p>
                        </div>
                        <div className="instruction-step">
                            <h4 style={{ color: 'var(--neon-cyan)', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>02. Calibration</h4>
                            <p style={{ opacity: 0.7, fontSize: '0.9rem', lineHeight: '1.5' }}>
                                Use the calibration modal (triggered via internal tools) to adjust the sensitivity matrix if neutral expressions are being misclassified as negative or angry.
                            </p>
                        </div>
                        <div className="instruction-step">
                            <h4 style={{ color: 'var(--neon-cyan)', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>03. Interpretation</h4>
                            <p style={{ opacity: 0.7, fontSize: '0.9rem', lineHeight: '1.5' }}>
                                The "Dominant State" represents the highest confidence score from the inference engine. Fluctuations are normal; look for sustained trends > 2 seconds.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* API Reference (Mock) */}
                <motion.div variants={itemVariants} className="glass-card" style={{
                    background: '#0a0a0f',
                    border: '1px solid #222',
                    borderRadius: '24px',
                    padding: '2rem',
                    gridColumn: '1 / -1'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <FileJson size={20} style={{ opacity: 0.5 }} />
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, fontFamily: 'monospace' }}>Output Schema</h3>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>JSON-LD</span>
                    </div>

                    <pre style={{
                        background: '#000',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        overflowX: 'auto',
                        color: '#00ff4c',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        lineHeight: '1.5',
                        border: '1px solid #111'
                    }}>
                        {`{
  "timestamp": 1704234051235,
  "face_detected": true,
  "metrics": {
    "happy": 0.892,
    "neutral": 0.104,
    "surprise": 0.004,
    // ...other labels
  },
  "bbox": {
    "x": 245, "y": 120, "w": 180, "h": 180
  },
  "status": "CALIBRATED"
}`}
                    </pre>
                </motion.div>

            </motion.div>
        </div>
    );
}
