import { create } from 'zustand';
import type { Artwork } from '../api/feed';

interface FeedState {
    artworks: Artwork[];
    setArtworks: (artworks: Artwork[]) => void;
    updateArtwork: (id: string, updates: Partial<Artwork>) => void;
    removeArtwork: (id: string) => void;
}

export const useFeedStore = create<FeedState>((set) => ({
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
}));
