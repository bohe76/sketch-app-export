import { join, resolve } from 'path';
import fs from 'fs';
import { fetchArtworkForSEO, injectMetadata } from './utils/seo_helper.js';

export default async function handler(req, res) {
    const { artwork: artworkId } = req.query;

    try {
        // Use path.resolve for solid serverless path resolution
        let templatePath = resolve(process.cwd(), 'dist', 'template.html');

        // Fallback for local development if dist doesn't exist yet
        if (!fs.existsSync(templatePath)) {
            templatePath = resolve(process.cwd(), 'template.html');
        }

        console.log(`[SEO] Active Template Path: ${templatePath}`);
        let html = fs.readFileSync(templatePath, 'utf-8');

        // Identify Requester and Environment
        const userAgent = req.headers['user-agent'] || '';
        const projectId = process.env.VITE_SANITY_PROJECT_ID;
        const envName = process.env.VITE_SANITY_DATASET || 'production';

        console.log(`[SEO] Request: ID=${artworkId || 'none'}, UA=${userAgent}`);

        let debugInfo = `\n<!-- [SEO Debug] Request: ${JSON.stringify(req.query)} -->`;
        debugInfo += `\n<!-- [SEO Debug] Env Check: ProjectID=${projectId ? projectId.substring(0, 4) + '...' : 'MISSING'}, Dataset=${envName} -->`;

        if (artworkId) {
            try {
                const artwork = await fetchArtworkForSEO(artworkId);
                if (artwork) {
                    html = injectMetadata(html, artwork);
                    debugInfo += `\n<!-- [SEO Debug] Injection: SUCCESS for "${artwork.title}" -->`;
                } else {
                    debugInfo += `\n<!-- [SEO Debug] Injection: FAILED (Sanity returned null for ID: ${artworkId}) -->`;
                }
            } catch (fetchError) {
                debugInfo += `\n<!-- [SEO Debug] Fetch Error: ${fetchError.message} -->`;
                console.error('[SEO Fetch Error]:', fetchError);
            }
        }

        res.status(200);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
        return res.end(html + debugInfo);

    } catch (error) {
        console.error('[SEO Fatal Error]:', error);
        // Emergency Fallback to raw template if everything fails
        try {
            const fallbackPath = resolve(process.cwd(), 'template.html');
            const html = fs.readFileSync(fallbackPath, 'utf-8');
            res.status(200);
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.end(html + `\n<!-- [SEO ERROR] ${error.message} -->`);
        } catch (e) {
            return res.status(500).send('Internal Server Error: ' + e.message);
        }
    }
}
