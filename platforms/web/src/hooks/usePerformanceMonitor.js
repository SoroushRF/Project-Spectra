import { useState, useCallback, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';

/**
 * Spectra Performance Monitor Hook
 * Provides high-precision tracking for AI pipeline latencies and hardware health.
 */
export const usePerformanceMonitor = (windowSize = 60) => {
    const [metrics, setMetrics] = useState({
        fps: 0,
        detectionLatency: 0,
        inferenceLatency: 0,
        totalLatency: 0,
        tensorCount: 0,
        gpuMemory: 0
    });

    // Persistent ref for immediate access inside loops
    const metricsRef = useRef(metrics);

    // Buffers for rolling averages
    const buffers = useRef({
        fps: [],
        detection: [],
        inference: [],
        total: []
    });

    const lastFrameTime = useRef(performance.now());
    const startTime = useRef(performance.now()); // For initialization stabilization

    const updateMetrics = useCallback((newLatencies) => {
        const now = performance.now();
        const delta = now - lastFrameTime.current;
        lastFrameTime.current = now;

        const currentFps = 1000 / delta;

        const addToBuffer = (buffer, val) => {
            buffer.push(val);
            if (buffer.length > windowSize) buffer.shift();
        };

        addToBuffer(buffers.current.fps, currentFps);
        addToBuffer(buffers.current.detection, newLatencies.detection || 0);
        addToBuffer(buffers.current.inference, newLatencies.inference || 0);
        addToBuffer(buffers.current.total, newLatencies.total || 0);

        const getAvg = (buffer) => buffer.reduce((a, b) => a + b, 0) / buffer.length;
        const memInfo = tf.memory();
        const gpuMB = memInfo.numBytesInGPU / (1024 * 1024);

        // --- STABILIZED LEAK DETECTION ---
        // 1. Ignore the first 10 seconds of operation (initialization noise)
        const isStabilized = (now - startTime.current) > 10000;
        
        // 2. ONLY start collecting floor data AFTER stabilization
        if (isStabilized) {
            if (!buffers.current.memFloor) buffers.current.memFloor = [];
            buffers.current.memFloor.push(gpuMB);
            if (buffers.current.memFloor.length > 500) buffers.current.memFloor.shift();
        }

        let isMemoryLeaking = false;
        // 3. Only perform the check if the buffer is full (meaning 10s + 500 frames have passed)
        if (isStabilized && buffers.current.memFloor?.length === 500) {
            const firstQuarterMin = Math.min(...buffers.current.memFloor.slice(0, 125));
            const lastQuarterMin = Math.min(...buffers.current.memFloor.slice(375));
            
            // leak only if the floor itself rises uncontrollably
            if (lastQuarterMin > firstQuarterMin + 15) { // Increased threshold to 15MB
                isMemoryLeaking = true;
                buffers.current.lastLeakAt = now;
            }
        }

        // LATCH: Keep alert active for 5 seconds after detection to prevent flicker
        // FIX: Ensure we don't trigger on '0' at startup by checking if lastLeakAt is truly set
        const latchedLeak = isMemoryLeaking || (buffers.current.lastLeakAt && (now - buffers.current.lastLeakAt < 5000));

        const latest = {
            fps: Math.round(getAvg(buffers.current.fps)),
            detectionLatency: getAvg(buffers.current.detection).toFixed(1),
            inferenceLatency: getAvg(buffers.current.inference).toFixed(1),
            totalLatency: getAvg(buffers.current.total).toFixed(1),
            tensorCount: memInfo.numTensors,
            gpuMemory: gpuMB.toFixed(2),
            isMemoryLeaking: latchedLeak
        };

        metricsRef.current = latest;
        setMetrics(latest);
    }, [windowSize]);

    return { metrics, metricsRef, updateMetrics };
};
