import { createClient } from '@sanity/client';

let client = null;

function getClient() {
    if (!client) {
        const projectId = process.env.VITE_SANITY_PROJECT_ID;
        const dataset = process.env.VITE_SANITY_DATASET || 'production';

        client = createClient({
            projectId: projectId,
            dataset: dataset,
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

    // Create the new metadata block with professional labels
    const newTags = `
  <!-- SEO Metadata Start -->
  <title>${title}</title>
  <meta name="title" content="${title}" />
  <meta name="description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:url" content="${artworkUrl}" />
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:title" content="${title}" />
  <meta property="twitter:description" content="${description}" />
  <meta property="twitter:image" content="${imageUrl}" />
  <meta property="twitter:url" content="${artworkUrl}" />
  <!-- SEO Metadata End -->`;

    // 1. Remove existing competing tags and their comments aggressively
    let processedHtml = html.replace(/<title>[\s\S]*?<\/title>/gi, '');

    const tagsToRemove = [
        'title', 'description',
        'og:title', 'og:description', 'og:image', 'og:url', 'og:type',
        'twitter:title', 'twitter:description', 'twitter:image', 'twitter:url', 'twitter:card'
    ];

    tagsToRemove.forEach(tag => {
        const regex = new RegExp(`<meta\\s+[^>]*?([name|property]=["']${tag}["'])[^>]*?>`, 'gi');
        processedHtml = processedHtml.replace(regex, '');
    });

    // Clean up empty lines and redundant whitespace left after tag removal
    processedHtml = processedHtml.replace(/^\s*[\r\n]/gm, '');

    // 2. Inject right after <head>
    if (processedHtml.includes('<head>')) {
        return processedHtml.replace('<head>', `<head>${newTags}`);
    } else {
        return processedHtml.replace('</head>', `${newTags}\n</head>`);
    }
}
