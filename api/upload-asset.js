import { createClient } from '@sanity/client';

const client = createClient({
    projectId: process.env.VITE_SANITY_PROJECT_ID,
    dataset: process.env.VITE_SANITY_DATASET || 'production',
    apiVersion: '2023-05-03',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
});

export default async function handler(req, res) {
    const requestId = Date.now();
    console.log(`[UploadAsset][${requestId}] Request received`);

    if (req.method !== 'POST') {
        console.warn(`[UploadAsset][${requestId}] Method not allowed: ${req.method}`);
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { imageBase64, filename } = req.body;

        if (!imageBase64) {
            console.error(`[UploadAsset][${requestId}] Missing imageBase64`);
            return res.status(400).json({ message: 'Missing image data' });
        }

        console.log(`[UploadAsset][${requestId}] Decoding base64...`);
        const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            console.error(`[UploadAsset][${requestId}] Invalid base64 format`);
            return res.status(400).json({ message: 'Invalid base64 format' });
        }

        const buffer = Buffer.from(matches[2], 'base64');
        const contentType = matches[1];

        console.log(`[UploadAsset][${requestId}] Starting Sanity upload: ${filename || 'image'} (${buffer.length} bytes)`);

        const asset = await client.assets.upload('image', buffer, {
            contentType,
            filename: filename || `upload-${Date.now()}.webp`
        });

        console.log(`[UploadAsset][${requestId}] Successfully uploaded asset: ${asset._id}`);
        return res.status(200).json({ assetId: asset._id, url: asset.url });

    } catch (error) {
        console.error(`[UploadAsset][${requestId}] Critical Error:`, error);
        return res.status(500).json({ message: 'Upload failed', error: error.message });
    }
}
