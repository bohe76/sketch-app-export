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
        const { artworkId, type } = req.body; // type: 'download', 'share', 'remix'

        if (!artworkId || !type) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const fieldMap = {
            download: 'downloadCount',
            share: 'shareCount',
            remix: 'remixCount'
        };

        const field = fieldMap[type];
        if (!field) {
            return res.status(400).json({ message: 'Invalid metric type' });
        }

        console.log(`[API] Incrementing ${field} for ${artworkId}`);

        const result = await client.patch(artworkId)
            .setIfMissing({ [field]: 0 })
            .inc({ [field]: 1 })
            .commit();

        return res.status(200).json({ success: true, count: result[field] });

    } catch (error) {
        console.error("Increment Metrics Error:", error);
        return res.status(500).json({ message: 'Failed to increment metric', error: error.message });
    }
}
