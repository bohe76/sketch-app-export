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
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { artworkId, userId, isLiked } = req.body;

        if (!artworkId || !userId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        console.log(`[API] Like Toggle Requested: artworkId=${artworkId}, userId=${userId}, targetState=${isLiked ? 'LIKE' : 'UNLIKE'}`);

        // 1. Fetch current state to ensure idempotency
        const currentData = await client.fetch(`*[_type == "artwork" && _id == $id][0]{likedBy, likeCount}`, { id: artworkId });

        if (!currentData) {
            return res.status(404).json({ message: 'Artwork not found' });
        }

        const likedBy = currentData.likedBy || [];
        const currentlyLiked = likedBy.includes(userId);

        // 2. If already in the target state, just return current data (Idempotency)
        if (currentlyLiked === isLiked) {
            console.log(`[API] Idempotent hit: userId=${userId} already has state=${isLiked}. No action taken.`);
            return res.status(200).json({
                success: true,
                likeCount: currentData.likeCount ?? 0,
                likedBy: likedBy
            });
        }

        // 3. Perform the patch
        const operation = isLiked
            ? client.patch(artworkId)
                .setIfMissing({ likedBy: [], likeCount: 0 })
                .append('likedBy', [userId])
                .inc({ likeCount: 1 })
            : client.patch(artworkId)
                .setIfMissing({ likedBy: [], likeCount: 0 })
                .unset([`likedBy[@ == "${userId}"]`])
                .inc({ likeCount: -1 });

        const result = await operation.commit();

        console.log(`[API] Like Successful. New likeCount: ${result.likeCount}`);
        return res.status(200).json({
            success: true,
            likeCount: result.likeCount ?? 0,
            likedBy: result.likedBy ?? []
        });

    } catch (error) {
        console.error("Like Error:", error);
        return res.status(500).json({ message: 'Like operation failed', error: error.message });
    }
}
