import { create } from 'zustand';
import type { User } from 'firebase/auth';

interface AuthStore {
    user: User | null;
    setUser: (user: User | null) => void;
    isAdmin: boolean;
    setIsAdmin: (isAdmin: boolean) => void;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    isAdmin: false,
    setIsAdmin: (isAdmin) => set({ isAdmin }),
    isLoading: true,
    setIsLoading: (isLoading) => set({ isLoading }),
}));
