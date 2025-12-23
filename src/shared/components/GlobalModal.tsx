import React from 'react';
import { useModalStore } from '@/shared/model/modalStore';

export const GlobalModal: React.FC = () => {
    const {
        isOpen,
        title,
        content,
        confirmText,
        cancelText,
        onConfirm,
        onCancel,
        closeModal
    } = useModalStore();

    if (!isOpen) return null;

    const handleConfirm = async () => {
        const result = await onConfirm();
        // If onConfirm returns false, keep modal open (for validation)
        if (result !== false) {
            closeModal();
        }
    };

    const handleCancel = () => {
        onCancel();
        closeModal();
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-scale-in">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                </div>

                {/* Body */}
                <div className="px-6 py-6 text-gray-600 text-sm leading-relaxed">
                    {content}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                    {cancelText && (
                        <button
                            onClick={handleCancel}
                            className="btn-modal-cancel"
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={handleConfirm}
                        className="btn-modal-primary"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
