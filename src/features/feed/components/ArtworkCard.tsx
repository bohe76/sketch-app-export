import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { HeartIcon, ShareIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import type { Artwork } from '../api/feed';
import { SketchEngine } from '@/features/sketch/engine/SketchEngine';

interface ArtworkCardProps {
    art: Artwork;
    isLiked: boolean;
    likeCount: number;
    onLike: (e: React.MouseEvent, art: Artwork) => void;
    onDownload: (e: React.MouseEvent, art: Artwork) => void;
    onShare: (e: React.MouseEvent, art: Artwork) => void;
    onClick: () => void;
}

export const ArtworkCard: React.FC<ArtworkCardProps> = ({
    art,
    isLiked,
    likeCount,
    onLike,
    onDownload,
    onShare,
    onClick
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<SketchEngine | null>(null);
    const hoverTimerRef = useRef<any>(null);
    const cleanupTimerRef = useRef<any>(null);

    // Initial check for mobile to prevent hover logic
    const isMobile = typeof window !== 'undefined' && 'ontouchstart' in window;

    const stopSketching = useCallback(() => {
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }
        if (engineRef.current) {
            engineRef.current.stop();
            engineRef.current = null;
        }

        // --- CRITICAL: Clear canvas immediately to prevent ghosting on next hover ---
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
        }
    }, []);

    const startSketching = useCallback(() => {
        if (!canvasRef.current || isMobile) return;

        // Initialize engine with TRANSPARENT mode and on the TOP layer
        engineRef.current = new SketchEngine(canvasRef.current, {
            // Match the artwork's original style if saved, else default
            ...art.options,
            scaleFactor: 1.0,
            drawSpeed: 20, // Moderate speed for feed preview
            maxHeads: 30,
            transparent: true // Critical: Don't fill background with white
        });

        engineRef.current.renderLive(art.imageUrl);
    }, [art.imageUrl, art.options, isMobile]);

    const handleMouseEnter = () => {
        if (isMobile) return;

        if (cleanupTimerRef.current) {
            clearTimeout(cleanupTimerRef.current);
            cleanupTimerRef.current = null;
        }

        setIsHovered(true);

        // DRAW IMMEDIATELY without any delay
        hoverTimerRef.current = setTimeout(() => {
            startSketching();
        }, 0);
    };

    const handleMouseLeave = () => {
        if (isMobile) return;
        setIsHovered(false);

        // Hide and Clean: Canvas goes behind images (z-5) and stays alive for 300ms
        cleanupTimerRef.current = setTimeout(() => {
            stopSketching();
            cleanupTimerRef.current = null;
        }, 300);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopSketching();
            if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current);
        };
    }, [stopSketching]);

    return (
        <motion.div
            layoutId={art._id}
            layout="position"
            className="feed-card group cursor-pointer relative overflow-hidden" // Removed bg-white
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* 1. Original Thumbnail (TEST: Long 3s fade, NO zoom) */}
            <motion.img
                src={art.thumbnailUrl}
                alt={art.title}
                className="w-full h-auto block relative z-10"
                initial={{ opacity: 1 }}
                animate={{
                    opacity: isHovered ? 0 : 1,
                    scale: 1
                }}
                transition={{ duration: isHovered ? 3 : 0.1, ease: "easeInOut" }}
            />

            {/* 2. Live Sketch Canvas (Z-INDEX SWAP: 30 while hovered, 5 while cleaning up) */}
            <div
                className={`absolute inset-0 pointer-events-none transition-opacity duration-300
                    ${isHovered ? 'z-30 opacity-100' : 'z-5 opacity-0'}`}
            >
                <canvas
                    ref={canvasRef}
                    className="w-full h-full block"
                />
            </div>

            {/* 3. Overlay (Actions) - Higher Z-Index and Absolute to prevent layout shifts */}
            <div className={`feed-card-overlay absolute bottom-0 left-0 right-0 z-40 p-4 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex items-end justify-between w-full">
                    <div className="flex items-center bg-white/80 backdrop-blur-md rounded-full shadow-soft px-1.5 py-1">
                        <button
                            onClick={(e) => onLike(e, art)}
                            className="p-1 rounded-full transition-all active:scale-95 hover:bg-zinc-50"
                        >
                            {isLiked ? (
                                <HeartIcon className="w-5 h-5 shrink-0 text-red-500" />
                            ) : (
                                <HeartOutline className="w-5 h-5 shrink-0 text-zinc-600" />
                            )}
                        </button>
                        <span className={`text-[12px] font-bold leading-none tabular-nums pl-0.5 pr-2 ${isLiked ? 'text-red-500' : 'text-zinc-900'}`}>
                            {likeCount}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={(e) => onDownload(e, art)}
                            className="bg-white/80 backdrop-blur-md w-8 h-8 flex items-center justify-center rounded-full shadow-soft text-zinc-600 hover:text-zinc-900 transition-all active:scale-90"
                        >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={(e) => onShare(e, art)}
                            className="bg-white/80 backdrop-blur-md w-8 h-8 flex items-center justify-center rounded-full shadow-soft text-zinc-600 hover:text-zinc-900 transition-all active:scale-90"
                        >
                            <ShareIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
