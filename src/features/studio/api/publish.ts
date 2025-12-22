import { useAuthStore } from '@/features/auth/model/store';
import { useSketchStore } from '@/features/sketch/model/store';

export const usePublish = () => {
    const { user } = useAuthStore();
    const { options } = useSketchStore();

    const publishArtwork = async (canvas: HTMLCanvasElement, title: string) => {
        if (!user) throw new Error("Must be logged in to publish");

        // 1. Crop strategy (Same as handleDownload)
        // Extract drawing bounds from data attributes set by SketchEngine
        const { imgX, imgY, imgW, imgH } = canvas.dataset;
        let finalCanvas: HTMLCanvasElement = canvas;

        if (imgX !== undefined && imgY !== undefined && imgW !== undefined && imgH !== undefined) {
            const tempCanvas = document.createElement('canvas');
            const dx = parseFloat(imgX);
            const dy = parseFloat(imgY);
            const dw = parseFloat(imgW);
            const dh = parseFloat(imgH);

            if (dw > 0 && dh > 0) {
                tempCanvas.width = dw;
                tempCanvas.height = dh;
                const tempCtx = tempCanvas.getContext('2d');
                if (tempCtx) {
                    tempCtx.drawImage(canvas, dx, dy, dw, dh, 0, 0, dw, dh);
                    finalCanvas = tempCanvas;
                }
            }
        }

        // 2. Convert to WebP (Supported by modern browsers, much smaller than PNG)
        // Use 0.8 quality for good balance between size and quality
        const base64 = finalCanvas.toDataURL('image/webp', 0.8);

        // 3. Call Serverless Function
        const response = await fetch('/api/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imageBase64: base64,
                title,
                userId: user.uid,
                options
            })
        });

        if (!response.ok) {
            throw new Error(`Publish failed: ${response.statusText}`);
        }

        return await response.json();
    };

    return { publishArtwork };
};
