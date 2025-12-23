import React, { useEffect } from 'react';
import { useSketchEngine } from '../hooks/useSketchEngine';
import { useSketchStore } from '../model/store';
import type { SketchOptions } from '../engine/types';

interface CanvasProps {
    imageUrl: string | null;
    options?: Partial<SketchOptions>;
    className?: string;
    onReady?: () => void;
}

export const Canvas: React.FC<CanvasProps> = React.memo(({
    imageUrl,
    options,
    className = '',
    onReady
}) => {
    const isPaused = useSketchStore(state => state.isPaused);
    const { canvasRef, startDrawing, stopDrawing, updateOptions } = useSketchEngine(options);

    // Stop and Clear Canvas when paused
    useEffect(() => {
        if (isPaused) {
            stopDrawing();
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    // Update: context size might change, ensure we clear the layout size
                    const width = canvas.width / (window.devicePixelRatio || 1);
                    const height = canvas.height / (window.devicePixelRatio || 1);
                    ctx.clearRect(0, 0, width, height);
                }
            }
        }
    }, [isPaused, stopDrawing]);

    // Trigger drawing when image or options change
    useEffect(() => {
        if (imageUrl && !isPaused) {
            // Small timeout to ensure engine initialization has completed in the other hook
            const timer = setTimeout(() => {
                const canvas = canvasRef.current;
                // STABILITY CHECK: Prevent 'Invalid dimensions' error if canvas is not yet sized properly in DOM
                if (canvas && canvas.clientWidth > 0 && canvas.clientHeight > 0) {
                    startDrawing(imageUrl, options);
                }
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [imageUrl, startDrawing, options, isPaused]);

    // Update options in real-time
    useEffect(() => {
        if (options && !isPaused) {
            updateOptions(options);
        }
    }, [options, updateOptions, isPaused]);

    // Signal ready
    useEffect(() => {
        if (onReady) onReady();
    }, [onReady]);

    return (
        <div className={`relative w-full h-full overflow-hidden bg-white ${className}`}>
            <canvas
                ref={canvasRef}
                className="block w-full h-full touch-none" // touch-none for better mobile handling
            />
        </div>
    );
});
