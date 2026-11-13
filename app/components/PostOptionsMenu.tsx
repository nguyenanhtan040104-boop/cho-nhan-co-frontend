'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/api';

interface Props {
  postId: string;
  ownerId: string;
  onDelete: (id: string) => Promise<void>;
  editHref?: string;
}

export default function PostOptionsMenu({ postId, ownerId, onDelete, editHref }: Props) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setCurrentUserId(auth.getCurrentUserId());
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirming(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Chỉ hiện nếu đã đăng nhập và là chủ bài
  if (!currentUserId || !ownerId || currentUserId !== ownerId) return null;

  async function handleDelete() {
    if (!confirming) { setConfirming(true); return; }
    setLoading(true);
    try {
      await onDelete(postId);
    } catch {
      alert('Xóa thất bại, thử lại sau');
    } finally {
      setLoading(false);
      setOpen(false);
      setConfirming(false);
    }
  }

  return (
    <div ref={ref} className="relative" onClick={e => { e.preventDefault(); e.stopPropagation(); }}>
      <button
        onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(o => !o); setConfirming(false); }}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-soft hover:text-ink hover:bg-paper transition-colors"
        title="Tùy chọn"
      >
        <i className="ri-more-2-fill text-lg"></i>
      </button>

      {open && (
        <div className="absolute left-0 top-9 w-44 rounded-card border border-line bg-surface py-1 z-50"
          onClick={e => { e.preventDefault(); e.stopPropagation(); }}>
          {editHref && (
            <button
              onClick={e => { e.stopPropagation(); setOpen(false); router.push(editHref); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-paper transition-colors"
            >
              <i className="ri-pencil-line text-ink-soft"></i>
              Chỉnh sửa
            </button>
          )}
          <button
            onClick={e => { e.stopPropagation(); handleDelete(); }}
            disabled={loading}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
              confirming ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-ink hover:bg-brand-50 hover:text-brand-600'
            }`}
          >
            <i className={`text-brand-500 ${loading ? 'ri-loader-4-line animate-spin' : 'ri-delete-bin-line'}`}></i>
            {loading ? 'Đang xóa...' : confirming ? 'Nhấn lần nữa để xóa' : 'Xóa bài đăng'}
          </button>
        </div>
      )}
    </div>
  );
}
