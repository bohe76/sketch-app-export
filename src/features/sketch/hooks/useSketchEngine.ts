import { useEffect, useRef, useState, useCallback } from 'react';
import { SketchEngine } from '../engine/SketchEngine';
import { DEFAULT_OPTIONS } from '../engine/types';
import type { SketchOptions } from '../engine/types';

export const useSketchEngine = (initialOptions: Partial<SketchOptions> = {}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<SketchEngine | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const initialOptionsRef = useRef(initialOptions);
    const currentImageUrlRef = useRef<string | null>(null);

    useEffect(() => {
        if (canvasRef.current && !engineRef.current) {
            // Initialize engine with the actual current options from store if provided later
            engineRef.current = new SketchEngine(canvasRef.current, {
                ...DEFAULT_OPTIONS,
                ...initialOptionsRef.current,
            });

            // CRITICAL: If an image was already pending (e.g. during Remix transition), start it now
            if (currentImageUrlRef.current) {
                engineRef.current.renderLive(currentImageUrlRef.current);
                setIsDrawing(true);
            }
        }

        return () => {
            if (engineRef.current) {
                engineRef.current.stop();
                engineRef.current = null;
            }
        };
    }, []); // Init once

    const startDrawing = useCallback((imageUrl: string, options?: Partial<SketchOptions>) => {
        currentImageUrlRef.current = imageUrl;
        if (engineRef.current) {
            // CRITICAL: Ensure options are applied BEFORE renderLive analysis starts
            if (options) {
                engineRef.current.updateOptions(options);
            }
            engineRef.current.renderLive(imageUrl);
            setIsDrawing(true);
        }
    }, []);

    const stopDrawing = useCallback(() => {
        if (engineRef.current) {
            engineRef.current.stop();
            setIsDrawing(false);
        }
    }, []);

    const updateOptions = useCallback((newOptions: Partial<SketchOptions>) => {
        if (engineRef.current) {
            engineRef.current.updateOptions(newOptions);
        }
    }, []);

    // Handle Resize: Full Reset & Restart
    useEffect(() => {
        const handleResize = () => {
            if (engineRef.current && currentImageUrlRef.current) {
                // Completely restart drawing on resize to fix canvas scaling issues
                engineRef.current.renderLive(currentImageUrlRef.current);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return {
        canvasRef,
        startDrawing,
        stopDrawing,
        updateOptions,
        isDrawing,
    };
};
