import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars from root .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const client = createClient({
    projectId: process.env.VITE_SANITY_PROJECT_ID,
    dataset: process.env.VITE_SANITY_DATASET || 'production',
    apiVersion: '2023-05-03',
    token: process.env.SANITY_API_TOKEN, // Requires Write Token
    useCdn: false,
});

async function clearAll() {
    try {
        const dataset = process.env.VITE_SANITY_DATASET || 'production';
        console.log(`🧹 Starting cleanup for dataset: [${dataset}]`);

        // 1. Fetch all artworks
        console.log('Fetching artworks...');
        const artworks = await client.fetch('*[_type == "artwork"]{_id}');

        // 2. Fetch all unused assets (images)
        // Note: This only finds assets that are not referenced by any document
        console.log('Fetching all image assets...');
        const assets = await client.fetch('*[_type == "sanity.imageAsset"]{_id}');

        console.log(`Found ${artworks.length} artworks and ${assets.length} image assets.`);

        // Delete Artworks
        if (artworks.length > 0) {
            console.log('Deleting artworks...');
            const transaction = client.transaction();
            artworks.forEach(art => transaction.delete(art._id));
            await transaction.commit();
        }

        // Delete Assets
        if (assets.length > 0) {
            console.log('Deleting image assets...');
            // Assets need to be deleted one by one or in small batches
            for (const asset of assets) {
                try {
                    await client.delete(asset._id);
                    process.stdout.write('.');
                } catch (e) {
                    // Ignore errors for assets still in use
                }
            }
            console.log('\nAsset cleanup complete.');
        }

        console.log(`\n✅ Cleanup for [${dataset}] finished.`);

    } catch (error) {
        console.error('❌ Cleanup failed:', error);
    }
}

clearAll();
