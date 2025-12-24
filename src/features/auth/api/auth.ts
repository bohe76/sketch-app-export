import {
    GoogleAuthProvider,
    OAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '@/shared/libs/firebase';
import { useAuthStore } from '../model/store';

// Initialize Auth Listener
export const initAuth = () => {
    const { setUser, setIsLoading } = useAuthStore.getState();

    return onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser);
        setIsLoading(false);

        if (firebaseUser) {
            // Sync user to Sanity
            await syncUserToSanity(firebaseUser);
        }
    });
};

export const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Google Login Failed:", error);
        alert("Google Login failed. Please try again.");
    }
};

export const loginWithKakao = async () => {
    const provider = new OAuthProvider('oidc.kakao');
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Kakao Login Failed:", error);
        alert("Kakao Login failed. Please try again.");
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout Failed:", error);
    }
};

// Sync Firebase User to Sanity User Document via Serverless Function
export const syncUserToSanity = async (user: User) => {
    try {
        await fetch('/api/sync-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user: {
                    uid: user.uid,
                    displayName: user.displayName,
                    photoURL: user.photoURL
                }
            })
        });
    } catch (error) {
        console.error("Sanity Sync Failed:", error);
    }
};
