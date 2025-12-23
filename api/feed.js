import { createClient } from '@sanity/client';

const client = createClient({
    projectId: process.env.VITE_SANITY_PROJECT_ID,
    dataset: process.env.VITE_SANITY_DATASET || 'production',
    apiVersion: '2023-05-03',
    // Token is NOT needed for reading public datasets, 
    // but using it ensures we don't hit rate limits as easily 
    // and keeps config consistent.
    // token: process.env.SANITY_API_TOKEN, 
    useCdn: false, // Ensure fresh data
});

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    console.log("[API] /api/feed called");

    try {
        const { authorId, sort = 'latest', userId, id } = req.query;

        console.log(`[API] /api/feed called. id: ${id || 'none'}, authorId: ${authorId || 'none'}, sort: ${sort}, userId: ${userId || 'none'}`);

        // Use params for safe GROQ filtering
        const params = {
            authorId: authorId || null,
            userId: userId || null,
            id: id || null
        };

        let query;

        if (id) {
            // Fetch single artwork mode
            query = `*[_type == "artwork" && _id == $id][0] {
                _id,
                title,
                "imageUrl": image.asset->url,
                "thumbnailUrl": image.asset->url + "?w=500&auto=format",
                "sourceImageUrl": sourceImage.asset->url,
                "authorName": author->nickname,
                "authorId": author._ref,
                "authorAvatar": author->avatar.asset->url,
                "likeCount": coalesce(likeCount, 0),
                "downloadCount": coalesce(downloadCount, 0),
                "shareCount": coalesce(shareCount, 0),
                "remixCount": coalesce(remixCount, 0),
                "isLiked": count(coalesce(likedBy, [])[@ == $userId]) > 0,
                options,
                _createdAt
            }`;
        } else {
            // Feed mode
            const filter = authorId
                ? `_type == "artwork" && author._ref == $authorId`
                : `_type == "artwork"`;

            const order = sort === 'trending'
                ? `order(coalesce(likeCount, 0) desc, _createdAt desc)`
                : `order(_createdAt desc)`;

            query = `*[${filter}] | ${order} [0...50] {
                _id,
                title,
                "imageUrl": image.asset->url,
                "thumbnailUrl": image.asset->url + "?w=500&auto=format",
                "sourceImageUrl": sourceImage.asset->url,
                "authorName": author->nickname,
                "authorId": author._ref,
                "authorAvatar": author->avatar.asset->url,
                "likeCount": coalesce(likeCount, 0),
                "downloadCount": coalesce(downloadCount, 0),
                "shareCount": coalesce(shareCount, 0),
                "remixCount": coalesce(remixCount, 0),
                "isLiked": count(coalesce(likedBy, [])[@ == $userId]) > 0,
                options,
                _createdAt
            }`;
        }

        console.log(`[API] Fetching ${id ? 'Single' : (authorId ? 'Filtered' : 'Global')} Feed from Sanity...`);
        const result = await client.fetch(query, params);

        return res.status(200).json(result);

    } catch (error) {
        console.error("Feed Fetch Error:", error);
        return res.status(500).json({ message: 'Failed to fetch feed', error: error.message });
    }
}
