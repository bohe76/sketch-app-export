import { useAuthStore } from '@/features/auth/model/store';

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
        console.log("[Publish] Creating sketch base64...");
        const base64 = finalCanvas.toDataURL('image/webp', 0.8);
        console.log("[Publish] Sketch base64 size:", base64.length);
        if (base64.length < 1000) throw new Error("Canvas data is corrupted or empty");

        // 3. Step 1: Upload Source Image (if exists) sequentially to secure its own 4.5MB payload limit
        let sourceAssetId = null;
        if (currentSourceImage) {
            console.log("[Publish] Fetching source image blob...");
            try {
                const res = await fetch(currentSourceImage);
                if (!res.ok) throw new Error("Source photo could not be retrieved from memory");

                const blob = await res.blob();
                console.log("[Publish] Source blob size:", blob.size);

                const sourceBase64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onerror = reject;
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                });
                console.log("[Publish] Source base64 ready. Uploading to /api/upload-asset...");

                const uploadRes = await fetch('/api/upload-asset', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        imageBase64: sourceBase64,
                        filename: `source-${Date.now()}.webp`
                    })
                });

                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    sourceAssetId = uploadData.assetId;
                    console.log("[Publish] Source asset uploaded successfully:", sourceAssetId);
                } else {
                    console.error("[Publish] Source asset upload failed with status:", uploadRes.status);
                }
            } catch (e) {
                console.error("Failed to upload source image asset:", e);
                // We continue even if source fails, just without the source photo link
            }
        }

        // 4. Step 2: Final Publish with Sketch and Source ID
        console.log("[Publish] Sending final publish request to /api/publish...");
        const response = await fetch('/api/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imageBase64: base64,
                sourceAssetId: sourceAssetId,
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
