import { create } from 'zustand';
import type { Artwork } from '@/features/feed/api/feed';

interface ShareState {
    isOpen: boolean;
    artwork: Artwork | null;
    openShareModal: (artwork: Artwork) => void;
    closeShareModal: () => void;
}

export const useShareStore = create<ShareState>((set) => ({
    isOpen: false,
    artwork: null,
    openShareModal: (artwork) => set({ isOpen: true, artwork }),
    closeShareModal: () => set({ isOpen: false, artwork: null }),
}));
