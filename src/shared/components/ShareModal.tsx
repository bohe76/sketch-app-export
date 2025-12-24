import React, { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { XMarkIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { useShareStore } from '../model/shareStore';
import { useToastStore } from '@/shared/model/toastStore';
import { trackMetric } from '@/features/feed/api/feed';
import { useFeedStore } from '@/features/feed/model/feedStore';

const SOCIAL_PLATFORMS = [
    {
        id: 'kakao',
        name: 'KakaoTalk',
        icon: (
            <svg viewBox="0 0 24 24" className="w-[32px] h-[32px] fill-[#3C1E1E]">
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
            <svg viewBox="0 0 24 24" className="w-[28px] h-[28px] fill-white">
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
            <svg viewBox="0 0 192 192" className="w-6 h-6 fill-white">
                <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" />
            </svg>
        ),
        bgColor: 'bg-zinc-800',
        getShareUrl: (url: string, text: string) => `https://www.threads.net/intent/post?text=${encodeURIComponent(text + ' ' + url)}`
    }
];

declare global {
    interface Window {
        Kakao: any; // Still need any for the whole object or define it properly
    }
}

export const ShareModal: React.FC = () => {
    const { isOpen, artwork, closeShareModal } = useShareStore();
    const showToast = useToastStore(state => state.showToast);
    const updateArtwork = useFeedStore(state => state.updateArtwork);

    // Initialize Kakao SDK
    useEffect(() => {
        const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY;
        if (!kakaoKey) return;

        if (!window.Kakao) {
            const script = document.createElement('script');
            script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.0/kakao.min.js';
            script.onload = () => {
                if (!window.Kakao.isInitialized()) {
                    window.Kakao.init(kakaoKey);
                }
            };
            document.head.appendChild(script);
        } else if (!window.Kakao.isInitialized()) {
            window.Kakao.init(kakaoKey);
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

        if (platform.id === 'kakao' && window.Kakao?.isInitialized()) {
            window.Kakao.Share.sendDefault({
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
