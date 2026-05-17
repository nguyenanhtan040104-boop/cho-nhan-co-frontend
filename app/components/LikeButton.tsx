'use client';
import { useState, useEffect } from 'react';
import { itemComments, auth } from '../../lib/api';

const LIKED_KEY = 'liked_items';
const API = process.env.NEXT_PUBLIC_API_URL || 'https://cho-nhan-co-backend-production.up.railway.app/api';

function getLiked(): string[] {
  try { return JSON.parse(localStorage.getItem(LIKED_KEY) || '[]'); } catch { return []; }
}
function setLikedLocal(id: string, liked: boolean) {
  const list = getLiked();
  const next = liked ? [...list.filter(x => x !== id), id] : list.filter(x => x !== id);
  localStorage.setItem(LIKED_KEY, JSON.stringify(next));
}

export default function LikeButton({ itemId, targetType = 'PRODUCT' }: { itemId: string; targetType?: string }) {
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLiked(getLiked().includes(itemId));
  }, [itemId]);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    const isLoggedIn = auth.isLoggedIn();
    const nowLiked = !liked;
    // Optimistic update
    setLiked(nowLiked);
    setLikedLocal(itemId, nowLiked);
    if (isLoggedIn) {
      setLoading(true);
      try {
        await itemComments.toggleLike(targetType, itemId);
      } catch {}
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      className="absolute bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 bg-white/85 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform z-10"
    >
      <i className={`${liked ? 'ri-heart-fill text-red-500' : 'ri-heart-line text-gray-400'} text-sm transition-colors`}></i>
    </button>
  );
}
