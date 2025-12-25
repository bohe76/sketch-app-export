/**
 * Centralized Analytics Manager for Sketchrang
 * Handles all Google Analytics event tracking with type safety.
 */

// 1. Defined Event Names
export const ANALYTICS_EVENTS = {
    APP_ENTRY: 'app_entry',
    INTERACTION_LIKE: 'interaction_like',
    INTERACTION_SHARE: 'interaction_share',
    INTERACTION_DOWNLOAD: 'interaction_download',
    INTERACTION_REMIX: 'interaction_remix',
    STUDIO_PUBLISH: 'studio_publish',
    STUDIO_STYLE_CHANGE: 'studio_style_change',
} as const;

export type AnalyticsEventName = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

// 2. Defined Parameter Values (Enums for consistency)
export const ANALYTICS_VALUES = {
    ENTRY_TYPE: {
        SHARED_LINK: 'shared_link',
        DIRECT: 'direct_search',
    },
    SHARE_PLATFORM: {
        KAKAO: 'kakao',
        X: 'x',
        FACEBOOK: 'facebook',
        THREADS: 'threads',
        LINK_COPY: 'link_copy',
    },
    STYLE_MODE: {
        CLASSIC: 'classic',
        VINTAGE: 'vintage',
        VIVID: 'vivid',
    },
} as const;

type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

export const analytics = {
    /**
     * General event tracking
     */
    track: (eventName: AnalyticsEventName, params?: AnalyticsParams) => {
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', eventName, params);

            // Log only in development mode
            if (import.meta.env.DEV) {
                console.debug(`[Analytics] ${eventName}`, params);
            }
        }
    },

    /**
     * Specific helper for app entry tracking
     */
    trackEntry: (artworkId: string | null) => {
        analytics.track(ANALYTICS_EVENTS.APP_ENTRY, {
            entry_type: artworkId ? ANALYTICS_VALUES.ENTRY_TYPE.SHARED_LINK : ANALYTICS_VALUES.ENTRY_TYPE.DIRECT,
            artwork_id: artworkId || 'none'
        });
    },

    /**
     * Specific helper for share interaction tracking
     */
    trackShare: (platform: string, artworkId: string) => {
        analytics.track(ANALYTICS_EVENTS.INTERACTION_SHARE, {
            platform,
            artwork_id: artworkId
        });
    },

    /**
     * Specific helper for style change tracking
     */
    trackStyleChange: (styleId: string) => {
        analytics.track(ANALYTICS_EVENTS.STUDIO_STYLE_CHANGE, {
            style_id: styleId
        });
    }
};
