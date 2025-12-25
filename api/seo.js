import { join } from 'path';
import fs from 'fs';
import { fetchArtworkForSEO, injectMetadata } from './utils/seo_helper.js';

export default async function handler(req, res) {
    const { artwork: artworkId } = req.query;

    try {
        let templatePath = join(process.cwd(), 'dist', 'template.html');
        if (!fs.existsSync(templatePath)) {
            templatePath = join(process.cwd(), 'template.html');
        }

        console.log(`[SEO] Reading template from: ${templatePath}`);
        let html = fs.readFileSync(templatePath, 'utf-8');

        // Log all user agents to help identify bots
        const userAgent = req.headers['user-agent'] || '';
        console.log(`[SEO] Request from User-Agent: ${userAgent}`);

        let debugInfo = `\n<!-- [SEO Debug] Request Params: ${JSON.stringify(req.query)} -->`;
        debugInfo += `\n<!-- [SEO Debug] UA: ${userAgent} -->`;

        // Determine if we should attempt metadata injection
        // Even if no artworkId, we continue so we can see the debug info in the browser
        if (!artworkId) {
            debugInfo += `\n<!-- [SEO Debug] No artworkId provided, serving base UI. -->`;
            return res.status(200).set({ 'Content-Type': 'text/html' }).end(html + debugInfo);
        }

        console.log(`[SEO] Searching for artworkId: ${artworkId}`);
        const artwork = await fetchArtworkForSEO(artworkId);

        if (artwork) {
            html = injectMetadata(html, artwork);
            debugInfo += `\n<!-- [SEO Debug] SUCCESS: Injected metadata for ${artwork.title} -->`;
        } else {
            debugInfo += `\n<!-- [SEO Debug] FAILED: Artwork not found in Sanity. -->`;
        }

        return res
            .status(200)
            .set({
                'Content-Type': 'text/html',
                'Cache-Control': 'no-cache, no-store, must-revalidate' // Prevent cache while debugging
            })
            .end(html + debugInfo);

    } catch (error) {
        console.error('[SEO Handler Error]:', error);
        // Serve basic index.html with error info
        const templatePath = join(process.cwd(), 'index.html');
        const html = fs.readFileSync(templatePath, 'utf-8');
        return res.status(200).set({ 'Content-Type': 'text/html' }).end(html + `\n<!-- [SEO ERROR] ${error.message} -->`);
    }
}
