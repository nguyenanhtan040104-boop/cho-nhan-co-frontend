'use client';
import { useState, useEffect } from 'react';
import { itemComments, auth } from '../../lib/api';

const LIKED_KEY = 'liked_items';
const API = process.env.NEXT_PUBLIC_API_URL || 'https://cho-nhan-co-backend.onrender.com/api';

function getLiked(): string[] {
  try { return JSON.parse(localStorage.getItem(LIKED_KEY) || '[]'); } catch { return []; }
}
function setLikedLocal(id: string, liked: boolean) {
  const list = getLiked();
  const next = liked ? [...list.filter(x => x !== id), id] : list.filter(x => x !== id);
  localStorage.setItem(LIKED_KEY, JSON.stringify(next));
}

type LikeButtonProps = {
  itemId: string;
  targetType?: string;
  /** When true, renders without absolute positioning — for use inside meta rows */
  inline?: boolean;
  className?: string;
};

export default function LikeButton({ itemId, targetType = 'PRODUCT', inline, className }: LikeButtonProps) {
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

  if (inline) {
    return (
      <button
        onClick={handleClick}
        aria-label={liked ? 'Bỏ thích' : 'Thích'}
        className={`flex items-center justify-center ${className || ''}`}
      >
        <i className={`${liked ? 'ri-heart-fill text-brand-500' : 'ri-heart-line text-ink-faint hover:text-brand-500'} text-base transition-colors`}></i>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      aria-label={liked ? 'Bỏ thích' : 'Thích'}
      className={`absolute top-1.5 right-1.5 z-10 grid h-8 w-8 place-items-center rounded-full border border-line bg-white ${className || ''}`}
    >
      <i className={`${liked ? 'ri-heart-fill text-brand-500' : 'ri-heart-line text-ink-soft'} text-base transition-colors`}></i>
    </button>
  );
}
