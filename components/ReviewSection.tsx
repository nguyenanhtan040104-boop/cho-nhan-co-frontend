'use client';
import { useState, useEffect } from 'react';
import StarRating from './StarRating';
import { auth, reviews as reviewsApi } from '../lib/api';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.chonhanco.com/api';

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Hom nay';
  if (days < 30) return `${days} ngay truoc`;
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
    const uid = auth.getCurrentUserId();
    if (uid) setCurrentUserId(uid);
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
  const isLoggedIn = auth.isLoggedIn();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!myRating) { setError('Vui long chon so sao'); return; }
    setSubmitting(true); setError('');
    try {
      const newReview = await reviewsApi.create({ productId, rating: myRating, comment });
      setReviews(prev => [newReview, ...prev]);
      setAvgRating(prev => Math.round(((prev * total) + myRating) / (total + 1) * 10) / 10);
      setTotal(prev => prev + 1);
      setMyRating(0); setComment('');
      setSuccess('Cam on ban da danh gia!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err?.message || 'Gui that bai, thu lai sau');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await reviewsApi.delete(id);
      setReviews(prev => prev.filter(r => r.id !== id));
      setTotal(prev => prev - 1);
    } catch {}
  }

  return (
    <div className="bg-white rounded-xl p-5 mt-4">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="font-bold text-gray-900 text-base">Danh gia san pham</h3>
        {total > 0 && (
          <div className="flex items-center gap-1.5">
            <StarRating rating={avgRating} size="sm" />
            <span className="text-sm font-semibold text-gray-700">{avgRating}</span>
            <span className="text-xs text-gray-400">({total} danh gia)</span>
          </div>
        )}
      </div>
      {isLoggedIn && !isSeller && !alreadyReviewed && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-4 mb-5">
          <p className="text-sm font-semibold text-gray-700 mb-2">Viet danh gia cua ban</p>
          <div className="flex items-center gap-2 mb-3">
            <StarRating rating={myRating} interactive onRate={setMyRating} size="lg" />
            {myRating > 0 && <span className="text-sm text-gray-500">{['', 'Rat te', 'Te', 'Binh thuong', 'Tot', 'Rat tot'][myRating]}</span>}
          </div>
          <textarea value={comment} onChange={e => setComment(e.target.value)}
            placeholder="Chia se trai nghiem cua ban..." rows={3}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none" />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          {success && <p className="text-xs text-green-600 mt-1">{success}</p>}
          <button type="submit" disabled={submitting}
            className="mt-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-sm px-5 py-2 rounded-lg transition disabled:opacity-50">
            {submitting ? 'Dang gui...' : 'Gui danh gia'}
          </button>
        </form>
      )}
      {alreadyReviewed && <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg mb-4">Ban da danh gia san pham nay</p>}
      {isSeller && <p className="text-xs text-gray-400 mb-4">Ban khong the danh gia san pham cua chinh minh</p>}
      {!isLoggedIn && <p className="text-xs text-gray-400 mb-4">Dang nhap de gui danh gia</p>}
      {reviews.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Chua co danh gia nao. Hay la nguoi dau tien!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 text-yellow-700 font-bold text-sm overflow-hidden">
                {r.author?.avatarUrl ? <img src={r.author.avatarUrl} className="w-full h-full object-cover" alt="" />
                  : (r.author?.fullName || r.author?.username || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-800">{r.author?.fullName || r.author?.username}</span>
                  <StarRating rating={r.rating} size="sm" />
                  <span className="text-xs text-gray-400">{timeAgo(r.createdAt)}</span>
                  {r.author?.id === currentUserId && (
                    <button onClick={() => handleDelete(r.id)} className="text-xs text-red-400 hover:text-red-600 ml-auto">Xoa</button>
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