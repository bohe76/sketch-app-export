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

    try {
        const { artworkId, userId } = req.body;

        if (!artworkId || !userId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        console.log(`[API] Delete requested for artwork: ${artworkId} by user: ${userId}`);

        // 1. Fetch document to verify ownership and get asset ID (Using fetch for more reliability)
        const query = `*[_id == $id][0]{ "assetId": image.asset._ref, "authorId": author._ref }`;
        const doc = await client.fetch(query, { id: artworkId });

        if (!doc) {
            return res.status(404).json({ message: 'Artwork not found' });
        }

        if (doc.authorId !== userId) {
            return res.status(403).json({ message: 'You are not authorized to delete this artwork' });
        }

        const assetId = doc.assetId;
        console.log(`[API] Atomic Delete: Artwork(${artworkId}), Asset(${assetId || 'none'})`);

        // 2. Atomic Transaction: Delete both or none
        const transaction = client.transaction();
        transaction.delete(artworkId);
        if (assetId) {
            transaction.delete(assetId);
        }

        await transaction.commit();
        console.log(`[API] Atomic transaction committed successfully.`);

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error("Delete Error:", error);
        return res.status(500).json({ message: 'Delete operation failed', error: error.message });
    }
}
