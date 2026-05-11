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

function Avatar({ user, size = 8 }: { user: any; size?: number }) {
  const s = `w-${size} h-${size}`;
  if (user?.avatarUrl)
    return <img src={user.avatarUrl} alt="" className={`${s} rounded-full object-cover flex-shrink-0`} />;
  return (
    <div className={`${s} bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-purple-700`}>
      {user?.fullName?.[0] || user?.username?.[0] || 'U'}
    </div>
  );
}

export default function PostDetail({ postId }: { postId: string }) {
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Comment edit / reply states
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Per-comment like state: { [commentId]: { liked, count } }
  const [commentLikes, setCommentLikes] = useState<Record<string, { liked: boolean; count: number }>>({});

  useEffect(() => {
    setCurrentUserId(getCurrentUserId());
    forum.getOne(postId)
      .then((data: any) => {
        setPost(data);
        // Init commentLikes from loaded data
        const initial: Record<string, { liked: boolean; count: number }> = {};
        (data.comments || []).forEach((c: any) => {
          initial[c.id] = { liked: false, count: c.likeCount ?? 0 };
          (c.replies || []).forEach((r: any) => {
            initial[r.id] = { liked: false, count: r.likeCount ?? 0 };
          });
        });
        setCommentLikes(initial);
      })
      .catch(() => setError('Không tìm thấy bài viết'))
      .finally(() => setLoading(false));

    if (auth.isLoggedIn()) {
      forum.isLiked(postId).then((res: any) => {
        setLiked(typeof res === 'boolean' ? res : !!res);
      }).catch(() => {});
    }
  }, [postId]);

  // ── Post like ──
  async function handleLike() {
    if (!auth.isLoggedIn()) { alert('Vui lòng đăng nhập để thích bài viết'); return; }
    try {
      const res = await forum.likePost(postId);
      if (res && typeof res.liked === 'boolean') {
        setLiked(res.liked);
        setPost((prev: any) => ({ ...prev, likeCount: res.likeCount }));
      }
    } catch { }
  }

  // ── Comment like ──
  async function handleCommentLike(commentId: string) {
    if (!auth.isLoggedIn()) { alert('Vui lòng đăng nhập'); return; }
    try {
      const res = await forum.likeComment(commentId);
      if (res && typeof res.liked === 'boolean') {
        setCommentLikes(prev => ({ ...prev, [commentId]: { liked: res.liked, count: res.likeCount } }));
      }
    } catch { }
  }

  // ── Send comment ──
  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!auth.isLoggedIn()) { alert('Vui lòng đăng nhập để bình luận'); return; }
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const newComment = await forum.addComment(postId, comment);
      setPost((prev: any) => ({ ...prev, comments: [...(prev.comments || []), newComment] }));
      setCommentLikes(prev => ({ ...prev, [newComment.id]: { liked: false, count: 0 } }));
      setComment('');
    } catch (e: any) {
      alert(e.message || 'Lỗi gửi bình luận');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Send reply ──
  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!auth.isLoggedIn()) { alert('Vui lòng đăng nhập để trả lời'); return; }
    if (!replyText.trim() || !replyingTo) return;
    setReplySubmitting(true);
    try {
      const newReply = await forum.addReply(postId, replyText, replyingTo.id);
      setPost((prev: any) => ({
        ...prev,
        comments: prev.comments.map((c: any) =>
          c.id === replyingTo.id
            ? { ...c, replies: [...(c.replies || []), newReply] }
            : c
        ),
      }));
      setCommentLikes(prev => ({ ...prev, [newReply.id]: { liked: false, count: 0 } }));
      setReplyText('');
      setReplyingTo(null);
    } catch (e: any) {
      alert(e.message || 'Lỗi gửi trả lời');
    } finally {
      setReplySubmitting(false);
    }
  }

  async function handleDeleteComment(commentId: string, parentId?: string) {
    if (!confirm('Xóa bình luận này?')) return;
    try {
      await forum.deleteComment(commentId);
      setPost((prev: any) => {
        if (parentId) {
          return {
            ...prev,
            comments: prev.comments.map((c: any) =>
              c.id === parentId
                ? { ...c, replies: (c.replies || []).filter((r: any) => r.id !== commentId) }
                : c
            ),
          };
        }
        return { ...prev, comments: prev.comments.filter((c: any) => c.id !== commentId) };
      });
    } catch (e: any) {
      alert(e.message || 'Xóa thất bại');
    }
  }

  async function handleUpdateComment(commentId: string, parentId?: string) {
    if (!editingContent.trim()) return;
    try {
      await forum.updateComment(commentId, editingContent);
      setPost((prev: any) => {
        const update = (list: any[]) =>
          list.map((c: any) => c.id === commentId ? { ...c, content: editingContent } : c);
        if (parentId) {
          return {
            ...prev,
            comments: prev.comments.map((c: any) =>
              c.id === parentId ? { ...c, replies: update(c.replies || []) } : c
            ),
          };
        }
        return { ...prev, comments: update(prev.comments) };
      });
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
  const sortedComments = [...(post.comments || [])].sort((a: any, b: any) =>
    (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)
  );
  const totalComments = sortedComments.reduce((acc: number, c: any) => acc + 1 + (c.replies?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-user-line text-gray-500"></i>
              </div>
            ) : (
              <Avatar user={post.user} size={10} />
            )}
            <div>
              <p className="font-medium text-gray-900">{post.isAnonymous ? 'Ẩn danh' : (post.user?.fullName || post.user?.username)}</p>
              <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
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
              <i className="ri-chat-1-line"></i> {totalComments} bình luận
            </span>
            <span className="flex items-center gap-1.5 text-sm text-gray-500 ml-auto">
              <i className="ri-eye-line"></i> {post.viewCount}
            </span>
          </div>
        </div>

        {/* Comments */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Bình luận ({totalComments})</h2>

          {/* Main comment form */}
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
              const cLike = commentLikes[c.id] ?? { liked: false, count: c.likeCount ?? 0 };

              return (
                <div key={c.id}>
                  {/* Main comment */}
                  <div className={`flex gap-3 ${c.isPinned ? 'bg-yellow-50 border border-yellow-200 rounded-xl p-3' : ''}`}>
                    <Avatar user={c.user} size={8} />
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-50 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-semibold text-gray-900">{c.user?.fullName || c.user?.username}</span>
                          {c.isPinned && (
                            <span className="flex items-center gap-0.5 text-xs text-yellow-600 font-medium">
                              <i className="ri-pushpin-fill"></i> Đã ghim
                            </span>
                          )}
                          <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        {isEditing ? (
                          <div className="mt-1">
                            <textarea value={editingContent} onChange={e => setEditingContent(e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 resize-none" />
                            <div className="flex gap-2 mt-1">
                              <button onClick={() => handleUpdateComment(c.id)}
                                className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700">Lưu</button>
                              <button onClick={() => setEditingCommentId(null)}
                                className="text-xs border border-gray-300 px-3 py-1 rounded hover:bg-gray-50">Hủy</button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-700 leading-relaxed">{c.content}</p>
                        )}
                      </div>

                      {/* Comment action row */}
                      {!isEditing && (
                        <div className="flex items-center gap-3 mt-1.5 ml-1">
                          {/* Like */}
                          <button onClick={() => handleCommentLike(c.id)}
                            className={`flex items-center gap-1 text-xs transition-colors ${cLike.liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
                            <i className={cLike.liked ? 'ri-heart-fill' : 'ri-heart-line'}></i>
                            {cLike.count > 0 && <span>{cLike.count}</span>}
                            <span>Thích</span>
                          </button>

                          {/* Reply */}
                          <button
                            onClick={() => {
                              if (replyingTo?.id === c.id) { setReplyingTo(null); setReplyText(''); }
                              else { setReplyingTo({ id: c.id, name: c.user?.fullName || c.user?.username || 'người dùng' }); setReplyText(''); }
                            }}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-purple-600 transition-colors">
                            <i className="ri-reply-line"></i> Trả lời
                          </button>

                          {isCommentOwner && (
                            <button onClick={() => { setEditingCommentId(c.id); setEditingContent(c.content); }}
                              className="flex items-center gap-1 text-xs text-gray-400 hover:text-purple-600 transition-colors">
                              <i className="ri-edit-line"></i> Sửa
                            </button>
                          )}
                          {(isCommentOwner || isPostOwner) && (
                            <button onClick={() => handleDeleteComment(c.id)}
                              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors">
                              <i className="ri-delete-bin-line"></i> Xóa
                            </button>
                          )}
                          {isPostOwner && (
                            <button onClick={() => handlePinComment(c.id)}
                              className={`flex items-center gap-1 text-xs transition-colors ${c.isPinned ? 'text-yellow-500 hover:text-gray-400' : 'text-gray-400 hover:text-yellow-500'}`}>
                              <i className={c.isPinned ? 'ri-pushpin-fill' : 'ri-pushpin-line'}></i>
                              {c.isPinned ? 'Bỏ ghim' : 'Ghim'}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Reply form */}
                      {replyingTo?.id === c.id && (
                        <form onSubmit={handleReply} className="mt-2 flex gap-2 items-start">
                          <div className="flex-1">
                            <textarea
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              placeholder={`Trả lời ${replyingTo.name}...`}
                              rows={2}
                              autoFocus
                              className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 resize-none"
                            />
                            <div className="flex gap-2 mt-1">
                              <button type="submit" disabled={replySubmitting || !replyText.trim()}
                                className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 disabled:opacity-50">
                                {replySubmitting ? 'Đang gửi...' : 'Gửi'}
                              </button>
                              <button type="button" onClick={() => { setReplyingTo(null); setReplyText(''); }}
                                className="text-xs border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                                Hủy
                              </button>
                            </div>
                          </div>
                        </form>
                      )}

                      {/* Replies */}
                      {c.replies?.length > 0 && (
                        <div className="mt-2 space-y-2 pl-4 border-l-2 border-purple-100">
                          {c.replies.map((r: any) => {
                            const isReplyOwner = currentUserId && r.user?.id === currentUserId;
                            const isEditingReply = editingCommentId === r.id;
                            const rLike = commentLikes[r.id] ?? { liked: false, count: r.likeCount ?? 0 };

                            return (
                              <div key={r.id} className="flex gap-2">
                                <Avatar user={r.user} size={7} />
                                <div className="flex-1 min-w-0">
                                  <div className="bg-purple-50 rounded-xl px-3 py-2">
                                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                      <span className="text-xs font-semibold text-gray-900">{r.user?.fullName || r.user?.username}</span>
                                      <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>

                                    {isEditingReply ? (
                                      <div>
                                        <textarea value={editingContent} onChange={e => setEditingContent(e.target.value)}
                                          rows={2}
                                          className="w-full px-2 py-1 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-purple-500 resize-none" />
                                        <div className="flex gap-2 mt-1">
                                          <button onClick={() => handleUpdateComment(r.id, c.id)}
                                            className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded hover:bg-purple-700">Lưu</button>
                                          <button onClick={() => setEditingCommentId(null)}
                                            className="text-xs border border-gray-300 px-2 py-0.5 rounded">Hủy</button>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-xs text-gray-700 leading-relaxed">{r.content}</p>
                                    )}
                                  </div>

                                  {!isEditingReply && (
                                    <div className="flex items-center gap-3 mt-1 ml-1">
                                      <button onClick={() => handleCommentLike(r.id)}
                                        className={`flex items-center gap-1 text-xs transition-colors ${rLike.liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
                                        <i className={rLike.liked ? 'ri-heart-fill' : 'ri-heart-line'}></i>
                                        {rLike.count > 0 && <span>{rLike.count}</span>}
                                        <span>Thích</span>
                                      </button>

                                      {isReplyOwner && (
                                        <button onClick={() => { setEditingCommentId(r.id); setEditingContent(r.content); }}
                                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-purple-600 transition-colors">
                                          <i className="ri-edit-line"></i> Sửa
                                        </button>
                                      )}
                                      {(isReplyOwner || isPostOwner) && (
                                        <button onClick={() => handleDeleteComment(r.id, c.id)}
                                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors">
                                          <i className="ri-delete-bin-line"></i> Xóa
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {sortedComments.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-4">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
