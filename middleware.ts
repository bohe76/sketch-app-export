import { NextRequest, NextResponse } from 'next/server';

/**
 * Vercel Edge Middleware: Intercepts social bot requests and rewrites to SEO handler.
 * This runs before static file serving, allowing us to bypass the index.html priority for bots.
 */
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - assets (Vite assets)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\..*).*)',
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

export function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const userAgent = req.headers.get('user-agent')?.toLowerCase() || '';
    const artworkId = url.searchParams.get('artwork');

    // If it's a social bot AND there's an artwork parameter, route to our SEO handler
    const isBot = BOT_USER_AGENTS.some((bot) => userAgent.includes(bot));

    if (isBot && artworkId) {
        console.log(`[Middleware] Bot detected: ${userAgent}. Rewriting to SEO handler for artwork: ${artworkId}`);

        // Redirect to the API handler but keep the original URL in the address bar
        url.pathname = '/api/seo';
        return NextResponse.rewrite(url);
    }

    // Regular user or no artwork parameter: Continue to static index.html or next handler
    return NextResponse.next();
}
