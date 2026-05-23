'use client';
import { useState, useEffect } from 'react';
import StarRating from './StarRating';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.chonhanco.com/api';

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Hôm nay';
  if (days < 30) return `${days} ngày trước`;
  return new Date(d).toLocaleDateString('vi-VN');
}

export default function ReviewSection({ productId, sellerId }: { productId: string; sellerId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [total, setTotal] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.sub || payload.id || '');
      }
    } catch {}
    fetch(`${API}/reviews/product/${productId}`)
      .then(r => r.json())
      .then(data => {
        setReviews(data.data || []);
        setAvgRating(data.avgRating || 0);
        setTotal(data.total || 0);
      })
      .catch(() => {});
  }, [productId]);

  const isSeller = currentUserId === sellerId;
  const alreadyReviewed = reviews.some(r => r.author?.id === currentUserId);
  const isLoggedIn = !!currentUserId;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!myRating) { setError('Vui lòng chọn số sao'); return; }
    setSubmitting(true); setError('');
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`${API}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId, rating: myRating, comment }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || 'Gửi thất bại');
        return;
      }
      const newReview = await res.json();
      setReviews(prev => [newReview, ...prev]);
      setAvgRating(prev => Math.round(((prev * total) + myRating) / (total + 1) * 10) / 10);
      setTotal(prev => prev + 1);
      setMyRating(0); setComment(''); setSuccess('Cảm ơn bạn đã đánh giá!');
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Đã có lỗi, thử lại sau'); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(id: string) {
    const token = localStorage.getItem('accessToken');
    await fetch(`${API}/reviews/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setReviews(prev => prev.filter(r => r.id !== id));
    setTotal(prev => prev - 1);
  }

  return (
    <div className="bg-white rounded-xl p-5 mt-4">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="font-bold text-gray-900 text-base">Đánh giá sản phẩm</h3>
        {total > 0 && (
          <div className="flex items-center gap-1.5">
            <StarRating rating={avgRating} size="sm" />
            <span className="text-sm font-semibold text-gray-700">{avgRating}</span>
            <span className="text-xs text-gray-400">({total} đánh giá)</span>
          </div>
        )}
      </div>

      {/* Form gửi đánh giá */}
      {isLoggedIn && !isSeller && !alreadyReviewed && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-4 mb-5">
          <p className="text-sm font-semibold text-gray-700 mb-2">Viết đánh giá của bạn</p>
          <div className="flex items-center gap-2 mb-3">
            <StarRating rating={myRating} interactive onRate={setMyRating} size="lg" />
            {myRating > 0 && <span className="text-sm text-gray-500">{['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Rất tốt'][myRating]}</span>}
          </div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          {success && <p className="text-xs text-green-600 mt-1">{success}</p>}
          <button type="submit" disabled={submitting}
            className="mt-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-sm px-5 py-2 rounded-lg transition disabled:opacity-50">
            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </form>
      )}
      {alreadyReviewed && <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg mb-4">✓ Bạn đã đánh giá sản phẩm này</p>}
      {isSeller && <p className="text-xs text-gray-400 mb-4">Bạn không thể đánh giá sản phẩm của chính mình</p>}
      {!isLoggedIn && <p className="text-xs text-gray-400 mb-4">Đăng nhập để gửi đánh giá</p>}

      {/* Danh sách đánh giá */}
      {reviews.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 text-yellow-700 font-bold text-sm">
                {r.author?.avatarUrl
                  ? <img src={r.author.avatarUrl} className="w-full h-full rounded-full object-cover" alt="" />
                  : (r.author?.fullName || r.author?.username || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-800">{r.author?.fullName || r.author?.username}</span>
                  <StarRating rating={r.rating} size="sm" />
                  <span className="text-xs text-gray-400">{timeAgo(r.createdAt)}</span>
                  {r.author?.id === currentUserId && (
                    <button onClick={() => handleDelete(r.id)} className="text-xs text-red-400 hover:text-red-600 ml-auto">Xóa</button>
                  )}
                </div>
                {r.comment && <p className="text-sm text-gray-600 mt-1">{r.comment}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
