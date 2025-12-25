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
        _id,
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
    const description = `"${artwork.title}" - Discover this amazing hand-drawn art by @${artwork.authorName} on Sketchrang!`;
    const imageUrl = artwork.imageUrl;
    const siteUrl = process.env.VITE_SITE_URL || 'https://sketchrang.vercel.app';
    const artworkId = artwork._id || '';
    const artworkUrl = `${siteUrl}/?artwork=${artworkId}`;

    // Clean up existing dynamic-able tags to prevent duplicates or matching issues
    let cleanHtml = html
        .replace(/<title>[\s\S]*?<\/title>/gi, '')
        .replace(/<meta\s+(name|property)=["'](title|description|og:title|og:description|og:image|og:url|twitter:title|twitter:description|twitter:image|twitter:url)["'][\s\S]*?\/>/gi, '');

    const newTags = `
    <title>${title}</title>
    <meta name="title" content="${title}" />
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:url" content="${artworkUrl}" />
    <meta property="twitter:title" content="${title}" />
    <meta property="twitter:description" content="${description}" />
    <meta property="twitter:image" content="${imageUrl}" />
    <meta property="twitter:url" content="${artworkUrl}" />
    <meta property="twitter:card" content="summary_large_image" />
    `;

    // Inject before the closing </head> tag
    return cleanHtml.replace('</head>', `${newTags}\n</head>`);
}
