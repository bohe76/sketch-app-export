import { create } from 'zustand';

interface PublishModalState {
    isOpen: boolean;
    canvas: HTMLCanvasElement | null;
    openPublishModal: (canvas: HTMLCanvasElement) => void;
    closePublishModal: () => void;
}

export const usePublishModalStore = create<PublishModalState>((set) => ({
    isOpen: false,
    canvas: null,
    openPublishModal: (canvas) => set({ isOpen: true, canvas }),
    closePublishModal: () => set({ isOpen: false, canvas: null }),
}));
