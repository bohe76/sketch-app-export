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

const BOT_USER_AGENTS = [
    'facebookexternalhit',
    'twitterbot',
    'kakaotalk-scrap',
    'kakaobot',
    'slackbot',
    'whatsapp',
    'googlebot',
    'bingbot',
];

export function middleware(req: Request) {
    const url = new URL(req.url);
    const userAgent = req.headers.get('user-agent')?.toLowerCase() || '';
    const artworkId = url.searchParams.get('artwork');

    // If it's a social bot AND there's an artwork parameter, route to our SEO handler
    const isBot = BOT_USER_AGENTS.some((bot) => userAgent.includes(bot));

    if (isBot && artworkId) {
        console.log(`[Middleware] Bot detected: ${userAgent}. Rewriting to SEO handler for artwork: ${artworkId}`);

        // Rewrite logic for Vercel Edge Middleware without Next.js
        const rewriteUrl = new URL(url.toString());
        rewriteUrl.pathname = '/api/seo';

        return new Response(null, {
            headers: {
                'x-middleware-rewrite': rewriteUrl.toString(),
            },
        });
    }

    // Regular user or no artwork parameter: Continue to static index.html or next handler
    return new Response(null, {
        headers: {
            'x-middleware-next': '1',
        },
    });
}
