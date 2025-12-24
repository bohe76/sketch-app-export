import React, { useEffect, useState } from 'react';
import { LayoutGroup, motion } from 'framer-motion';
import { fetchFeed } from '../api/feed';
import type { Artwork } from '../api/feed';
import { useAuthStore } from '@/features/auth/model/store';
import { useFeedStore } from '../model/feedStore';
import { useToastStore } from '@/shared/model/toastStore';
import { ArtworkCard } from './ArtworkCard';
import { useResponsiveGrid } from '@/shared/hooks/useResponsiveGrid';

interface FeedListProps {
    filterAuthorId?: string;
    sort?: 'latest' | 'trending';
    onArtworkClick?: (artwork: Artwork) => void;
    refreshKey?: number;
}

import { useShareStore } from '@/shared/model/shareStore';

export const FeedList: React.FC<FeedListProps> = ({ filterAuthorId, sort = 'latest', onArtworkClick, refreshKey }) => {
    const { user } = useAuthStore();
    const { artworks, setArtworks } = useFeedStore();
    const [loading, setLoading] = useState(true);
    const { showToast } = useToastStore();
    const { openShareModal } = useShareStore();
    const { containerRef, columnCount } = useResponsiveGrid();
    const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' && window.innerWidth >= 1024);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Render-phase state update to set loading when relevant props change
    const [lastKnownProps, setLastKnownProps] = useState({ filterAuthorId, sort, userId: user?.uid, refreshKey });

    if (
        lastKnownProps.filterAuthorId !== filterAuthorId ||
        lastKnownProps.sort !== sort ||
        lastKnownProps.userId !== user?.uid ||
        lastKnownProps.refreshKey !== refreshKey
    ) {
        setLastKnownProps({ filterAuthorId, sort, userId: user?.uid, refreshKey });
        setLoading(true);
    }

    useEffect(() => {
        fetchFeed(filterAuthorId, sort, user?.uid)
            .then(setArtworks)
            .finally(() => setLoading(false));
    }, [filterAuthorId, sort, user?.uid, refreshKey, setArtworks]);

    const syncLike = useFeedStore(state => state.syncLike);

    const syncMetric = useFeedStore(state => state.syncMetric);

    const handleLike = async (e: React.MouseEvent, artSnapshot: Artwork) => {
        e.stopPropagation();
        if (!user) {
            showToast("Please login to like artworks.", "info");
            return;
        }
        await syncLike(artSnapshot._id, user.uid);
    };

    const handleDownload = async (e: React.MouseEvent, artSnapshot: Artwork) => {
        e.stopPropagation();

        // Instant response using store sync
        await syncMetric(artSnapshot._id, 'download');

        // Continue with original download logic
        try {
            const response = await fetch(artSnapshot.imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `sketch - ${artSnapshot._id}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed:", error);
            showToast("Failed to download image.", "error");
        }
    };

    const handleShare = async (e: React.MouseEvent, art: Artwork) => {
        e.stopPropagation();

        // Instant response using store sync
        await syncMetric(art._id, 'share');

        // Open our beautiful custom Share Sheet
        openShareModal(art);
    };

    const validArtworks = artworks.filter(art => art && art._id);

    if (loading) {
        return (
            <div ref={containerRef} className="relative w-full overflow-hidden p-4 lg:p-6 pb-20 flex gap-4 justify-center items-start">
                {Array.from({ length: 9 }).map((_, colIndex) => (
                    <div key={`loading - col - ${colIndex} `}
                        className="flex-1 lg:w-[232px] lg:flex-none flex flex-col gap-4"
                        style={{ display: colIndex < columnCount ? 'flex' : 'none' }}
                    >
                        {Array.from({ length: 3 }).map((__, i) => (
                            <div key={i} className="bg-zinc-200 rounded-[32px] animate-pulse w-full" style={{ height: `${280 + (Math.random() * 150)} px` }} />
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
                                key={`fixed - col - ${colIndex} `}
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
                                            showActionsAlways={!isDesktop}
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
