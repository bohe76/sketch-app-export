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
        const { artworkId, userId, isLiked } = req.body;

        if (!artworkId || !userId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        console.log(`[API] Like Toggle: artworkId=${artworkId}, userId=${userId}, action=${isLiked ? 'LIKE' : 'UNLIKE'}`);

        // We use likedBy array to keep track of WHO liked it
        // and likeCount for easy sorting/display
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
