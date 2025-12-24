import { create } from 'zustand';
import type { Artwork } from '../api/feed';
import { toggleLike, trackMetric } from '../api/feed';
import { AsyncQueueManager } from '@/shared/utils/asyncQueue';

interface FeedState {
    artworks: Artwork[];
    setArtworks: (artworks: Artwork[]) => void;
    updateArtwork: (id: string, updates: Partial<Artwork>) => void;
    removeArtwork: (id: string) => void;
    syncLike: (artworkId: string, userId: string) => Promise<void>;
    syncMetric: (artworkId: string, type: 'download' | 'share' | 'remix') => Promise<void>;
}

// Reusable managers for handling sequential async tasks
const likeQueue = new AsyncQueueManager<boolean>();
const metricQueue = new AsyncQueueManager<'download' | 'share' | 'remix'>();

export const useFeedStore = create<FeedState>((set, get) => ({
    artworks: [],
    setArtworks: (artworks) => set({ artworks }),
    updateArtwork: (id, updates) => set((state) => ({
        artworks: state.artworks.map((art) =>
            art._id === id ? { ...art, ...updates } : art
        )
    })),
    removeArtwork: (id) => set((state) => ({
        artworks: state.artworks.filter((art) => art._id !== id)
    })),

    syncLike: async (artworkId, userId) => {
        const { artworks, updateArtwork } = get();
        const art = artworks.find(a => a._id === artworkId);
        if (!art) return;

        const targetState = !art.isLiked;
        const targetLikes = targetState ? (art.likeCount || 0) + 1 : Math.max(0, (art.likeCount || 0) - 1);
        updateArtwork(artworkId, { isLiked: targetState, likeCount: targetLikes });

        await likeQueue.enqueue(artworkId, targetState, async (stateToSync) => {
            try {
                const result = await toggleLike(artworkId, userId, stateToSync);
                updateArtwork(artworkId, { likeCount: result.likeCount, isLiked: stateToSync });
            } catch (error) {
                console.error("[Store] Sync Like Failed:", error);
            }
        });
    },

    syncMetric: async (artworkId, type) => {
        const { artworks, updateArtwork } = get();
        const art = artworks.find(a => a._id === artworkId);
        if (!art) return;

        const fieldMap: Record<string, keyof Artwork> = {
            download: 'downloadCount',
            share: 'shareCount',
            remix: 'remixCount'
        };
        const field = fieldMap[type];

        // 1. Instant Optimistic UI Update
        const currentCount = (art[field] as number) || 0;
        updateArtwork(artworkId, { [field]: currentCount + 1 });

        // 2. Background Sync
        await metricQueue.enqueue(artworkId, type, async (t) => {
            try {
                const result = await trackMetric(artworkId, t);
                updateArtwork(artworkId, { [field]: result.count });
            } catch (error) {
                console.error(`[Store] Sync ${type} Failed:`, error);
            }
        });
    }
}));
