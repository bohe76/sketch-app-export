import { create } from 'zustand';

interface PublishModalState {
    isOpen: boolean;
    canvas: HTMLCanvasElement | null;
    uploadPromise: Promise<{ sketchId: string; sourceId: string | null }> | null;
    abortController: AbortController | null;
    openPublishModal: (canvas: HTMLCanvasElement) => void;
    closePublishModal: () => void;
    resetUploadState: () => void;
}

export const usePublishModalStore = create<PublishModalState>((set, get) => ({
    isOpen: false,
    canvas: null,
    uploadPromise: null,
    abortController: null,
    openPublishModal: (canvas) => set({ isOpen: true, canvas }),
    closePublishModal: () => {
        const { abortController } = get();
        if (abortController) abortController.abort();
        set({ isOpen: false, canvas: null, uploadPromise: null, abortController: null });
    },
    resetUploadState: () => set({ uploadPromise: null, abortController: null }),
}));
