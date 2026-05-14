'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  postId: string;
  ownerId: string;
  currentUserId: string | null;
  onDelete: (id: string) => Promise<void>;
  editHref?: string;
}

export default function PostOptionsMenu({ postId, ownerId, currentUserId, onDelete, editHref }: Props) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  if (!currentUserId || currentUserId !== ownerId) return null;

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
        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        title="Tùy chọn"
      >
        <i className="ri-more-2-fill text-lg"></i>
      </button>

      {open && (
        <div className="absolute right-0 top-9 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
          {editHref && (
            <button
              onClick={() => { setOpen(false); router.push(editHref); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <i className="ri-pencil-line text-blue-500"></i>
              Chỉnh sửa
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={loading}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
              confirming ? 'bg-red-50 text-red-700 font-semibold' : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
            }`}
          >
            <i className={`text-red-500 ${loading ? 'ri-loader-4-line animate-spin' : 'ri-delete-bin-line'}`}></i>
            {loading ? 'Đang xóa...' : confirming ? 'Nhấn lần nữa để xóa' : 'Xóa bài đăng'}
          </button>
        </div>
      )}
    </div>
  );
}
