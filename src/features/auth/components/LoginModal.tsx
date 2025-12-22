import React from 'react';
import { useLoginModalStore } from '../model/loginModalStore';
import { loginWithGoogle, loginWithKakao } from '../api/auth';

export const LoginModal: React.FC = () => {
    const { isOpen, closeLoginModal } = useLoginModalStore();

    if (!isOpen) return null;

    const handleGoogleLogin = async () => {
        await loginWithGoogle();
        closeLoginModal();
    };

    const handleKakaoLogin = async () => {
        await loginWithKakao();
        closeLoginModal();
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-scale-in relative">

                {/* Close Button */}
                <button
                    onClick={closeLoginModal}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="p-8 text-center pt-12">
                    <h2 className="text-2xl font-black mb-2 tracking-tighter">Welcome Back</h2>
                    <p className="text-gray-500 mb-8 text-sm">Sign in to save and publish your art.</p>

                    <div className="flex flex-row gap-3 justify-center">
                        {/* Google Button */}
                        <button
                            onClick={handleGoogleLogin}
                            className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-bold py-3 px-4 rounded-xl hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Google
                        </button>

                        {/* Kakao Button */}
                        <button
                            onClick={handleKakaoLogin}
                            className="flex-1 flex items-center justify-center gap-2 bg-[#FEE500] text-[#3c1e1e] font-bold py-3 px-4 rounded-xl hover:bg-[#FDD835] transition-all active:scale-95 shadow-sm border border-[#FEE500]"
                        >
                            <svg className="w-6 h-6 relative top-[1px]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 3C7.58 3 4 5.79 4 9.24c0 1.96 1.15 3.7 2.94 4.88-.13.48-.47 1.74-.54 2.01-.08.31.11.31.23.23.16-.11 1.78-1.21 2.47-1.68.29.04.59.06.89.06 4.42 0 8-2.79 8-6.24C18 5.79 14.42 3 12 3z" />
                            </svg>
                            Kakao
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
