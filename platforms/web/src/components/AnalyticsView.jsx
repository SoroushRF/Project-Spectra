import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Clock, Activity, Zap } from 'lucide-react';

// Use same colors as the rest of the app or a complimentary palette
const COLORS = {
    happy: '#00f2ff',   // Neon Cyan
    neutral: '#ffffff', // White
    sad: '#ff00ff',     // Magenta
    angry: '#ff4444',   // Red
    fear: '#bc13fe',    // Purple
    surprise: '#fca311', // Amber
    disgust: '#2ec4b6', // Teal
};

function AnalyticsView({ sessionData, totalTimeMs }) {
    // Format data for Recharts
    const chartData = useMemo(() => {
        return Object.entries(sessionData)
            .filter(([_, timeMs]) => timeMs > 0)
            .map(([emotion, timeMs]) => ({
                name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
                value: timeMs,
                color: COLORS[emotion] || '#8884d8'
            }))
            .sort((a, b) => b.value - a.value);
    }, [sessionData]);

    // Calculate percentages and durations
    const formatDuration = (ms) => {
        const seconds = Math.floor(ms / 1000);
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        return `${minutes}m ${seconds % 60}s`;
    };

    const dominantEmotion = chartData.length > 0 ? chartData[0] : null;

    return (
        <div className="analytics-container" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
            <header className="page-header" style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '2px', marginBottom: '0.5rem' }}>
                    EMOTIONAL TIMELINE
                </h2>
                <p style={{ color: 'var(--text-secondary)', letterSpacing: '1px' }}>
                    SESSION DURATION: {formatDuration(totalTimeMs)}
                </p>
            </header>

            <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                {/* Main Chart Card */}
                <div className="glass-card" style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '24px',
                    padding: '2rem',
                    minHeight: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 600 }}>Distribution</h3>

                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#0a0a0f', border: '1px solid #333', borderRadius: '8px' }}
                                    formatter={(value) => formatDuration(value)}
                                />
                                <Legend iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ opacity: 0.5, textAlign: 'center' }}>
                            <Activity size={48} style={{ marginBottom: '1rem' }} />
                            <p>Not enough data collected yet.</p>
                        </div>
                    )}
                </div>

                {/* Insights Panel */}
                <div className="insights-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Dominant State Card */}
                    <div className="glass-card" style={{
                        background: 'linear-gradient(135deg, rgba(0, 242, 255, 0.1), rgba(0,0,0,0))',
                        border: '1px solid var(--neon-cyan)',
                        borderRadius: '24px',
                        padding: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem'
                    }}>
                        <div style={{
                            background: 'var(--neon-cyan)',
                            color: '#000',
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Zap size={32} />
                        </div>
                        <div>
                            <h4 style={{ fontSize: '0.8rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px' }}>Dominant State</h4>
                            <p style={{ fontSize: '2rem', fontWeight: 800 }}>
                                {dominantEmotion ? dominantEmotion.name : 'Processing...'}
                            </p>
                            {dominantEmotion && (
                                <p style={{ fontSize: '0.9rem', color: dominantEmotion.color }}>
                                    {((dominantEmotion.value / totalTimeMs) * 100).toFixed(1)}% of session
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Breakdown List */}
                    <div className="glass-card" style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '24px',
                        padding: '2rem',
                        flex: 1
                    }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Detailed Breakdown</h3>
                        <div className="breakdown-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {chartData.map((item) => (
                                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                                    <span style={{ flex: 1, fontWeight: 500 }}>{item.name}</span>
                                    <span style={{ opacity: 0.6, fontFamily: 'monospace' }}>{formatDuration(item.value)}</span>
                                    <span style={{ width: '50px', textAlign: 'right', fontWeight: 700, color: 'var(--neon-cyan)' }}>
                                        {((item.value / totalTimeMs) * 100).toFixed(1)}%
                                    </span>
                                </div>
                            ))}
                            {chartData.length === 0 && <p style={{ opacity: 0.5 }}>Waiting for data stream...</p>}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default AnalyticsView;
