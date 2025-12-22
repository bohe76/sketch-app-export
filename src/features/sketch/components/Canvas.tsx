import React, { useEffect } from 'react';
import { useSketchEngine } from '../hooks/useSketchEngine';
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
    const { canvasRef, startDrawing, updateOptions } = useSketchEngine(options);

    // Trigger drawing when image or options change
    useEffect(() => {
        if (imageUrl) {
            startDrawing(imageUrl);
        }
    }, [imageUrl, startDrawing, options]);

    // Update options in real-time
    useEffect(() => {
        if (options) {
            updateOptions(options);
        }
    }, [options, updateOptions]);

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
