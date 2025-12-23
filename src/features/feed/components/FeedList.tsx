import React, { useEffect, useState, useRef } from 'react';
import { LayoutGroup, motion } from 'framer-motion';
import { fetchFeed, toggleLike, trackMetric } from '../api/feed';
import type { Artwork } from '../api/feed';
import { useAuthStore } from '@/features/auth/model/store';
import { useFeedStore } from '../model/feedStore';
import { useToastStore } from '@/shared/model/toastStore';
import { ArtworkCard } from './ArtworkCard';
import { useResponsiveGrid } from '@/shared/hooks/useResponsiveGrid';
import { APP_CONFIG } from '@/shared/config/constants';

interface FeedListProps {
    filterAuthorId?: string;
    sort?: 'latest' | 'trending';
    onArtworkClick?: (artwork: Artwork) => void;
    refreshKey?: number;
}

export const FeedList: React.FC<FeedListProps> = ({ filterAuthorId, sort = 'latest', onArtworkClick, refreshKey }) => {
    const { user } = useAuthStore();
    const { artworks, setArtworks, updateArtwork } = useFeedStore();
    const [loading, setLoading] = useState(true);
    const lastProps = useRef({ filterAuthorId, sort, userId: user?.uid, refreshKey });
    const showToast = useToastStore(state => state.showToast);
    const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' && window.innerWidth >= 1024);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Use Custom Hook
    const { containerRef, columnCount } = useResponsiveGrid();

    // Request Tracking
    const pendingLikes = useRef<Set<string>>(new Set());
    const pendingDownloads = useRef<Set<string>>(new Set());
    const pendingShares = useRef<Set<string>>(new Set());



    if (lastProps.current.filterAuthorId !== filterAuthorId || lastProps.current.sort !== sort || lastProps.current.userId !== user?.uid || lastProps.current.refreshKey !== refreshKey) {
        lastProps.current = { filterAuthorId, sort, userId: user?.uid, refreshKey };
        setLoading(true);
    }

    useEffect(() => {
        fetchFeed(filterAuthorId, sort, user?.uid)
            .then(setArtworks)
            .finally(() => setLoading(false));
    }, [filterAuthorId, sort, user?.uid, refreshKey, setArtworks]);

    const handleLike = async (e: React.MouseEvent, art: Artwork) => {
        e.stopPropagation();
        if (!user) {
            showToast("Please login to like artworks.", "info");
            return;
        }
        if (pendingLikes.current.has(art._id)) return;
        pendingLikes.current.add(art._id);

        const newLikedState = !art.isLiked;
        const newLikes = newLikedState ? (art.likeCount || 0) + 1 : (art.likeCount || 0) - 1;

        updateArtwork(art._id, { likeCount: newLikes, isLiked: newLikedState });

        try {
            const result = await toggleLike(art._id, user.uid, newLikedState);
            updateArtwork(art._id, { likeCount: result.likeCount, isLiked: newLikedState });
        } catch {
            updateArtwork(art._id, { likeCount: art.likeCount, isLiked: art.isLiked });
            showToast("Failed to update like status.", "error");
        } finally {
            pendingLikes.current.delete(art._id);
        }
    };

    const handleDownload = async (e: React.MouseEvent, art: Artwork) => {
        e.stopPropagation();
        if (pendingDownloads.current.has(art._id)) return;
        pendingDownloads.current.add(art._id);

        const nextCount = (art.downloadCount || 0) + 1;
        updateArtwork(art._id, { downloadCount: nextCount });

        try {
            const response = await fetch(art.imageUrl, { mode: 'cors' });
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${art.title.replace(/\s+/g, '_')}.png`;
            link.click();
            URL.revokeObjectURL(blobUrl);
            const result = await trackMetric(art._id, 'download');
            if (result.success) updateArtwork(art._id, { downloadCount: result.count });
        } catch {
            const downloadUrl = art.imageUrl + (art.imageUrl.includes('?') ? '&' : '?') + `dl=${encodeURIComponent(art.title)}.png`;
            window.open(downloadUrl, '_blank');
            try { trackMetric(art._id, 'download'); } catch { /* ignore */ }
        } finally {
            pendingDownloads.current.delete(art._id);
        }
    };

    const handleShare = async (e: React.MouseEvent, art: Artwork) => {
        e.stopPropagation();
        if (pendingShares.current.has(art._id)) return;
        pendingShares.current.add(art._id);

        const shareUrl = `${window.location.origin}/?artwork=${art._id}`;
        const nextCount = (art.shareCount || 0) + 1;
        updateArtwork(art._id, { shareCount: nextCount });

        if (navigator.share) {
            try {
                await navigator.share({ title: art.title, text: `Check out this artwork by @${art.authorName} on Sketchrang!`, url: shareUrl });
                const result = await trackMetric(art._id, 'share');
                if (result.success) updateArtwork(art._id, { shareCount: result.count });
            } catch { /* aborted */ }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                showToast("Link copied to clipboard!", "success");
                const result = await trackMetric(art._id, 'share');
                if (result.success) updateArtwork(art._id, { shareCount: result.count });
            } catch {
                showToast("Failed to copy link.", "error");
            } finally {
                pendingShares.current.delete(art._id);
            }
        }
    };

    const validArtworks = artworks.filter(art => art && art._id);
    const displayColumnCount = validArtworks.length > 0 ? Math.min(columnCount, validArtworks.length) : columnCount;

    if (loading) {
        return (
            <div ref={containerRef} className="relative w-full overflow-hidden p-4 lg:p-6 pb-20 flex gap-4 justify-center items-start">
                {Array.from({ length: 9 }).map((_, colIndex) => (
                    <div key={`loading-col-${colIndex}`}
                        className="flex-1 lg:w-[232px] lg:flex-none flex flex-col gap-4"
                        style={{ display: colIndex < columnCount ? 'flex' : 'none' }}
                    >
                        {Array.from({ length: 3 }).map((__, i) => (
                            <div key={i} className="bg-zinc-200 rounded-[32px] animate-pulse w-full" style={{ height: `${280 + (Math.random() * 150)}px` }} />
                        ))}
                    </div>
                ))}
            </div>
        );
    }

    if (artworks.length === 0) {
        return (
            <div ref={containerRef} className="text-center p-20 text-gray-500 w-full">
                <p className="text-lg font-medium mb-2">{filterAuthorId ? "No artworks found" : "No artworks yet"}</p>
                <p className="text-sm">{filterAuthorId ? "This user hasn't published anything yet." : "Be the first to publish a sketch!"}</p>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative w-full overflow-hidden p-4 lg:p-6 pb-20 min-h-screen">
            <LayoutGroup id="feed-grid">
                <motion.div
                    layout="position"
                    transition={{ type: "tween", ease: "easeOut", duration: 0.15 }}
                    className="flex justify-center items-start"
                >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((colIndex) => {
                        const isActive = colIndex < columnCount;
                        return (
                            <motion.div
                                key={`fixed-col-${colIndex}`}
                                layout
                                initial={false}
                                animate={{
                                    flex: isActive ? 1 : 0,
                                    opacity: isActive ? 1 : 0,
                                    maxWidth: isActive ? (isDesktop ? '232px' : '100%') : '0px',
                                    padding: isActive ? '0px 8px' : '0px'
                                }}
                                transition={{
                                    type: "tween",
                                    ease: "easeOut",
                                    duration: isDesktop ? 0.15 : 0
                                }}
                                className="flex flex-col gap-4 overflow-hidden lg:flex-none"
                                style={{ pointerEvents: isActive ? 'auto' : 'none' }}
                            >
                                {validArtworks
                                    .filter((_, idx) => idx % columnCount === colIndex)
                                    .map((art) => (
                                        <ArtworkCard
                                            key={art._id}
                                            art={art}
                                            isLiked={art.isLiked || false}
                                            likeCount={art.likeCount || 0}
                                            onLike={handleLike}
                                            onDownload={handleDownload}
                                            onShare={handleShare}
                                            onClick={() => onArtworkClick?.(art)}
                                        />
                                    ))}
                            </motion.div>
                        );
                    })}
                </motion.div>
            </LayoutGroup>
        </div>
    );
};
