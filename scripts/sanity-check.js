import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const client = createClient({
    projectId: process.env.VITE_SANITY_PROJECT_ID,
    dataset: process.env.VITE_SANITY_DATASET || 'production',
    apiVersion: '2023-05-03',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
});

async function checkAssets() {
    try {
        console.log(`Checking Sanity assets for dataset: [${process.env.VITE_SANITY_DATASET || 'production'}]`);

        // 1. Check for documents
        const artworks = await client.fetch('*[_type == "artwork"] | order(_createdAt desc) [0...5] { _id, title, _createdAt }');
        console.log("Recent Artworks:", artworks);

        // 2. Check for recent image assets
        const assets = await client.fetch('*[_type == "sanity.imageAsset"] | order(_createdAt desc) [0...5] { _id, url, _createdAt }');
        console.log("Recent Image Assets:", assets);

        if (assets.length === 0 && artworks.length === 0) {
            console.log("No data found in this dataset.");
        }
    } catch (e) {
        console.error("Sanity Check Failed:", e.message);
    }
}

checkAssets();
