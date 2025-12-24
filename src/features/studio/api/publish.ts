import { useAuthStore } from '@/features/auth/model/store';

export const usePublish = () => {
    const { user } = useAuthStore();

    /**
     * 1. Pre-upload both source and sketch assets in parallel
     */
    const prepareAssets = async (
        canvas: HTMLCanvasElement,
        sourceImage: string | null,
        signal: AbortSignal
    ) => {
        if (!user) throw new Error("Must be logged in");

        // Prepare Sketch Asset
        const prepareSketch = async (): Promise<string> => {
            const { imgX, imgY, imgW, imgH } = canvas.dataset;
            let finalCanvas: HTMLCanvasElement = canvas;

            if (imgX !== undefined && imgY !== undefined && imgW !== undefined && imgH !== undefined) {
                const tempCanvas = document.createElement('canvas');
                const [dx, dy, dw, dh] = [parseFloat(imgX), parseFloat(imgY), parseFloat(imgW), parseFloat(imgH)];
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

            const base64 = finalCanvas.toDataURL('image/webp', 0.8);
            const res = await fetch('/api/upload-asset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: base64, filename: `sketch-${Date.now()}.webp` }),
                signal
            });
            if (!res.ok) throw new Error("Sketch upload failed");
            const data = await res.json();
            return data.assetId;
        };

        // Prepare Source Asset
        const prepareSource = async (): Promise<string | null> => {
            if (!sourceImage) return null;
            const res = await fetch(sourceImage, { signal });
            const blob = await res.blob();

            const sourceBase64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onerror = reject;
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });

            const uploadRes = await fetch('/api/upload-asset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: sourceBase64, filename: `source-${Date.now()}.webp` }),
                signal
            });
            if (!uploadRes.ok) return null;
            const data = await uploadRes.json();
            return data.assetId;
        };

        // Run in parallel
        const [sketchId, sourceId] = await Promise.all([prepareSketch(), prepareSource()]);
        return { sketchId, sourceId };
    };

    /**
     * 2. Final publish using pre-uploaded asset IDs
     */
    const finalizePublish = async (
        sketchId: string,
        sourceId: string | null,
        title: string,
        options: Record<string, unknown>
    ) => {
        if (!user) throw new Error("Must be logged in");

        const response = await fetch('/api/publish-v2', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sketchAssetId: sketchId,
                sourceAssetId: sourceId,
                title,
                userId: user.uid,
                options
            })
        });

        if (!response.ok) throw new Error(`Publish failed: ${response.statusText}`);
        return await response.json();
    };

    // Keep legacy publishArtwork for compatibility or one-shot usage if needed
    const publishArtwork = async (
        canvas: HTMLCanvasElement,
        title: string,
        sourceImage: string | null,
        options: Record<string, unknown>
    ) => {
        const controller = new AbortController();
        const { sketchId, sourceId } = await prepareAssets(canvas, sourceImage, controller.signal);
        return await finalizePublish(sketchId, sourceId, title, options);
    };

    return { prepareAssets, finalizePublish, publishArtwork };
};
