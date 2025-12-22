import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load env vars
dotenv.config();

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors()); // Enable CORS for all routes (or restrict if needed)
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images

import fs from 'fs';

// Dynamic Import Helper for Vercel-style handlers
const handle = async (path, req, res) => {
    try {
        console.log(`[Server] Handling ${path}`);
        if (!process.env.VITE_SANITY_PROJECT_ID) {
            console.error('[Server] Missing VITE_SANITY_PROJECT_ID');
        }

        const module = await import(`${path}?update=${Date.now()}`);
        return await module.default(req, res);
    } catch (error) {
        const msg = `[Server] Error handling ${path}: ${error.message}\n${error.stack}\n`;
        console.error(msg);
        fs.appendFileSync('server_error.log', new Date().toISOString() + ' ' + msg);

        if (!res.headersSent) {
            res.status(500).json({ error: error.message, stack: error.stack });
        }
    }
};

// Routes echoing Vercel file structure
app.get('/api/feed', (req, res) => handle('./feed.js', req, res));
app.post('/api/publish', (req, res) => handle('./publish.js', req, res));
app.post('/api/sync-user', (req, res) => handle('./sync-user.js', req, res));
app.post('/api/like', (req, res) => handle('./like.js', req, res));
app.post('/api/track-metric', (req, res) => handle('./track-metric.js', req, res));
app.post('/api/delete-artwork', (req, res) => handle('./delete.js', req, res));

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
