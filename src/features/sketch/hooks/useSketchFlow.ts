// FIXING BUILD ERROR
import { useCallback } from 'react';
import { useSketchStore } from '@/features/sketch/model/store';
import { useAuthStore } from '@/features/auth/model/store';
import { useModalStore } from '@/shared/model/modalStore';
import { usePublishModalStore } from '@/shared/model/publishModalStore';
import { useLoginModalStore } from '@/features/auth/model/loginModalStore';
import { useToastStore } from '@/shared/model/toastStore';
import { useUIStore } from '@/shared/model/uiStore';
import type { Artwork } from '@/features/feed/api/feed';

export const useSketchFlow = () => {
    // Stores
    const { setSourceImage, resetOptions, setOptions } = useSketchStore();
    const { user } = useAuthStore();
    const { openModal } = useModalStore();
    const { openPublishModal } = usePublishModalStore();
    const { openLoginModal } = useLoginModalStore();
    const { showToast } = useToastStore();
    const { setViewMode } = useUIStore();

    /**
     * Handles file input change for image upload.
     * Sets the source image and switches to Studio mode.
     */
    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (4MB limit)
            const MAX_SIZE = 4 * 1024 * 1024;
            if (file.size > MAX_SIZE) {
                openModal({
                    title: "File Too Large",
                    content: "The selected image is over 4MB. Please upload a smaller image.",
                    confirmText: "Understood",
                    cancelText: "Close"
                });
                // Clear the input so the same file can be selected again if needed
                e.target.value = '';
                return;
            }

            const url = URL.createObjectURL(file);
            setSourceImage(url);
            setViewMode('studio');
        }
    }, [setSourceImage, setViewMode, openModal]);

    /**
     * Handles sketch options reset with a confirmation modal.
     */
    const handleReset = useCallback(() => {
        openModal({
            title: "Reset Options",
            content: "Are you sure you want to reset all sketching parameters to default values?",
            confirmText: "Reset Now",
            onConfirm: () => {
                resetOptions();
                showToast("Options reset to default", "info");
            }
        });
    }, [openModal, resetOptions, showToast]);

    /**
     * Handles downloading the sketched image.
     * Note: This function relies on DOM manipulation for canvas extraction.
     */
    const handleDownload = useCallback(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return;

        const { imgX, imgY, imgW, imgH } = canvas.dataset;
        let downloadUrl = canvas.toDataURL('image/png');

        if (imgX !== undefined && imgY !== undefined && imgW !== undefined && imgH !== undefined) {
            const x = parseFloat(imgX);
            const y = parseFloat(imgY);
            const w = parseFloat(imgW);
            const h = parseFloat(imgH);

            if (w > 0 && h > 0) {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = w;
                tempCanvas.height = h;
                const tempCtx = tempCanvas.getContext('2d');
                if (tempCtx) {
                    tempCtx.drawImage(canvas, x, y, w, h, 0, 0, w, h);
                    downloadUrl = tempCanvas.toDataURL('image/png');
                }
            }
        }

        const link = document.createElement('a');
        link.download = `sketch-${new Date().getTime()}.png`;
        link.href = downloadUrl;
        link.click();
        showToast("Downloaded to your device!", "success");
    }, [showToast]);

    /**
     * Handles opening the publish modal.
     * Requires user authentication.
     */
    const handlePublish = useCallback(() => {
        if (!user) {
            openLoginModal();
            return;
        }

        const canvas = document.querySelector('canvas');
        if (!canvas) {
            showToast("Canvas not found.", "error");
            return;
        }

        openPublishModal(canvas);
    }, [user, openLoginModal, openPublishModal, showToast]);

    /**
     * Handles loading a shared artwork into the studio for remixing.
     * CRITICAL: Uses the CLEAN source photo instead of the already-sketched result.
     */
    const handleRemix = useCallback((artwork: Artwork) => {
        // Fallback to imageUrl if sourceImageUrl is missing (for legacy or edge cases)
        setSourceImage(artwork.sourceImageUrl || artwork.imageUrl);
        // Apply only the original options to ensure it looks exactly the same
        setOptions(artwork.options);
        setViewMode('studio');
    }, [setSourceImage, setOptions, setViewMode]);

    return {
        handleImageUpload,
        handleReset,
        handleDownload,
        handlePublish,
        handleRemix
    };
};
