import { create } from 'zustand';

interface ModalState {
    isOpen: boolean;
    title: string;
    content: React.ReactNode;
    onConfirm: () => void | false | Promise<void | false>; // Can return false to prevent modal close
    onCancel: () => void;
    confirmText: string;
    cancelText: string;

    openModal: (params: {
        title: string;
        content: React.ReactNode;
        onConfirm?: () => void | false | Promise<void | false>;
        onCancel?: () => void;
        confirmText?: string;
        cancelText?: string;
    }) => void;
    closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
    isOpen: false,
    title: '',
    content: null,
    onConfirm: () => { },
    onCancel: () => { },
    confirmText: 'Confirm',
    cancelText: 'Cancel',

    openModal: ({
        title,
        content,
        onConfirm = () => { },
        onCancel = () => { },
        confirmText = 'Confirm',
        cancelText = 'Cancel'
    }) => set({
        isOpen: true,
        title,
        content,
        onConfirm,
        onCancel,
        confirmText,
        cancelText
    }),

    closeModal: () => set({ isOpen: false })
}));
