'use client';
import { useState, useEffect } from 'react';
import { itemComments, auth } from '../lib/api';

interface CommentSectionProps {
  targetType: 'PRODUCT' | 'REAL_ESTATE' | 'JOB';
  targetId: string;
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

export default function CommentSection({ targetType, targetId }: CommentSectionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const currentUser = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('user') || 'null')
    : null;

  useEffect(() => {
    itemComments.getAll(targetType, targetId)
      .then(data => setComments(Array.isArray(data) ? data : []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [targetType, targetId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    if (!auth.isLoggedIn()) { window.location.href = '/profile'; return; }
    setSubmitting(true);
    try {
      const newComment = await itemComments.create({
        targetType,
        targetId,
        content: content.trim(),
        parentId: replyTo?.id,
      });
      if (replyTo) {
        setComments(prev => prev.map(c =>
          c.id === replyTo.id ? { ...c, replies: [...(c.replies || []), newComment] } : c
        ));
      } else {
        setComments(prev => [newComment, ...prev]);
      }
      setContent('');
      setReplyTo(null);
    } catch {}
    setSubmitting(false);
  }

  async function handleDelete(id: string, parentId?: string) {
    if (!confirm('Xóa bình luận này?')) return;
    await itemComments.delete(id);
    if (parentId) {
      setComments(prev => prev.map(c =>
        c.id === parentId ? { ...c, replies: c.replies.filter((r: any) => r.id !== id) } : c
      ));
    } else {
      setComments(prev => prev.filter(c => c.id !== id));
    }
  }

  function CommentItem({ c, parentId }: { c: any; parentId?: string }) {
    const name = c.user?.fullName || c.user?.username || 'Ẩn danh';
    const initial = name[0]?.toUpperCase() || 'A';
    const isOwn = currentUser && currentUser.id === c.userId;

    const CLIKE_KEY = 'comment_likes';
    const getCLiked = () => { try { return JSON.parse(localStorage.getItem(CLIKE_KEY) || '{}'); } catch { return {}; } };
    const [cLiked, setCLiked] = useState(() => !!getCLiked()[c.id]);
    const [cLikeCount, setCLikeCount] = useState<number>(c.likeCount || 0);

    function handleCommentLike() {
      if (!auth.isLoggedIn()) { window.location.href = '/profile'; return; }
      const liked = getCLiked();
      const nowLiked = !liked[c.id];
      if (nowLiked) liked[c.id] = true; else delete liked[c.id];
      localStorage.setItem(CLIKE_KEY, JSON.stringify(liked));
      setCLiked(nowLiked);
      setCLikeCount(n => nowLiked ? n + 1 : Math.max(0, n - 1));
    }

    return (
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 mt-0.5">
          {c.user?.avatarUrl ? <img src={c.user.avatarUrl} className="w-full h-full rounded-full object-cover" alt="" /> : initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-gray-100 rounded-2xl px-3 py-2">
            <p className="text-xs font-bold text-gray-900">{name}</p>
            <p className="text-sm text-gray-800 mt-0.5 leading-relaxed">{c.content}</p>
          </div>
          <div className="flex items-center gap-3 mt-1 px-1">
            <span className="text-[11px] text-gray-400">{timeAgo(c.createdAt)}</span>
            {/* Like button */}
            <button onClick={handleCommentLike}
              className={`flex items-center gap-1 text-[11px] font-semibold transition ${cLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
              <i className={cLiked ? 'ri-heart-fill' : 'ri-heart-line'}></i>
              {cLikeCount > 0 && <span>{cLikeCount}</span>}
            </button>
            {!parentId && (
              <button onClick={() => setReplyTo({ id: c.id, name })}
                className="text-[11px] text-gray-500 font-semibold hover:text-gray-800">
                Phản hồi
              </button>
            )}
            {isOwn && (
              <button onClick={() => handleDelete(c.id, parentId)}
                className="text-[11px] text-red-400 hover:text-red-600">
                Xóa
              </button>
            )}
          </div>
          {c.replies?.length > 0 && (
            <div className="mt-2 space-y-2 pl-2 border-l-2 border-gray-100">
              {c.replies.map((r: any) => <CommentItem key={r.id} c={r} parentId={c.id} />)}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-t border-gray-100 px-4 py-5">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <i className="ri-chat-3-line text-gray-500"></i>
        Bình luận {comments.length > 0 && <span className="text-gray-400 font-normal text-sm">({comments.length})</span>}
      </h3>

      {/* Input */}
      <form onSubmit={handleSubmit} className="mb-5">
        {replyTo && (
          <div className="flex items-center gap-2 text-xs text-blue-600 mb-2 bg-blue-50 px-3 py-1.5 rounded-lg">
            <i className="ri-corner-down-right-line"></i>
            Đang phản hồi <strong>{replyTo.name}</strong>
            <button type="button" onClick={() => setReplyTo(null)} className="ml-auto text-gray-400 hover:text-gray-600">
              <i className="ri-close-line"></i>
            </button>
          </div>
        )}
        <div className="flex gap-2 items-end">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
            {currentUser?.avatarUrl
              ? <img src={currentUser.avatarUrl} className="w-full h-full rounded-full object-cover" alt="" />
              : <i className="ri-user-line text-gray-500 text-sm"></i>}
          </div>
          <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 flex items-end gap-2">
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={auth.isLoggedIn() ? 'Viết bình luận...' : 'Đăng nhập để bình luận'}
              rows={1}
              className="flex-1 bg-transparent resize-none focus:outline-none text-sm text-gray-800 placeholder-gray-400 max-h-24"
              style={{ minHeight: 24 }}
              onInput={e => {
                const el = e.target as HTMLTextAreaElement;
                el.style.height = 'auto';
                el.style.height = el.scrollHeight + 'px';
              }}
            />
            <button type="submit" disabled={submitting || !content.trim()}
              className="text-yellow-500 hover:text-yellow-600 disabled:opacity-30 transition flex-shrink-0 pb-0.5">
              <i className="ri-send-plane-fill text-lg"></i>
            </button>
          </div>
        </div>
      </form>

      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div></div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <i className="ri-chat-3-line text-3xl block mb-1"></i>
          <p className="text-sm">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(c => <CommentItem key={c.id} c={c} />)}
        </div>
      )}
    </div>
  );
}
