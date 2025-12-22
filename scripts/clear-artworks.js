import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars from root .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const client = createClient({
    projectId: process.env.VITE_SANITY_PROJECT_ID,
    dataset: 'production',
    apiVersion: '2023-05-03',
    token: process.env.SANITY_API_TOKEN, // Requires Write Token
    useCdn: false,
});

async function clearArtworks() {
    try {
        console.log('Fetching artworks to delete...');
        const artworks = await client.fetch('*[_type == "artwork"]{_id}');

        if (artworks.length === 0) {
            console.log('No artworks found.');
            return;
        }

        console.log(`Found ${artworks.length} artworks. Deleting...`);

        // Transaction for safety
        const transaction = client.transaction();
        artworks.forEach(art => {
            transaction.delete(art._id);
        });

        await transaction.commit();
        console.log('✅ All artworks deleted successfully.');

    } catch (error) {
        console.error('❌ Failed to clear artworks:', error);
    }
}

clearArtworks();
