import { createClient } from '@sanity/client';

const client = createClient({
    projectId: process.env.VITE_SANITY_PROJECT_ID,
    dataset: 'production',
    apiVersion: '2023-05-03',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { imageBase64, title, userId, options } = req.body;

        if (!imageBase64 || !userId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // 1. Upload Image Asset
        const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return res.status(400).json({ message: 'Invalid image data format' });
        }

        const buffer = Buffer.from(matches[2], 'base64');
        const asset = await client.assets.upload('image', buffer, {
            filename: `sketch-${Date.now()}.png`
        });

        // 2. Create Document
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
            options: options,
            publishedAt: new Date().toISOString(), // 퍼블리시 날짜/시간
            likeCount: 0,
            downloadCount: 0,
            shareCount: 0,
            remixCount: 0,
            likedBy: []
        };

        const result = await client.create(doc);
        return res.status(200).json(result);

    } catch (error) {
        console.error("Publish Error:", error);
        return res.status(500).json({ message: 'Publish failed', error: error.message });
    }
}
