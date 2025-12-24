import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useShareStore } from '../model/shareStore';
import { useToastStore } from '@/shared/model/toastStore';
import { trackMetric } from '@/features/feed/api/feed';
import { useFeedStore } from '@/features/feed/model/feedStore';

const SOCIAL_PLATFORMS = [
    {
        id: 'kakao',
        name: 'KakaoTalk',
        icon: (
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#3C1E1E]">
                <path d="M12 3c-4.97 0-9 3.119-9 6.967 0 2.492 1.64 4.675 4.119 5.925l-.834 3.109c-.046.174.053.357.221.408.064.019.131.02.196.002l3.655-2.433c.535.059 1.084.09 1.643.09 4.97 0 9-3.119 9-6.967S16.97 3 12 3z" />
            </svg>
        ),
        bgColor: 'bg-[#FEE500]',
        getShareUrl: (url: string, text: string) => `https://sharer.kakao.com/talk/friends/picker/link?app_key=&app_ver=1.0&display_vars=%7B%22title%22%3A%22${encodeURIComponent(text)}%22%7D&link_ver=4.0&url=${encodeURIComponent(url)}` // Placeholder for simple link share
    },
    {
        id: 'x',
        name: 'X',
        icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
        bgColor: 'bg-black',
        getShareUrl: (url: string, text: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    },
    {
        id: 'facebook',
        name: 'Facebook',
        icon: (
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
            </svg>
        ),
        bgColor: 'bg-[#1877F2]',
        getShareUrl: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    },
    {
        id: 'threads',
        name: 'Threads',
        icon: (
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                <path d="M12 12c0-1.1 0-2.06-.06-2.88.59-.14 1.25-.21 1.94-.21 1.76 0 3.01.44 3.75 1.34s.88 2.08.43 3.56c-.34 1.13-1 1.92-1.95 2.37-1.11.53-2.37.52-3.79-.04a5.45 5.45 0 0 1-2.95-3.09c-.58-1.42-.51-2.83.18-4.22.46-.92 1.15-1.6 2.06-2.03C12.5 6.42 13.51 6.2 14.65 6.2c1.78 0 3.29.5 4.54 1.5 1.38 1.11 2.2 2.76 2.45 4.9.41 3.39-.71 6.37-3.36 8.91C15.82 23.86 12.44 25 8.16 25 3.12 25 0 22 0 17s3.12-8 8.16-8c.67 0 1.32.05 1.96.15C10.1 7.42 10.3 5.4 10.74 3H8V0h6c1.1 0 2 .9 2 2v1h-3c-.15 1-.35 2-.59 3 .34-.15.7-.27 1.08-.34.34-.06.7-.1 1.08-.1 1.2 0 2.23.15 3.08.45s1.5 1.05 1.95 1.96c.45.91.56 2.06.33 3.45-.48 2.87-1.85 4.93-4.11 6.18-1.55.85-3.3 1.12-5.22.8-1.07-.18-1.98-.56-2.73-1.15s-1.3-1.42-1.65-2.48c-.46-1.39-.42-2.7.11-3.92.35-.8.88-1.41 1.58-1.83C7.5 7.84 8.35 7.6 9.27 7.6c1.12 0 2.06.26 2.8.78.34-.15.7-.27 1.08-.34.34-.06.7-.1 1.08-.1 1.45 0 2.7.35 3.75 1.05s1.85 1.7 2.4 3c.4 1.34.45 2.76.15 4.2-.6 2.85-2.25 4.8-4.96 5.85C13.88 23.1 11.62 23.3 8.8 22.8c-1.3-.23-2.43-.72-3.38-1.47s-1.65-1.78-2.1-3.11c-.5-1.5-.42-2.95.23-4.35C4.1 12.8 4.9 12 6.1 11.5c1.15-.5 2.5-.55 4-.15.25-1.2.4-2.4.45-3.6z" />
            </svg>
        ),
        bgColor: 'bg-zinc-800',
        getShareUrl: (url: string, text: string) => `https://www.threads.net/intent/post?text=${encodeURIComponent(text + ' ' + url)}`
    }
];

export const ShareModal: React.FC = () => {
    const { isOpen, artwork, closeShareModal } = useShareStore();
    const showToast = useToastStore(state => state.showToast);
    const updateArtwork = useFeedStore(state => state.updateArtwork);

    // Initialize Kakao SDK
    useEffect(() => {
        const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY;
        if (!kakaoKey) return;

        if (!(window as any).Kakao) {
            const script = document.createElement('script');
            script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.0/kakao.min.js';
            script.onload = () => {
                if (!(window as any).Kakao.isInitialized()) {
                    (window as any).Kakao.init(kakaoKey);
                }
            };
            document.head.appendChild(script);
        } else if (!(window as any).Kakao.isInitialized()) {
            (window as any).Kakao.init(kakaoKey);
        }
    }, []);

    if (!isOpen || !artwork) return null;

    const shareUrl = `${window.location.origin}/?artwork=${artwork._id}`;
    const shareText = `Check out this artwork by @${artwork.authorName} on Sketchrang!`;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            showToast("Link copied to clipboard", "success");

            // Track metric
            const result = await trackMetric(artwork._id, 'share');
            if (result.success) {
                updateArtwork(artwork._id, { shareCount: result.count });
            }
        } catch (err) {
            console.error('Failed to copy link:', err);
            showToast("Failed to copy link", "error");
        }
    };

    const handlePlatformShare = async (platform: typeof SOCIAL_PLATFORMS[0]) => {
        // Track metric
        try {
            const result = await trackMetric(artwork._id, 'share');
            if (result.success) {
                updateArtwork(artwork._id, { shareCount: result.count });
            }
        } catch (error) {
            console.error("Metric tracking failed:", error);
        }

        if (platform.id === 'kakao' && (window as any).Kakao?.isInitialized()) {
            (window as any).Kakao.Share.sendDefault({
                objectType: 'feed',
                content: {
                    title: 'Sketchrang Artwork',
                    description: shareText,
                    imageUrl: artwork.imageUrl,
                    link: {
                        mobileWebUrl: shareUrl,
                        webUrl: shareUrl,
                    },
                },
                buttons: [
                    {
                        title: 'View Artwork',
                        link: {
                            mobileWebUrl: shareUrl,
                            webUrl: shareUrl,
                        },
                    },
                ],
            });
        } else {
            const url = platform.getShareUrl(shareUrl, shareText);
            window.open(url, '_blank', 'width=600,height=500');
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 overflow-hidden">
                {/* Backdrop */}
                <div
                    onClick={closeShareModal}
                    className="absolute inset-0 z-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal / Bottom Sheet */}
                <div
                    className={`
                        relative z-10 bg-white w-full max-w-sm overflow-hidden 
                        rounded-[32px] shadow-2xl flex flex-col
                        lg:mb-0 mb-safe-bottom
                        fixed lg:relative bottom-4 lg:bottom-0
                    `}
                >
                    {/* Header */}
                    <div className="px-6 pt-8 pb-4 flex items-center justify-between">
                        <h3 className="text-xl font-black text-zinc-900 tracking-tighter uppercase">Share Art</h3>
                        <button
                            onClick={closeShareModal}
                            className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400 hover:text-zinc-900"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Social Grid */}
                    <div className="px-6 py-4 grid grid-cols-4 gap-4">
                        {SOCIAL_PLATFORMS.map((platform) => (
                            <button
                                key={platform.id}
                                onClick={() => handlePlatformShare(platform)}
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className={`w-14 h-14 ${platform.bgColor} rounded-2xl flex items-center justify-center shadow-soft group-hover:scale-105 group-active:scale-95 transition-all`}>
                                    {platform.icon}
                                </div>
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">{platform.name}</span>
                            </button>
                        ))}
                    </div>

                    {/* Link Copy Area */}
                    <div className="px-6 pb-8 pt-4">
                        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-2 pl-4 flex items-center justify-between gap-3">
                            <span className="text-sm text-zinc-500 font-medium truncate flex-1">
                                {shareUrl}
                            </span>
                            <button
                                onClick={handleCopyLink}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm h-[38px] overflow-hidden whitespace-nowrap bg-zinc-900 text-white hover:bg-black shadow-md transition-transform active:scale-95"
                            >
                                <ClipboardDocumentIcon className="w-4 h-4" />
                                <span>Copy</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatePresence>
    );
};
