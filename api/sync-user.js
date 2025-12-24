import { createClient } from '@sanity/client';

export const config = {
    runtime: 'edge', // or 'nodejs'
};

const getClient = () => createClient({
    projectId: process.env.VITE_SANITY_PROJECT_ID,
    dataset: process.env.VITE_SANITY_DATASET || 'production',
    apiVersion: '2023-05-03',
    token: process.env.SANITY_API_TOKEN, // Server-side token
    useCdn: false,
});

export default async function handler(req, res) {
    const client = getClient();
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { user } = req.body;

        if (!user || !user.uid) {
            return res.status(400).json({ message: 'Missing user data' });
        }

        const doc = {
            _id: user.uid,
            _type: 'user',
            uid: user.uid,
            nickname: user.displayName || 'Anonymous',
            avatar: user.photoURL ? {
                _type: 'image',
                asset: {
                    // For MVP, we skip uploading avatar image to Sanity asset
                    // and just ignore it or store URL as string if schema allows.
                    // But our schema expects image type.
                    // Ideally we should upload, but for now let's just create the user doc.
                }
            } : undefined
        };

        // Remove undefined fields
        if (!doc.avatar) delete doc.avatar;

        await client.createIfNotExists(doc);
        await client.patch(user.uid).set({ nickname: user.displayName }).commit();

        return res.status(200).json({ message: 'User synced' });
    } catch (error) {
        console.error("Sanity Sync Error:", error);
        return res.status(500).json({ message: 'Sync failed', error: error.message });
    }
}
