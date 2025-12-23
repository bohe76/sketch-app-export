import { useAuthStore } from '@/features/auth/model/store';
import { useSketchStore } from '@/features/sketch/model/store';

export const usePublish = () => {
    const { user } = useAuthStore();
    const { options, sourceImage } = useSketchStore();

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

        // 2. Convert Sketch result to WebP
        const base64 = finalCanvas.toDataURL('image/webp', 0.8);

        // 3. Prepare Source Image (Original Photo)
        let sourceImageBase64 = null;
        if (sourceImage) {
            try {
                const res = await fetch(sourceImage);
                const blob = await res.blob();
                sourceImageBase64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                });
            } catch (e) {
                console.error("Failed to convert source image for publish:", e);
            }
        }

        // 4. Call Serverless Function with both images
        const response = await fetch('/api/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imageBase64: base64,
                sourceImageBase64,
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
