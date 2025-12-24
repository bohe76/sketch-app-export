import { createClient } from '@sanity/client';

const client = createClient({
    projectId: process.env.VITE_SANITY_PROJECT_ID,
    dataset: process.env.VITE_SANITY_DATASET || 'production',
    apiVersion: '2023-05-03',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const reqId = Date.now();
    try {
        const { sketchAssetId, sourceAssetId, title, userId, options } = req.body;

        if (!sketchAssetId || !userId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        console.log(`[Publish-v2][${reqId}] Creating Sanity document for user: ${userId}`);
        console.time(`[Publish-v2][${reqId}] Doc Creation Time`);

        const doc = {
            _type: 'artwork',
            title: title || 'Untitled Sketch',
            author: {
                _type: 'reference',
                _ref: userId
            },
            image: {
                _type: 'image',
                asset: {
                    _type: 'reference',
                    _ref: sketchAssetId
                }
            },
            sourceImage: sourceAssetId ? {
                _type: 'image',
                asset: {
                    _type: 'reference',
                    _ref: sourceAssetId
                }
            } : undefined,
            options: options,
            publishedAt: new Date().toISOString(),
            likeCount: 0,
            downloadCount: 0,
            shareCount: 0,
            remixCount: 0,
            likedBy: []
        };

        const result = await client.create(doc);
        console.timeEnd(`[Publish-v2][${reqId}] Doc Creation Time`);

        console.log(`[Publish-v2][${reqId}] Successfully created artwork: ${result._id}`);
        return res.status(200).json(result);

    } catch (error) {
        console.error(`[Publish-v2][${reqId}] Critical Error:`, error);
        return res.status(500).json({ message: 'Publish failed', error: error.message });
    }
}
