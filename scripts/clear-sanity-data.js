import 'dotenv/config';
import { createClient } from '@sanity/client';

const projectId = process.env.VITE_SANITY_PROJECT_ID;
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
    console.error('❌ Missing VITE_SANITY_PROJECT_ID or SANITY_API_TOKEN in .env');
    process.exit(1);
}

async function clearDataset(dataset) {
    console.log(`\n🧹 Starting cleanup for dataset: [${dataset}]...`);

    const client = createClient({
        projectId,
        dataset,
        apiVersion: '2023-05-03',
        token,
        useCdn: false,
    });

    try {
        const types = ["artwork", "user", "sanity.imageAsset"];

        for (const type of types) {
            const query = `*[_type == "${type}"]`;
            const docs = await client.fetch(query);

            if (docs.length === 0) {
                console.log(`   - No [${type}] documents found.`);
                continue;
            }

            console.log(`📦 Deleting ${docs.length} documents of type: [${type}]...`);

            const CHUNK_SIZE = 50;
            for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
                const chunk = docs.slice(i, i + CHUNK_SIZE);
                const transaction = client.transaction();
                chunk.forEach(doc => transaction.delete(doc._id));
                await transaction.commit();
                console.log(`     - Deleted chunk ${i / CHUNK_SIZE + 1} of [${type}]`);
            }
        }

        console.log(`✨ Cleanup finished for [${dataset}]!`);
    } catch (error) {
        console.error(`❌ Error cleaning [${dataset}]:`, error.message);
    }
}

async function main() {
    // 1. Clear Development
    await clearDataset('development');

    // 2. Clear Production
    await clearDataset('production');

    console.log('\n🏁 Global Cleanup Complete.');
}

main();
