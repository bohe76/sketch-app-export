import { resolve } from 'path';
import fs from 'fs';
import { fetchArtworkForSEO, injectMetadata } from './utils/seo_helper.js';

export default async function handler(req, res) {
    const { artwork: artworkId } = req.query;

    try {
        let templatePath = resolve(process.cwd(), 'dist', 'template.html');

        if (!fs.existsSync(templatePath)) {
            templatePath = resolve(process.cwd(), 'template.html');
        }

        let html = fs.readFileSync(templatePath, 'utf-8');

        if (artworkId) {
            try {
                const artwork = await fetchArtworkForSEO(artworkId);
                if (artwork) {
                    html = injectMetadata(html, artwork);
                }
            } catch (fetchError) {
                console.error('[SEO Fetch Error]:', fetchError);
            }
        }

        res.status(200);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
        return res.end(html);

    } catch (error) {
        console.error('[SEO Fatal Error]:', error);
        try {
            const fallbackPath = resolve(process.cwd(), 'template.html');
            const html = fs.readFileSync(fallbackPath, 'utf-8');
            res.status(200);
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.end(html);
        } catch (e) {
            return res.status(500).send('Internal Server Error');
        }
    }
}
