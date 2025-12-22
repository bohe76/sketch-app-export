import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
    projectId: process.env.VITE_SANITY_PROJECT_ID,
    dataset: 'production',
    apiVersion: '2023-05-03',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
});

async function migratePublishedAt() {
    try {
        console.log('🔍 Fetching artworks without publishedAt...');

        // publishedAt이 없는 모든 작품 조회
        const artworks = await client.fetch(`*[_type == "artwork" && !defined(publishedAt)]`);

        console.log(`📦 Found ${artworks.length} artworks to update`);

        if (artworks.length === 0) {
            console.log('✅ All artworks already have publishedAt field');
            return;
        }

        // 오늘 날짜 기준으로 적당한 시간 간격으로 설정
        const baseDate = new Date('2025-12-21T10:00:00.000Z'); // 오늘 오전 10시 (UTC)

        for (let i = 0; i < artworks.length; i++) {
            const artwork = artworks[i];

            // 각 작품마다 2시간씩 간격 (10:00, 12:00, 14:00...)
            const publishedAt = new Date(baseDate.getTime() + (i * 2 * 60 * 60 * 1000));

            console.log(`📝 Updating ${artwork._id}: ${artwork.title || 'Untitled'}`);
            console.log(`   publishedAt: ${publishedAt.toISOString()}`);

            await client
                .patch(artwork._id)
                .set({ publishedAt: publishedAt.toISOString() })
                .commit();

            console.log(`✅ Updated ${i + 1}/${artworks.length}`);
        }

        console.log('🎉 Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

// 실행
migratePublishedAt()
    .then(() => {
        console.log('✨ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error:', error);
        process.exit(1);
    });
