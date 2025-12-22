import type { SketchOptions } from '@/features/sketch/engine/types';

export interface Artwork {
  _id: string;
  title: string;
  imageUrl: string;
  thumbnailUrl: string;
  authorName: string;
  authorId: string;
  authorAvatar?: string;
  likeCount?: number;
  downloadCount?: number;
  shareCount?: number;
  remixCount?: number;
  isLiked?: boolean;
  options: SketchOptions;
  _createdAt: string;
}

export const fetchFeed = async (authorId?: string, sort: 'latest' | 'trending' = 'latest', userId?: string): Promise<Artwork[]> => {
  const query = new URLSearchParams();
  if (authorId) query.append('authorId', authorId);
  if (userId) query.append('userId', userId);
  query.append('sort', sort);
  query.append('t', Date.now().toString());

  const url = `/api/feed?${query.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch feed');
  }
  return await response.json();
};

export const fetchArtworkById = async (artworkId: string, userId?: string): Promise<Artwork> => {
  const query = new URLSearchParams();
  query.append('id', artworkId);
  if (userId) query.append('userId', userId);
  query.append('t', Date.now().toString());

  const response = await fetch(`/api/feed?${query.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch artwork');
  }
  return await response.json();
};

export const trackMetric = async (artworkId: string, type: 'download' | 'share' | 'remix') => {
  const response = await fetch('/api/track-metric', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ artworkId, type }),
  });

  if (!response.ok) {
    throw new Error('Failed to track metric');
  }

  return await response.json();
};

export const toggleLike = async (artworkId: string, userId: string, isLiked: boolean) => {
  const response = await fetch('/api/like', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ artworkId, userId, isLiked }),
  });

  if (!response.ok) {
    throw new Error('Failed to toggle like');
  }

  return await response.json();
};

export const deleteArtwork = async (artworkId: string, userId: string) => {
  const response = await fetch('/api/delete-artwork', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ artworkId, userId }),
  });

  if (!response.ok) {
    throw new Error('Failed to delete artwork');
  }

  return await response.json();
};
