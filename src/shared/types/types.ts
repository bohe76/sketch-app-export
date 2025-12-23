import type { SketchOptions } from '@/features/sketch/engine/types';

export interface Artwork {
    _id: string;
    imageUrl: string;
    thumbnailUrl?: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    title: string;
    options: SketchOptions;
    createdAt: number;
    likeCount?: number;
    isLiked?: boolean;
    downloadCount?: number;
    viewCount?: number;
    shareCount?: number;
    remixCount?: number;
}

export interface UserProfile {
    uid: string;
    displayName: string | null;
    photoURL: string | null;
    email: string | null;
}
