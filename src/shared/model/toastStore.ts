import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'info' | 'loading';

interface ToastState {
    message: string | null;
    type: ToastType;
    isVisible: boolean;
    showToast: (message: string, type?: ToastType) => void;
    hideToast: () => void;
}

let autoHideTimeout: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set) => ({
    message: null,
    type: 'info',
    isVisible: false,
    showToast: (message, type = 'info') => {
        // Clear previous timeout if any
        if (autoHideTimeout) clearTimeout(autoHideTimeout);

        set({ message, type, isVisible: true });

        // Auto-hide after 3 seconds ONLY if NOT loading
        if (type !== 'loading') {
            autoHideTimeout = setTimeout(() => {
                set({ isVisible: false });
            }, 3000);
        }
    },
    hideToast: () => {
        if (autoHideTimeout) clearTimeout(autoHideTimeout);
        set({ isVisible: false });
    },
}));
