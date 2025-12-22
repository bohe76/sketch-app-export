import { create } from 'zustand';
import { DEFAULT_OPTIONS } from '@/features/sketch/engine/types';
import type { SketchOptions } from '@/features/sketch/engine/types';

interface SketchStore {
    // Image State
    sourceImage: string | null;
    setSourceImage: (url: string | null) => void;

    // Options State
    options: SketchOptions;
    setOptions: (newOptions: Partial<SketchOptions>) => void;
    resetOptions: () => void;

    // UI State
    isDrawing: boolean;
    setIsDrawing: (isDrawing: boolean) => void;
}

export const useSketchStore = create<SketchStore>((set) => ({
    sourceImage: null,
    setSourceImage: (url) => set({ sourceImage: url }),

    options: DEFAULT_OPTIONS,
    setOptions: (newOptions) =>
        set((state) => ({ options: { ...state.options, ...newOptions } })),

    resetOptions: () => set({ options: DEFAULT_OPTIONS }),

    isDrawing: false,
    setIsDrawing: (isDrawing) => set({ isDrawing }),
}));
