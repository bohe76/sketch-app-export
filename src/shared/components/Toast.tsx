import React from 'react';
import { useToastStore } from '../model/toastStore';

export const Toast: React.FC = () => {
    const { message, isVisible, type } = useToastStore();

    if (!isVisible || !message) return null;

    const isLoading = type === 'loading';

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[500] pointer-events-none">
            <div className={`
                ${isLoading ? 'bg-white text-zinc-900 border-zinc-200' : 'bg-zinc-800 text-white border-white/10'} 
                px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border opacity-95 pointer-events-auto 
                animate-toast-in
            `}>
                {isLoading && (
                    <svg className="animate-spin h-4 w-4 text-zinc-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                <span className="text-sm font-bold tracking-tight">{message}</span>
            </div>
        </div>
    );
};
