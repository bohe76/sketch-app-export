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
        const { imageBase64, sourceAssetId, title, userId, options } = req.body;

        if (!imageBase64 || !userId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // 1. Upload Sketch Result Asset
        const decode = (b64) => {
            const matches = b64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            return matches && matches.length === 3 ? { buf: Buffer.from(matches[2], 'base64'), type: matches[1] } : null;
        };

        const sketchData = decode(imageBase64);
        if (!sketchData) {
            return res.status(400).json({ message: 'Invalid sketch image data format' });
        }

        const asset = await client.assets.upload('image', sketchData.buf, {
            contentType: sketchData.type,
            filename: `sketch-${Date.now()}.webp`
        });

        // 2. Document Creation (Source Asset is now passed as an ID)
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
                    _ref: asset._id
                }
            },
            // Link to the pre-uploaded source photo
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

        return res.status(200).json(result);

    } catch (error) {
        console.error("[Publish] Critical Error:", error);
        return res.status(500).json({ message: 'Publish failed', error: error.message });
    }
}
