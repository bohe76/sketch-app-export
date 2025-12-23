import { useAuthStore } from '@/features/auth/model/store';
import { useSketchStore } from '@/features/sketch/model/store';

export const usePublish = () => {
    const { user } = useAuthStore();

    // Pass snapshots of data as arguments to ensure we don't depend on changing store state during async upload
    const publishArtwork = async (
        canvas: HTMLCanvasElement,
        title: string,
        currentSourceImage: string | null,
        currentOptions: any
    ) => {
        if (!user) throw new Error("Must be logged in to publish");

        // 1. Crop strategy (Same as handleDownload)
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

        // 2. Convert Sketch result (WebP for efficiency)
        const base64 = finalCanvas.toDataURL('image/webp', 0.8);
        if (base64.length < 1000) throw new Error("Canvas data is corrupted or empty");

        // 3. Prepare Source Image Snapshot
        let sourceImageBase64 = null;
        if (currentSourceImage) {
            try {
                const res = await fetch(currentSourceImage);
                if (!res.ok) throw new Error("Source photo could not be retrieved from memory");

                const blob = await res.blob();
                sourceImageBase64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onerror = reject;
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
                sourceImageBase64: sourceImageBase64,
                title,
                userId: user.uid,
                options: currentOptions
            })
        });

        if (!response.ok) {
            throw new Error(`Publish failed: ${response.statusText}`);
        }

        return await response.json();
    };

    return { publishArtwork };
};
