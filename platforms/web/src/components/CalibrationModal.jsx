import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckCircle2, AlertCircle } from 'lucide-react';

const CALIBRATION_STEPS = [
    { label: 'Surprise', emoji: '😲', prompt: 'SHOW_ASTONISHMENT' },
    { label: 'Happy', emoji: '😊', prompt: 'GENERATE_JOY' },
    { label: 'Sad', emoji: '😔', prompt: 'REFLECT_SORROW' },
];

export default function CalibrationModal({ activeResults, onComplete, onCancel }) {
    const [step, setStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [calibrations, setCalibrations] = useState({});
    const samplesRef = useRef([]);

    const currentStep = CALIBRATION_STEPS[step];
    const currentScore = activeResults.find(r => r.label === currentStep?.label)?.score || 0;
    const neutralScore = activeResults.find(r => r.label === 'Neutral')?.score || 0;

    useEffect(() => {
        if (!currentStep) return;

        // If user is making the face (threshold 0.1)
        if (currentScore > 0.05) {
            setProgress(prev => Math.min(prev + 1.5, 100));
            samplesRef.current.push({ target: currentScore, neutral: neutralScore });
        } else {
            setProgress(prev => Math.max(prev - 0.5, 0));
        }

        if (progress >= 100) {
            // Calculate optimal boost from gathered samples
            const avgTarget = samplesRef.current.reduce((acc, s) => acc + s.target, 0) / samplesRef.current.length;
            const avgNeutral = samplesRef.current.reduce((acc, s) => acc + s.neutral, 0) / samplesRef.current.length;

            // We want the target emotion to be at least 1.5x stronger than neutral during this peak
            const boost = (avgNeutral * 1.5) / (avgTarget + 0.01);
            const finalBoost = Math.max(1.2, Math.min(boost, 5.0)); // Cap between 1.2x and 5x

            const targetEmotion = currentStep.label;
            const newCalibrations = { ...calibrations, [targetEmotion]: finalBoost };
            setCalibrations(newCalibrations);
            samplesRef.current = [];

            if (step < CALIBRATION_STEPS.length - 1) {
                setStep(step + 1);
                setProgress(0);
            } else {
                onComplete(newCalibrations);
            }
        }
    }, [activeResults, progress]);

    return (
        <div className="calibration-overlay">
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="calibration-card"
            >
                <div className="card-top">
                    <Target size={16} className="text-cyan-400" />
                    <span className="step-counter">MATRIX_ALIGNMENT // 0{step + 1}_0{CALIBRATION_STEPS.length}</span>
                </div>

                <div className="calibration-content">
                    <motion.div
                        key={currentStep.emoji}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="big-emoji"
                    >
                        {currentStep.emoji}
                    </motion.div>

                    <h2 className="prompt-text">{currentStep.prompt}</h2>
                    <p className="instruction-sub">Hold expression. System is sampling facial geometry...</p>

                    <div className="live-feedback">
                        <div className="feedback-label">
                            <span>SENSORY_INPUT</span>
                            <span style={{ color: currentScore > 0.1 ? 'var(--neon-cyan)' : 'var(--text-secondary)' }}>
                                {(currentScore * 100).toFixed(0)}%
                            </span>
                        </div>
                        <div className="mini-progress-bg">
                            <motion.div
                                className="mini-progress-fill"
                                animate={{ width: `${currentScore * 100}%` }}
                                style={{ background: currentScore > 0.1 ? 'var(--neon-cyan)' : 'white' }}
                            />
                        </div>
                    </div>

                    <div className="main-meter-container">
                        <div className="meter-label">ALIGNMENT_PROGRESS</div>
                        <div className="calibration-meter">
                            <motion.div
                                className="meter-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="card-actions">
                    <button className="btn-ghost" onClick={onCancel}>
                        <AlertCircle size={14} />
                        ABORT_SEQUENCE
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
