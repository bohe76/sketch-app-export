import { createClient } from '@sanity/client';

const getClient = () => createClient({
    projectId: process.env.VITE_SANITY_PROJECT_ID,
    dataset: process.env.VITE_SANITY_DATASET || 'production',
    apiVersion: '2023-05-03',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
});

export default async function handler(req, res) {
    const client = getClient();
    const requestId = Date.now();

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { imageBase64, filename } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ message: 'Missing image data' });
        }

        const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return res.status(400).json({ message: 'Invalid base64 format' });
        }

        const buffer = Buffer.from(matches[2], 'base64');
        const contentType = matches[1];

        const asset = await client.assets.upload('image', buffer, {
            contentType,
            filename: filename || `upload-${Date.now()}.webp`
        });

        return res.status(200).json({ assetId: asset._id, url: asset.url });

    } catch (error) {
        console.error(`[UploadAsset][${requestId}] Critical Error:`, error);
        return res.status(500).json({ message: 'Upload failed', error: error.message });
    }
}
