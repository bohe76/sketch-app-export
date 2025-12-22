import { create } from 'zustand';

interface UIState {
    viewMode: 'studio' | 'feed';
    setViewMode: (viewMode: 'studio' | 'feed') => void;
    activeTab: 'trending' | 'latest' | 'mine';
    setActiveTab: (tab: 'trending' | 'latest' | 'mine') => void;
}

export const useUIStore = create<UIState>((set) => ({
    viewMode: 'feed',
    setViewMode: (viewMode) => set({ viewMode }),
    activeTab: 'latest',
    setActiveTab: (activeTab) => set({ activeTab }),
}));
