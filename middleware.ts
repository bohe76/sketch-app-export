/**
 * Vercel Edge Middleware: Intercepts social bot requests and rewrites to SEO handler.
 * This version uses standard Web APIs to avoid Next.js dependencies.
 */
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - favicon.ico (favicon file)
         * - assets (Vite assets)
         * - Static files with extensions
         */
        '/((?!api|favicon.ico|assets|.*\\..*).*)',
        '/',
    ],
};


export async function middleware(req: Request) {
    const url = new URL(req.url);
    const userAgent = req.headers.get('user-agent')?.toLowerCase() || '';
    const artworkId = url.searchParams.get('artwork');

    // Route any request with an artwork parameter to our SEO handler for dynamic HTML
    if (artworkId) {
        console.log(`[Middleware] Artwork detected: ${artworkId}. Fetching from SEO handler...`);

        // Create the internal URL for the SEO handler
        const apiTarget = new URL('/api/seo', url.origin);
        apiTarget.searchParams.set('artwork', artworkId);

        try {
            // Directly fetch the rendered HTML from the SEO handler
            const response = await fetch(apiTarget.toString(), {
                headers: {
                    'user-agent': userAgent,
                    'accept': 'text/html'
                }
            });

            if (response.ok) {
                const html = await response.text();
                // Return the dynamically generated HTML directly to the browser
                return new Response(html, {
                    status: 200,
                    headers: {
                        'content-type': 'text/html; charset=utf-8',
                        'x-seo-status': 'fetched-from-api'
                    }
                });
            }
        } catch (error) {
            console.error('[Middleware Fetch Error]:', error);
        }
    }

    // Regular user without artwork parameter: Continue to static index.html or next handler
    return new Response(null, {
        headers: {
            'x-middleware-next': '1',
        },
    });
}
