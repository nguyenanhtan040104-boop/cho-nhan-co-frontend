'use client';
import { useState, useEffect } from 'react';

const LIKED_KEY = 'liked_items';

function getLiked(): string[] {
  try { return JSON.parse(localStorage.getItem(LIKED_KEY) || '[]'); } catch { return []; }
}

function toggleLiked(id: string): boolean {
  const list = getLiked();
  const isNowLiked = !list.includes(id);
  const next = isNowLiked ? [...list, id] : list.filter(x => x !== id);
  localStorage.setItem(LIKED_KEY, JSON.stringify(next));
  return isNowLiked;
}

export default function LikeButton({ itemId }: { itemId: string }) {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLiked(getLiked().includes(itemId));
  }, [itemId]);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const nowLiked = toggleLiked(itemId);
    setLiked(nowLiked);
  }

  return (
    <button
      onClick={handleClick}
      className="absolute top-1.5 right-1.5 w-7 h-7 bg-white/85 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform z-10"
    >
      <i className={`${liked ? 'ri-heart-fill text-red-500' : 'ri-heart-line text-gray-400'} text-sm transition-colors`}></i>
    </button>
  );
}
