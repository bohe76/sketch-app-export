import { createClient } from '@sanity/client';

let client = null;

function getClient() {
    if (!client) {
        if (!process.env.VITE_SANITY_PROJECT_ID) {
            console.error('[SEO] Missing VITE_SANITY_PROJECT_ID in process.env');
        }
        client = createClient({
            projectId: process.env.VITE_SANITY_PROJECT_ID,
            dataset: process.env.VITE_SANITY_DATASET || 'production',
            apiVersion: '2023-05-03',
            useCdn: true,
        });
    }
    return client;
}

/**
 * Fetches artwork details from Sanity by ID.
 */
export async function fetchArtworkForSEO(id) {
    const query = `*[_type == "artwork" && _id == $id][0] {
        title,
        "imageUrl": image.asset->url,
        "authorName": author->nickname
    }`;
    try {
        const sanityClient = getClient();
        return await sanityClient.fetch(query, { id });
    } catch (error) {
        console.error('[SEO] Failed to fetch artwork:', error);
        return null;
    }
}

/**
 * Injects dynamic meta tags into the HTML template.
 */
export function injectMetadata(html, artwork) {
    if (!artwork) return html;

    const title = `${artwork.title} | Sketchrang`;
    const description = `"${artwork.title}" - Explore this stunning hand-drawn masterpiece by @${artwork.authorName} on Sketchrang.`;
    const imageUrl = artwork.imageUrl;
    // Note: Canonical site URL should ideally come from env, defaulting to production if not set
    const siteUrl = process.env.VITE_SITE_URL || 'https://sketchrang.vercel.app';
    const artworkUrl = `${siteUrl}/?artwork=${artwork._id || ''}`;

    return html
        .replace(/<title>[\s\S]*?<\/title>/g, `<title>${title}</title>`)
        .replace(/<meta name="title" content="[\s\S]*?" \/>/g, `<meta name="title" content="${title}" />`)
        .replace(/<meta name="description" content="[\s\S]*?" \/>/g, `<meta name="description" content="${description}" />`)
        .replace(/<meta property="og:title" content="[\s\S]*?" \/>/g, `<meta property="og:title" content="${title}" />`)
        .replace(/<meta property="og:description" content="[\s\S]*?" \/>/g, `<meta property="og:description" content="${description}" />`)
        .replace(/<meta property="og:image" content="[\s\S]*?" \/>/g, `<meta property="og:image" content="${imageUrl}" />`)
        .replace(/<meta property="og:url" content="[\s\S]*?" \/>/g, `<meta property="og:url" content="${artworkUrl}" />`)
        .replace(/<meta property="twitter:title" content="[\s\S]*?" \/>/g, `<meta property="twitter:title" content="${title}" />`)
        .replace(/<meta property="twitter:description" content="[\s\S]*?" \/>/g, `<meta property="twitter:description" content="${description}" />`)
        .replace(/<meta property="twitter:image" content="[\s\S]*?" \/>/g, `<meta property="twitter:image" content="${imageUrl}" />`)
        .replace(/<meta property="twitter:url" content="[\s\S]*?" \/>/g, `<meta property="twitter:url" content="${artworkUrl}" />`);
}
