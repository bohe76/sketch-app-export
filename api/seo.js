import { join } from 'path';
import fs from 'fs';
import { fetchArtworkForSEO, injectMetadata } from './utils/seo_helper.js';

export default async function handler(req, res) {
    const { artwork: artworkId } = req.query;

    try {
        const templatePath = join(process.cwd(), 'index.html');
        let html = fs.readFileSync(templatePath, 'utf-8');
        let debugInfo = `\n<!-- [SEO Debug] Request: ${JSON.stringify(req.query)} -->`;

        // 2. If no artworkId, just serve the plain index.html with debug info
        if (!artworkId) {
            return res.status(200).set({ 'Content-Type': 'text/html' }).end(html + debugInfo + `\n<!-- [SEO Debug] No artworkId provided. -->`);
        }

        console.log(`[SEO] Debugging request for artwork: ${artworkId}`);
        debugInfo += `\n<!-- [SEO Debug] Searching for artworkId: ${artworkId} -->`;

        // 3. Fetch artwork data
        const artwork = await fetchArtworkForSEO(artworkId);
        debugInfo += `\n<!-- [SEO Debug] Fetch Result: ${artwork ? 'FOUND: ' + artwork.title : 'NOT FOUND'} -->`;

        if (artwork) {
            // 4. Inject metadata using our helper
            html = injectMetadata(html, artwork);
            debugInfo += `\n<!-- [SEO Debug] Injection successful for: ${artwork.title} -->`;
        } else {
            debugInfo += `\n<!-- [SEO Debug] Serving default HTML because artwork was null. Check Sanity ID and Env Vars. -->`;
        }

        // 5. Serve the modified HTML with prepended debug info
        return res
            .status(200)
            .set({
                'Content-Type': 'text/html',
                'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59' // Reduced cache for debugging
            })
            .end(html + debugInfo);

    } catch (error) {
        console.error('[SEO Handler Error]:', error);
        try {
            const templatePath = join(process.cwd(), 'index.html');
            const html = fs.readFileSync(templatePath, 'utf-8');
            const errorInfo = `\n<!-- [SEO ERROR] Message: ${error.message} -->\n<!-- [SEO ERROR] Stack: ${error.stack} -->`;
            return res.status(200).set({ 'Content-Type': 'text/html' }).end(html + errorInfo);
        } catch (e) {
            return res.status(500).send('Internal Server Error: ' + e.message);
        }
    }
}
