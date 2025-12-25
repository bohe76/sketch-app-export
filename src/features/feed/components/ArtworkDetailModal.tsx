import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    XMarkIcon,
    HeartIcon as HeartOutline,
    ArrowDownTrayIcon,
    ShareIcon,
    ArrowPathIcon,
    TrashIcon,
    PencilIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useFeedStore } from '../model/feedStore';
import type { Artwork } from '../api/feed';
import { deleteArtwork, fetchArtworkById } from '../api/feed';
import { useToastStore } from '@/shared/model/toastStore';
import { useModalStore } from '@/shared/model/modalStore';
import { useShareStore } from '@/shared/model/shareStore';
import { useAuthStore } from '@/features/auth/model/store';

interface ArtworkDetailModalProps {
    artwork: Artwork;
    currentUserId?: string;
    onClose: () => void;
    onRemix: (artwork: Artwork) => void;
    onDelete: (artworkId: string) => void;
}

export const ArtworkDetailModal: React.FC<ArtworkDetailModalProps> = ({ artwork: initialArtwork, currentUserId, onClose, onRemix, onDelete }) => {
    const showToast = useToastStore(state => state.showToast);
    const { openModal } = useModalStore();
    const isAdmin = useAuthStore(state => state.isAdmin);
    const { artworks, updateArtwork } = useFeedStore();
    const [hoverItem, setHoverItem] = useState<string | null>(null);
    const [imgLoaded, setImgLoaded] = useState(false);
    const [showLoading, setShowLoading] = useState(false);



    // Get the latest artwork data from the store
    const artwork = artworks.find(a => a._id === initialArtwork._id) || initialArtwork;
    const isSkeleton = !artwork.authorName;

    // Randomize Mask Origin (Top-Left or Top-Right) on mount
    const maskOrigin = React.useMemo(() => {
        const origins = ['0% 0%', '100% 0%'];
        // Use artwork ID to pick a stable origin instead of Math.random (impurity)
        const idSum = initialArtwork._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return origins[idSum % origins.length];
    }, [initialArtwork._id]);

    // Delayed Loading Strategy: Only show loading UI if image takes more than 400ms
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (!imgLoaded && artwork.imageUrl) {
            timer = setTimeout(() => {
                setShowLoading(true);
            }, 400); // 400ms threshold for cached images
        } else {
            // Avoid synchronous setState in effect (react-hooks/set-state-in-effect)
            const st = setTimeout(() => setShowLoading(false), 0);
            return () => clearTimeout(st);
        }
        return () => clearTimeout(timer);
    }, [imgLoaded, artwork.imageUrl]);

    // Instantly communicate with DB when needed (on modal open)
    useEffect(() => {
        fetchArtworkById(initialArtwork._id, currentUserId)
            .then(freshArtwork => {
                if (freshArtwork) {
                    updateArtwork(initialArtwork._id, freshArtwork);
                }
            })
            .catch(err => console.error("Failed to sync artwork on open:", err));
    }, [initialArtwork._id, currentUserId, updateArtwork]);

    const syncLike = useFeedStore(state => state.syncLike);
    const syncMetric = useFeedStore(state => state.syncMetric);

    const handleLikeToggle = async () => {
        if (!currentUserId) {
            alert("Please login to like artworks.");
            return;
        }

        // High-performance background sync
        await syncLike(initialArtwork._id, currentUserId);
    };

    const handleDownload = async () => {
        // High-performance background sync (No await)
        syncMetric(initialArtwork._id, 'download');

        try {
            const response = await fetch(artwork.imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `sketch-${initialArtwork._id}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download image.");
        }
    };

    const { openShareModal } = useShareStore();

    const handleShare = () => {
        // 1. Open Modal INSTANTLY (Highest Priority)
        openShareModal(artwork);

        // 2. Defer heavy state updates (metric sync) to next tick to avoid blocking UI
        setTimeout(() => {
            syncMetric(initialArtwork._id, 'share');
        }, 0);
    };

    const handleDelete = async () => {
        if (!currentUserId || (currentUserId !== artwork.authorId && !isAdmin)) return;

        openModal({
            title: "Delete Artwork",
            content: "Are you sure you want to delete this masterpiece? This action cannot be undone.",
            confirmText: "Delete Permanently",
            onConfirm: async () => {
                // Backup for rollback
                const backupArtwork = { ...artwork };

                // 1. Optimistic Update: Close UI & Remove from list instantly
                onDelete(artwork._id); // This calls store's removeArtwork
                onClose();             // Close the detail modal

                try {
                    // 2. Background deletion
                    await deleteArtwork(artwork._id, currentUserId);
                } catch (error) {
                    console.error("Delayed Delete Error (Rolling back):", error);

                    // 3. Rollback: Restore to store if feed list is still relevant
                    // We add it back to the beginning of the list for visibility
                    const currentArtworks = useFeedStore.getState().artworks;
                    useFeedStore.getState().setArtworks([backupArtwork, ...currentArtworks]);

                    showToast("Failed to delete from server. Restored to gallery.", "error");
                }
            }
        });
    };

    const handleRemixClick = async () => {
        // High-performance background sync (No await)
        syncMetric(initialArtwork._id, 'remix');
        onRemix(artwork);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 lg:p-6 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                onClick={onClose}
            />

            {/* Modal Container: 90vw width, 85vh fixed height on mobile */}
            <motion.div
                layout
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative bg-white w-full lg:w-[90vw] h-[85vh] lg:h-[90vh] max-h-[90vh] rounded-[32px] lg:rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300"
            >

                {/* 1. Header: Author & Title (Left) */}
                <header className="px-6 lg:px-10 pt-6 lg:pt-10 pb-4 lg:pb-6 flex items-start justify-between">
                    <div className="flex flex-col gap-1 lg:gap-1.5 overflow-hidden w-full max-w-2xl">
                        {!artwork.authorName ? (
                            <>
                                <div className="h-4 w-32 bg-zinc-200 animate-pulse rounded-md" />
                                <div className="h-10 w-64 bg-zinc-200 animate-pulse rounded-md mt-1" />
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-2">
                                    <span className="text-zinc-400 font-bold text-[10px] lg:text-sm tracking-tight uppercase whitespace-nowrap">Author</span>
                                    <span className="text-zinc-900 font-black text-xs lg:text-sm truncate">@{artwork.authorName}</span>
                                </div>
                                <h2 className="text-2xl lg:text-4xl font-black text-zinc-900 tracking-tighter leading-normal truncate pb-2">{artwork.title}</h2>
                            </>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1 lg:p-2 hover:bg-zinc-50 rounded-full transition-colors text-zinc-800 hover:text-black flex-shrink-0"
                    >
                        <XMarkIcon className="w-6 h-6 lg:w-8 h-8" />
                    </button>
                </header>

                {/* 2. Main Body: Image Area (Centered, max 80% of modal) */}
                <main className="flex-1 flex items-center justify-center p-4 lg:p-6 overflow-hidden bg-white min-h-0">
                    <div className="w-full h-full flex items-center justify-center">
                        {(!artwork.imageUrl || (imgLoaded === false && showLoading)) && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50 rounded-[32px] animate-pulse">
                                <ArrowPathIcon className="w-10 h-10 lg:w-12 h-12 text-zinc-300 animate-spin mb-4" />
                                <span className="text-zinc-400 font-bold text-[10px] lg:text-xs tracking-widest uppercase">Loading Artwork...</span>
                            </div>
                        )}
                        {artwork.imageUrl && (
                            <motion.img
                                src={artwork.imageUrl}
                                alt={artwork.title}
                                onLoad={() => setImgLoaded(true)}
                                initial={{
                                    opacity: 0,
                                    WebkitMaskImage: `radial-gradient(circle at ${maskOrigin}, black 0%, transparent 0%)`,
                                    maskImage: `radial-gradient(circle at ${maskOrigin}, black 0%, transparent 0%)`
                                } as any}
                                animate={imgLoaded ? {
                                    opacity: 1,
                                    WebkitMaskImage: `radial-gradient(circle at ${maskOrigin}, black 150%, transparent 200%)`,
                                    maskImage: `radial-gradient(circle at ${maskOrigin}, black 150%, transparent 200%)`
                                } as any : {}}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="max-w-full lg:max-w-[72vw] max-h-[50vh] lg:max-h-[72vh] w-auto h-auto object-contain"
                            />
                        )}
                    </div>
                </main>

                {/* 3. Footer: Actions (Right-aligned Icons + Counts with Tooltips) */}
                <footer className="px-6 lg:px-10 pb-8 lg:pb-10 pt-4 lg:pt-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-end gap-7 lg:gap-10 bg-white">
                    {/* Metrics Container: Spaced between on mobile, clustered on desktop */}
                    <div className="flex items-center justify-between lg:justify-end gap-8 px-1 lg:px-0">
                        {isSkeleton ? (
                            <div className="flex items-center gap-8">
                                <div className="h-6 w-16 bg-zinc-200 animate-pulse rounded-full" />
                                <div className="h-6 w-16 bg-zinc-200 animate-pulse rounded-full" />
                                <div className="h-6 w-16 bg-zinc-200 animate-pulse rounded-full" />
                            </div>
                        ) : (
                            /* Left Group: General Metrics */
                            <div className="flex items-center gap-7 lg:gap-8">
                                {/* Like Action */}
                                <div className="relative group">
                                    <div className="flex items-center gap-1.5 lg:gap-2 transition-all">
                                        <button
                                            onClick={handleLikeToggle}
                                            onMouseEnter={() => setHoverItem('like')}
                                            onMouseLeave={() => setHoverItem(null)}
                                            className="p-1 rounded-full hover:bg-zinc-50 transition-all active:scale-90"
                                            disabled={isSkeleton}
                                        >
                                            {artwork.isLiked ? <HeartSolid className="w-5 h-5 lg:w-6 h-6 text-red-500" /> : <HeartOutline className="w-5 h-5 lg:w-6 h-6 text-zinc-600" />}
                                        </button>
                                        <span className={`text - sm lg: text - base font - bold tabular - nums min - w - [20px] ${artwork.isLiked ? 'text-red-500' : 'text-zinc-900'} `}>{artwork.likeCount || 0}</span>
                                    </div>
                                    {hoverItem === 'like' && (
                                        <div className="tooltip-box animate-tooltip-in">
                                            {artwork.isLiked ? 'UNLIKE' : 'LIKE IT'}
                                        </div>
                                    )}
                                </div>

                                {/* Download Action */}
                                <div className="relative group">
                                    <div className="flex items-center gap-1.5 lg:gap-2 text-zinc-600">
                                        <button
                                            onClick={handleDownload}
                                            onMouseEnter={() => setHoverItem('download')}
                                            onMouseLeave={() => setHoverItem(null)}
                                            className="p-1 rounded-full hover:bg-zinc-50 transition-all active:scale-90 hover:text-zinc-900"
                                            disabled={isSkeleton}
                                        >
                                            <ArrowDownTrayIcon className="w-5 h-5 lg:w-6 h-6" />
                                        </button>
                                        <span className="text-sm lg:text-base font-bold tabular-nums min-w-[20px]">{artwork.downloadCount || 0}</span>
                                    </div>
                                    {hoverItem === 'download' && (
                                        <div className="tooltip-box animate-tooltip-in">
                                            DOWNLOAD PNG
                                        </div>
                                    )}
                                </div>

                                {/* Share Action */}
                                <div className="relative group">
                                    <div className="flex items-center gap-1.5 lg:gap-2 text-zinc-600">
                                        <button
                                            onClick={handleShare}
                                            onMouseEnter={() => setHoverItem('share')}
                                            onMouseLeave={() => setHoverItem(null)}
                                            className="p-1 rounded-full hover:bg-zinc-50 transition-all active:scale-90 hover:text-zinc-900"
                                            disabled={isSkeleton}
                                        >
                                            <ShareIcon className="w-5 h-5 lg:w-6 h-6" />
                                        </button>
                                        <span className="text-sm lg:text-base font-bold tabular-nums min-w-[20px]">{artwork.shareCount || 0}</span>
                                    </div>
                                    {hoverItem === 'share' && (
                                        <div className="tooltip-box animate-tooltip-in">
                                            SHARE ART
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {/* Right Group: Owner Actions (Edit & Delete) */}
                        {(currentUserId === artwork.authorId || isAdmin) && (
                            <div className="flex items-center gap-7 lg:gap-8">
                                {/* Edit Action - ONLY for Author */}
                                {currentUserId === artwork.authorId && (
                                    <div className="relative group">
                                        <button
                                            onClick={() => onRemix(artwork)}
                                            onMouseEnter={() => setHoverItem('edit')}
                                            onMouseLeave={() => setHoverItem(null)}
                                            className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors"
                                        >
                                            <PencilIcon className="w-5 h-5 lg:w-6 h-6" />
                                        </button>
                                        {hoverItem === 'edit' && (
                                            <div className="tooltip-box animate-tooltip-in">
                                                EDIT ART
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Delete Action - Author OR Admin */}
                                <div className="relative group">
                                    <button
                                        onClick={handleDelete}
                                        onMouseEnter={() => setHoverItem('delete')}
                                        onMouseLeave={() => setHoverItem(null)}
                                        className="flex items-center gap-2 text-zinc-600 hover:text-red-500 transition-colors"
                                    >
                                        <TrashIcon className="w-5 h-5 lg:w-6 h-6" />
                                    </button>
                                    {hoverItem === 'delete' && (
                                        <div className="tooltip-box animate-tooltip-in !border-red-500 !text-red-500">
                                            DELETE
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Remix Action (Main Highlight) */}
                    <div className="relative group w-full lg:w-auto">
                        <button
                            onClick={handleRemixClick}
                            onMouseEnter={() => setHoverItem('remix')}
                            onMouseLeave={() => setHoverItem(null)}
                            className="btn-hero w-full flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <ArrowPathIcon className="w-4 h-4 lg:w-5 h-5" />
                            <span className="text-sm lg:text-base font-bold tracking-tight uppercase">Remix</span>
                            <div className="w-px h-3 bg-white/20 mx-1" />
                            <span className="text-sm lg:text-base font-medium">{artwork.remixCount || 0}</span>
                        </button>
                        {hoverItem === 'remix' && (
                            <div className="tooltip-box animate-tooltip-in">
                                DRAW THIS STYLE
                            </div>
                        )}
                    </div>
                </footer>

            </motion.div>
        </div>
    );
};
