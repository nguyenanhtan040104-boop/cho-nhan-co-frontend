'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { forum, auth } from '../../../lib/api';

function getCurrentUserId(): string | null {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.id || null;
  } catch { return null; }
}

export default function PostDetail({ postId }: { postId: string }) {
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Comment edit state
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  useEffect(() => {
    setCurrentUserId(getCurrentUserId());
    forum.getOne(postId)
      .then(data => setPost(data))
      .catch(() => setError('Không tìm thấy bài viết'))
      .finally(() => setLoading(false));
  }, [postId]);

  async function handleLike() {
    if (!auth.isLoggedIn()) { alert('Vui lòng đăng nhập để thích bài viết'); return; }
    try {
      await forum.likePost(postId);
      setLiked(true);
      setPost((prev: any) => ({ ...prev, likeCount: prev.likeCount + 1 }));
    } catch { }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!auth.isLoggedIn()) { alert('Vui lòng đăng nhập để bình luận'); return; }
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const newComment = await forum.addComment(postId, comment);
      setPost((prev: any) => ({ ...prev, comments: [...(prev.comments || []), newComment] }));
      setComment('');
    } catch (e: any) {
      alert(e.message || 'Lỗi gửi bình luận');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!confirm('Xóa bình luận này?')) return;
    try {
      await forum.deleteComment(commentId);
      setPost((prev: any) => ({
        ...prev,
        comments: prev.comments.filter((c: any) => c.id !== commentId),
      }));
    } catch (e: any) {
      alert(e.message || 'Xóa thất bại');
    }
  }

  async function handleUpdateComment(commentId: string) {
    if (!editingContent.trim()) return;
    try {
      await forum.updateComment(commentId, editingContent);
      setPost((prev: any) => ({
        ...prev,
        comments: prev.comments.map((c: any) =>
          c.id === commentId ? { ...c, content: editingContent } : c
        ),
      }));
      setEditingCommentId(null);
    } catch (e: any) {
      alert(e.message || 'Cập nhật thất bại');
    }
  }

  async function handlePinComment(commentId: string) {
    try {
      await forum.pinComment(commentId);
      setPost((prev: any) => ({
        ...prev,
        comments: prev.comments.map((c: any) =>
          c.id === commentId ? { ...c, isPinned: !c.isPinned } : c
        ),
      }));
    } catch (e: any) {
      alert(e.message || 'Ghim thất bại');
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error || !post) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <p className="text-gray-500">{error || 'Không tìm thấy bài viết'}</p>
      <Link href="/forum" className="text-purple-600 underline">Quay lại diễn đàn</Link>
    </div>
  );

  const isPostOwner = currentUserId && post.user?.id === currentUserId;

  // Sắp xếp: pinned comment lên đầu
  const sortedComments = [...(post.comments || [])].sort((a: any, b: any) =>
    (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/forum" className="w-9 h-9 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50">
            <i className="ri-arrow-left-line"></i>
          </Link>
          <div className="text-sm text-gray-500 flex-1">
            <Link href="/forum" className="hover:text-purple-600">Diễn đàn</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 line-clamp-1">{post.title}</span>
          </div>
          {isPostOwner && (
            <Link href={`/forum/${postId}/edit`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium">
              <i className="ri-edit-line"></i> Chỉnh sửa
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 md:py-8 space-y-6">
        {/* Post */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            {post.isAnonymous ? (
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <i className="ri-user-line text-gray-500"></i>
              </div>
            ) : post.user?.avatarUrl ? (
              <img src={post.user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">
                {post.user?.fullName?.[0] || 'U'}
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">{post.isAnonymous ? 'Ẩn danh' : post.user?.fullName}</p>
              <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</p>
            </div>
            {post.category && (
              <span className="ml-auto bg-purple-50 text-purple-600 text-xs px-2 py-1 rounded">{post.category}</span>
            )}
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>

          {post.images?.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {post.images.map((img: any, i: number) => (
                <img key={i} src={img.url || img} alt="" className="rounded-lg w-full h-auto max-h-72 object-contain bg-gray-100" />
              ))}
            </div>
          )}

          <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">{post.content}</div>

          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-4">
              {post.tags.map((tag: string, i: number) => (
                <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">#{tag}</span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 mt-4 pt-4 border-t">
            <button onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}>
              <i className={liked ? 'ri-heart-fill' : 'ri-heart-line'}></i>
              {post.likeCount} thích
            </button>
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <i className="ri-chat-1-line"></i> {post.comments?.length || 0} bình luận
            </span>
            <span className="flex items-center gap-1.5 text-sm text-gray-500 ml-auto">
              <i className="ri-eye-line"></i> {post.viewCount}
            </span>
          </div>
        </div>

        {/* Comments */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Bình luận ({post.comments?.length || 0})</h2>

          {/* Comment form */}
          <form onSubmit={handleComment} className="mb-6">
            <textarea value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Viết bình luận của bạn..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 resize-none mb-2" />
            <button type="submit" disabled={submitting || !comment.trim()}
              className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm">
              {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
            </button>
          </form>

          {/* Comments list */}
          <div className="space-y-4">
            {sortedComments.map((c: any) => {
              const isCommentOwner = currentUserId && c.user?.id === currentUserId;
              const isEditing = editingCommentId === c.id;

              return (
                <div key={c.id} className={`flex gap-3 ${c.isPinned ? 'bg-yellow-50 border border-yellow-200 rounded-xl p-3 -mx-3' : ''}`}>
                  {c.isPinned && (
                    <div className="absolute">
                    </div>
                  )}
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-600">
                    {c.user?.fullName?.[0] || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{c.user?.fullName}</span>
                        {c.isPinned && (
                          <span className="flex items-center gap-0.5 text-xs text-yellow-600 font-medium">
                            <i className="ri-pushpin-fill"></i> Đã ghim
                          </span>
                        )}
                        <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>

                      {isEditing ? (
                        <div className="mt-2">
                          <textarea
                            value={editingContent}
                            onChange={e => setEditingContent(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 resize-none"
                          />
                          <div className="flex gap-2 mt-1">
                            <button onClick={() => handleUpdateComment(c.id)}
                              className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700">
                              Lưu
                            </button>
                            <button onClick={() => setEditingCommentId(null)}
                              className="text-xs border border-gray-300 px-3 py-1 rounded hover:bg-gray-50">
                              Hủy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-700">{c.content}</p>
                      )}
                    </div>

                    {/* Comment actions */}
                    {!isEditing && (isCommentOwner || isPostOwner) && (
                      <div className="flex gap-3 mt-1 ml-1">
                        {isCommentOwner && (
                          <button
                            onClick={() => { setEditingCommentId(c.id); setEditingContent(c.content); }}
                            className="text-xs text-gray-400 hover:text-purple-600 flex items-center gap-0.5">
                            <i className="ri-edit-line"></i> Sửa
                          </button>
                        )}
                        {(isCommentOwner || isPostOwner) && (
                          <button onClick={() => handleDeleteComment(c.id)}
                            className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-0.5">
                            <i className="ri-delete-bin-line"></i> Xóa
                          </button>
                        )}
                        {isPostOwner && (
                          <button onClick={() => handlePinComment(c.id)}
                            className={`text-xs flex items-center gap-0.5 ${c.isPinned ? 'text-yellow-500 hover:text-gray-400' : 'text-gray-400 hover:text-yellow-500'}`}>
                            <i className={c.isPinned ? 'ri-pushpin-fill' : 'ri-pushpin-line'}></i>
                            {c.isPinned ? 'Bỏ ghim' : 'Ghim'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {(!post.comments || post.comments.length === 0) && (
              <p className="text-center text-gray-400 text-sm py-4">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
