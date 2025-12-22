import React, { useState, useRef, useEffect } from 'react';
import { usePublishModalStore } from '@/shared/model/publishModalStore';
import { usePublish } from '@/features/studio/api/publish';
import { useSketchStore } from '@/features/sketch/model/store';
import { useToastStore } from '@/shared/model/toastStore';
import { useUIStore } from '@/shared/model/uiStore';

export const PublishModal: React.FC = () => {
    const { isOpen, canvas, closePublishModal } = usePublishModalStore();
    const { publishArtwork } = usePublish();
    const { setSourceImage } = useSketchStore();
    const { showToast, hideToast } = useToastStore();
    const { setActiveTab, setViewMode } = useUIStore();

    const [title, setTitle] = useState('');
    const [error, setError] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Reset state and focus when modal opens
    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setError(false);
            // Small delay to ensure modal animation is triggered before focus
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    if (!isOpen || !canvas) return null;

    const handleConfirm = async () => {
        if (!title.trim()) {
            setError(true);
            inputRef.current?.focus();
            return;
        }

        try {
            setIsPublishing(true);
            showToast("Publishing...", "loading");

            await publishArtwork(canvas, title.trim());

            // Post-publish actions
            setSourceImage(null);
            setActiveTab('mine');
            setViewMode('feed');

            hideToast();
            closePublishModal();
        } catch (err) {
            console.error("🔥 Publish failed:", err);
            hideToast();
            showToast("Failed to publish.", "error");
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-scale-in">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Publish Artwork</h3>
                </div>

                {/* Body */}
                <div className="px-6 py-6 text-gray-600 text-sm leading-relaxed">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                ref={inputRef}
                                type="text"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    if (error) setError(false);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !isPublishing) handleConfirm();
                                }}
                                className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${error
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-zinc-600'
                                    }`}
                                placeholder="Enter artwork title..."
                                maxLength={50}
                                disabled={isPublishing}
                            />
                            <div className="h-5 mt-1">
                                {error && (
                                    <p className="text-sm text-red-500">Title is required</p>
                                )}
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">
                            Are you sure you want to publish your masterpiece to the public gallery?
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={closePublishModal}
                        className="btn-modal-cancel"
                        disabled={isPublishing}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="btn-modal-primary"
                        disabled={isPublishing}
                    >
                        {isPublishing ? "Publishing..." : "Publish Now"}
                    </button>
                </div>
            </div>
        </div>
    );
};
