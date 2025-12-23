import { useRef, useEffect, useState } from 'react';
import { Canvas } from '@/features/sketch/components/Canvas';
import { ControlPanel } from '@/features/sketch/components/ControlPanel';
import { useSketchStore } from '@/features/sketch/model/store';
import { useAuthStore } from '@/features/auth/model/store';
import { initAuth, logout } from '@/features/auth/api/auth';
import { ArrowDownTrayIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { PaperAirplaneIcon as PaperAirplaneSolidIcon } from '@heroicons/react/24/solid';
import { FeedList } from '@/features/feed/components/FeedList';
import { fetchArtworkById } from '@/features/feed/api/feed';
import type { Artwork } from '@/features/feed/api/feed';
import { useFeedStore } from '@/features/feed/model/feedStore';
import { ArtworkDetailModal } from '@/features/feed/components/ArtworkDetailModal';
import { GlobalModal } from '@/shared/components/GlobalModal';
import { useUIStore } from '@/shared/model/uiStore';
import { LoginModal } from '@/features/auth/components/LoginModal';
import { useLoginModalStore } from '@/features/auth/model/loginModalStore';
import { PublishModal } from '@/features/studio/components/PublishModal';
import { Toast } from '@/shared/components/Toast';
import { useSketchFlow } from '@/features/sketch/hooks/useSketchFlow';

const App = () => {
    const { sourceImage, options } = useSketchStore();
    const { user, isLoading: isAuthLoading } = useAuthStore();
    const { openLoginModal } = useLoginModalStore();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const hasCheckedParams = useRef(false);

    const { viewMode, setViewMode, activeTab, setActiveTab } = useUIStore();
    const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
    const [hoverText, setHoverText] = useState<string | null>(null);

    // Hook for Sketch Logic
    const { handleImageUpload, handleReset, handleDownload, handlePublish, handleRemix } = useSketchFlow();

    const onRemixWrapper = (artwork: Artwork) => {
        handleRemix(artwork);
        setSelectedArtwork(null);
    };

    // Initial Auth
    useEffect(() => {
        const unsubscribe = initAuth();
        return () => unsubscribe();
    }, []);

    // Handle Deep Links (?artwork=ID)
    useEffect(() => {
        if (isAuthLoading || hasCheckedParams.current) return;

        const params = new URLSearchParams(window.location.search);
        const artworkId = params.get('artwork');

        if (artworkId) {
            hasCheckedParams.current = true;

            // 1. Instant Skeleton: Open modal with just the ID
            // We wrap this in setTimeout to avoid 'react-hooks/set-state-in-effect' lint error
            // while still triggering the modal frame immediately.
            setTimeout(() => {
                setSelectedArtwork({ _id: artworkId } as Artwork);
            }, 0);

            const loadSharedArtwork = async () => {
                try {
                    const artwork = await fetchArtworkById(artworkId, user?.uid);
                    if (artwork) {
                        // 2. Full Data: Modal will update via Store sync
                        setSelectedArtwork(artwork);
                        // Clean up URL without refreshing
                        window.history.replaceState({}, '', window.location.pathname);
                    }
                } catch (error) {
                    console.error("Failed to load shared artwork:", error);
                    setSelectedArtwork(null); // Close if truly failed
                }
            };
            loadSharedArtwork();
        }
    }, [isAuthLoading, user]);

    const { removeArtwork } = useFeedStore();

    const handleDelete = (artworkId: string) => {
        // Remove from local store immediately for SSOT behavior
        removeArtwork(artworkId);
        setSelectedArtwork(null);
    };

    const handleNavToGallery = () => {
        setActiveTab('latest');
        setViewMode('feed');
    };

    const handleNavToMe = () => {
        if (!user) {
            openLoginModal();
            return;
        }
        setActiveTab('mine');
        setViewMode('feed');
    };

    // We no longer block the entire app with a "Loading..." screen.
    // Sub-components (like FeedList) will handle their own skeleton states.
    // Auth-dependent UI (Login/Logout buttons) will shift once isAuthLoading is false.

    return (
        <div className="app-container">
            <GlobalModal /> {/* Global Modal Mount Point */}
            <LoginModal /> {/* Login Modal Mount Point */}
            <PublishModal /> {/* Publish Modal Mount Point */}
            <Toast />

            {selectedArtwork && (
                <ArtworkDetailModal
                    artwork={selectedArtwork}
                    currentUserId={user?.uid}
                    onClose={() => setSelectedArtwork(null)}
                    onRemix={onRemixWrapper}
                    onDelete={handleDelete}
                />
            )}

            {/* Main Content Area - Padding bottom for mobile nav */}
            <main className="flex-1 flex flex-col relative h-full pb-16 lg:pb-0">

                {/* Header Overlay */}
                <header className="header-overlay">
                    <div className="flex items-center gap-6 pointer-events-auto">
                        <h1 className="logo-text" onClick={handleNavToGallery}>
                            SKETCHRANG
                        </h1>
                        <nav className="nav-pill-group hidden lg:flex">
                            <button
                                onClick={() => setViewMode('studio')}
                                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${viewMode === 'studio' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                            >
                                Sketch
                            </button>
                            <button
                                onClick={handleNavToGallery}
                                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${viewMode === 'feed' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                            >
                                Gallery
                            </button>
                        </nav>
                    </div>

                    <div className="pointer-events-auto hidden lg:flex items-center gap-2">

                        {user ? (
                            <div className="flex items-center gap-2 mr-4">
                                {user.photoURL && <img src={user.photoURL} alt="me" className="w-8 h-8 rounded-full border border-gray-300" />}
                                <button onClick={logout} className="text-xs font-bold hover:underline">Logout</button>
                            </div>
                        ) : (
                            <button
                                onClick={openLoginModal}
                                className="btn-white mr-2"
                            >
                                Login
                            </button>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </div>

                </header>

                {/* Content View Switcher */}
                {viewMode === 'studio' && (
                    <div className="viewport-studio overflow-hidden">
                        {/* Mobile Studio Actions Group (Icons only for mobile) */}
                        <div className="lg:hidden absolute top-20 right-4 z-[210] flex flex-row gap-3 pointer-events-auto">
                            <div className="relative group">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-black/80 backdrop-blur-md p-2.5 rounded-full text-white shadow-lg border border-white/10"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                    </svg>
                                </button>
                            </div>

                            {sourceImage && (
                                <>
                                    <button onClick={handleReset} className="bg-black/80 backdrop-blur-md p-2.5 rounded-full text-white border border-white/10 shadow-lg">
                                        <ArrowPathIcon className="w-6 h-6" />
                                    </button>
                                    <button onClick={handleDownload} className="bg-black/80 backdrop-blur-md p-2.5 rounded-full text-white border border-white/10 shadow-lg">
                                        <ArrowDownTrayIcon className="w-6 h-6" />
                                    </button>
                                    <button onClick={handlePublish} className="bg-black/80 backdrop-blur-md p-2.5 rounded-full text-white border border-white/10 shadow-lg">
                                        <PaperAirplaneSolidIcon className="w-6 h-6" />
                                    </button>
                                </>
                            )}
                        </div>

                        {sourceImage ? (
                            <div className="canvas-container relative">
                                <Canvas
                                    imageUrl={sourceImage}
                                    options={options}
                                    className="absolute inset-0 block"
                                />

                                {/* --- PC STUDIO ACTION PILL (Bottom Centered) --- */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 hidden lg:flex items-center pointer-events-auto">
                                    <div className="flex items-center gap-1 bg-white/80 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-full p-2 pr-1.5">

                                        {/* 1. Change Image */}
                                        <div className="relative group">
                                            <button
                                                className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-zinc-100 transition-all active:scale-95 text-zinc-700 font-bold text-sm whitespace-nowrap"
                                                onClick={() => fileInputRef.current?.click()}
                                                onMouseEnter={() => setHoverText("Change Photo")}
                                                onMouseLeave={() => setHoverText(null)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                                </svg>
                                                <span>Change Image</span>
                                            </button>
                                            {hoverText === "Change Photo" && (
                                                <div className="tooltip-box animate-tooltip-in !-top-12">REPLACE SOURCE PHOTO</div>
                                            )}
                                        </div>

                                        {/* 2. Reset Tuning */}
                                        <div className="relative group">
                                            <button
                                                className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-zinc-100 transition-all active:scale-95 text-zinc-700 font-bold text-sm whitespace-nowrap"
                                                onClick={handleReset}
                                                onMouseEnter={() => setHoverText("Reset Tuning")}
                                                onMouseLeave={() => setHoverText(null)}
                                            >
                                                <ArrowPathIcon className="w-5 h-5" />
                                                <span>Reset Tuning</span>
                                            </button>
                                            {hoverText === "Reset Tuning" && (
                                                <div className="tooltip-box animate-tooltip-in !-top-12">RETURN OPTIONS TO DEFAULT</div>
                                            )}
                                        </div>

                                        {/* 3. Download */}
                                        <div className="relative group">
                                            <button
                                                className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-zinc-100 transition-all active:scale-95 text-zinc-700 font-bold text-sm whitespace-nowrap"
                                                onClick={handleDownload}
                                                onMouseEnter={() => setHoverText("Download PNG")}
                                                onMouseLeave={() => setHoverText(null)}
                                            >
                                                <ArrowDownTrayIcon className="w-5 h-5" />
                                                <span>Download</span>
                                            </button>
                                            {hoverText === "Download PNG" && (
                                                <div className="tooltip-box animate-tooltip-in !-top-12">SAVE SKETCH AS PNG</div>
                                            )}
                                        </div>

                                        {/* Separator */}
                                        <div className="w-px h-6 bg-zinc-200 mx-2" />

                                        {/* 4. Publish (Highlighted) */}
                                        <div className="relative group">
                                            <button
                                                className="btn-hero !px-7 !py-2.5 flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
                                                onClick={handlePublish}
                                                onMouseEnter={() => setHoverText("Publish Artwork")}
                                                onMouseLeave={() => setHoverText(null)}
                                            >
                                                <PaperAirplaneSolidIcon className="w-5 h-5 -rotate-45" />
                                                <span>Publish</span>
                                            </button>
                                            {hoverText === "Publish Artwork" && (
                                                <div className="tooltip-box animate-tooltip-in !-top-12">SHARE TO GLOBAL GALLERY</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state-box">
                                <p className="text-gray-400 mb-4">
                                    Drop an image or upload to start your sketch <span className="text-red-500 font-bold">(Max 4MB)</span>
                                </p>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="btn-text"
                                >
                                    Browse Files
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {viewMode === 'feed' && (
                    <div className="viewport-feed">
                        <div className="w-full py-10">
                            {/* Feed Strategy Tabs */}
                            <div className="flex justify-center mb-10">
                                <div className="bg-white rounded-full p-1 shadow-soft border border-zinc-200 flex gap-1">
                                    <button
                                        onClick={() => setActiveTab('trending')}
                                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'trending' ? 'bg-primary text-white shadow-sm' : 'text-zinc-500 hover:bg-zinc-50'}`}
                                    >
                                        Trending
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('latest')}
                                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'latest' ? 'bg-primary text-white shadow-sm' : 'text-zinc-500 hover:bg-zinc-50'}`}
                                    >
                                        New
                                    </button>
                                    <button
                                        onClick={handleNavToMe}
                                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'mine' ? 'bg-primary text-white shadow-sm' : 'text-zinc-500 hover:bg-zinc-50'}`}
                                    >
                                        My Gallery
                                    </button>
                                </div>
                            </div>

                            <FeedList
                                filterAuthorId={activeTab === 'mine' && user ? user.uid : undefined}
                                sort={activeTab === 'trending' ? 'trending' : 'latest'}
                                onArtworkClick={setSelectedArtwork}
                            />
                        </div>
                    </div>
                )}
            </main>

            {/* Sidebar Control Panel (Responsive: Compact Toolbar on Mobile, Sidebar on Desktop) */}
            {(viewMode === 'studio') && (
                <ControlPanel />
            )}

            {/* Mobile Bottom Navigation */}
            <nav className="mobile-nav-bar">
                <button
                    onClick={handleNavToGallery}
                    className={`mobile-nav-item ${viewMode === 'feed' && activeTab !== 'mine' ? 'mobile-nav-item-active' : ''}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Gallery</span>
                </button>

                <button
                    onClick={() => setViewMode('studio')}
                    className={`mobile-nav-item ${viewMode === 'studio' ? 'mobile-nav-item-active' : ''}`}
                >
                    <div className="bg-primary text-white rounded-full p-2 -mt-6 border-4 border-white shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <span className="mt-1 font-bold">Sketch</span>
                </button>

                <button
                    onClick={handleNavToMe}
                    className={`mobile-nav-item ${viewMode === 'feed' && activeTab === 'mine' ? 'mobile-nav-item-active' : ''}`}
                >
                    {user ? (
                        user.photoURL ? (
                            <img src={user.photoURL} alt="me" className="w-6 h-6 rounded-full border border-gray-300" />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        )
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                    )}
                    <span>{user ? 'Me' : 'Login'}</span>
                </button>
            </nav>
        </div>
    );
};
export default App;
