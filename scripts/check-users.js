import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const client = createClient({
    projectId: process.env.VITE_SANITY_PROJECT_ID,
    dataset: 'production',
    apiVersion: '2023-05-03',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
});

async function checkUsers() {
    try {
        console.log('--- Current Users in Sanity ---');
        const users = await client.fetch('*[_type == "user"]{_id, uid, nickname}');
        console.log(JSON.stringify(users, null, 2));

        console.log('\n--- Recent Artworks with Author Refs ---');
        const artworks = await client.fetch('*[_type == "artwork"] | order(_createdAt desc)[0...5]{_id, title, "authorRef": author._ref}');
        console.log(JSON.stringify(artworks, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

checkUsers();
