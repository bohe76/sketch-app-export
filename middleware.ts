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


export function middleware(req: Request) {
    const url = new URL(req.url);
    const userAgent = req.headers.get('user-agent')?.toLowerCase() || '';
    const artworkId = url.searchParams.get('artwork');

    // Route any request with an artwork parameter to our SEO handler for dynamic HTML
    if (artworkId) {
        console.log(`[Middleware] Artwork detected: ${artworkId}. Rewriting for UA: ${userAgent}`);

        // Rewrite logic for Vercel Edge Middleware without Next.js
        const rewriteUrl = new URL(url.toString());
        rewriteUrl.pathname = '/api/seo';

        return new Response(null, {
            headers: {
                'x-middleware-rewrite': rewriteUrl.toString(),
            },
        });
    }

    // Regular user without artwork parameter: Continue to static index.html or next handler
    return new Response(null, {
        headers: {
            'x-middleware-next': '1',
        },
    });
}
