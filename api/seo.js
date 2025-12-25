import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { fetchArtworkForSEO, injectMetadata } from './utils/seo_helper.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function handler(req, res) {
    const { artwork: artworkId } = req.query;

    try {
        // 1. Read the base index.html template
        // Note: In Vercel, the root index.html is usually at the project root
        const templatePath = join(__dirname, '../index.html');
        let html = fs.readFileSync(templatePath, 'utf-8');

        // 2. If no artworkId, just serve the plain index.html
        if (!artworkId) {
            return res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
        }

        console.log(`[SEO] Dynamic metadata request for artwork: ${artworkId}`);

        // 3. Fetch artwork data
        const artwork = await fetchArtworkForSEO(artworkId);

        if (artwork) {
            // 4. Inject metadata using our helper
            html = injectMetadata(html, artwork);
            console.log(`[SEO] Injected metadata for: ${artwork.title}`);
        } else {
            console.log(`[SEO] Artwork not found for ID: ${artworkId}. Serving default.`);
        }

        // 5. Serve the modified HTML
        return res.status(200).set({ 'Content-Type': 'text/html' }).end(html);

    } catch (error) {
        console.error('[SEO Handler Error]:', error);
        // Fallback: serve the plain index.html if anything goes wrong
        try {
            const templatePath = join(__dirname, '../index.html');
            const html = fs.readFileSync(templatePath, 'utf-8');
            return res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
        } catch (e) {
            return res.status(500).send('Internal Server Error');
        }
    }
}
