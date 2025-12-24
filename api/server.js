import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { fetchArtworkForSEO, injectMetadata } from './utils/seo_helper.js';

// Load env vars - Already called above


// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors()); // Enable CORS for all routes (or restrict if needed)
app.use((req, res, next) => {
    console.log(`[HTTP] ${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images

app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// SEO Middleware for Social Sharing
app.get('/', async (req, res, next) => {
    const artworkId = req.query.artwork;

    // Only intercept if artwork ID is present and it's a GET request for the root
    if (artworkId) {
        console.log(`[SEO] Intercepting request for artwork: ${artworkId}`);
        try {
            const artwork = await fetchArtworkForSEO(artworkId);
            if (artwork) {
                const templatePath = join(__dirname, '../index.html');
                let html = fs.readFileSync(templatePath, 'utf-8');

                // Inject metadata
                html = injectMetadata(html, artwork);

                console.log(`[SEO] Serving dynamic HTML for: ${artwork.title}`);
                return res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
            }
        } catch (error) {
            console.error('[SEO Error]:', error);
            // Fallback to default behavior if SEO injection fails
        }
    }
    next();
});

// Dynamic Import Helper for Vercel-style handlers
const handle = async (moduleId, req, res) => {
    try {
        const modulePath = `./${moduleId}.js`;
        console.log(`[Server] Loading module: ${modulePath}`);
        const module = await import(`${modulePath}?t=${Date.now()}`);

        if (typeof module.default !== 'function') {
            throw new Error(`Handler in ${moduleId} must export a default function`);
        }

        console.log(`[Server] Calling handler for ${moduleId}...`);
        const result = await module.default(req, res);
        console.log(`[Server] Handler for ${moduleId} completed.`);
        return result;
    } catch (error) {
        console.error(`[Server Error] [${moduleId}] :`, error);
        if (!res.headersSent) {
            res.status(500).json({ error: error.message, path: moduleId });
        }
    }
};

// Routes echoing Vercel file structure
app.get('/api/feed', (req, res) => handle('feed', req, res));
app.post('/api/upload-asset', (req, res) => handle('upload-asset', req, res));
app.post('/api/publish', (req, res) => handle('publish', req, res));
app.post('/api/publish-v2', (req, res) => handle('publish-v2', req, res));
app.post('/api/sync-user', (req, res) => handle('sync-user', req, res));
app.post('/api/like', (req, res) => handle('like', req, res));
app.post('/api/track-metric', (req, res) => handle('track-metric', req, res));
app.post('/api/delete-artwork', (req, res) => handle('delete', req, res));

// Vite Integration (Unified Port 3000)
import { createServer as createViteServer } from 'vite';

const startServer = async () => {
    // Create Vite server in middleware mode
    const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
    });

    // Use vite's connect instance as middleware
    app.use(vite.middlewares);

    app.listen(PORT, () => {
        console.log(`
🚀 Unified Server running at http://localhost:${PORT}
   - Frontend: Vite HMR enabled
   - Backend:  /api/* (Local Express)
        `);
    });
};

startServer();
