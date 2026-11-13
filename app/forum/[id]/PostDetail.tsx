'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { forum, auth } from '../../../lib/api';
import { forumCategoryLabel } from '../categories';

function getCurrentUserId(): string | null {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.id || null;
  } catch { return null; }
}

function Avatar({ user, px = 32 }: { user: any; px?: number }) {
  const style = { width: px, height: px };
  if (user?.avatarUrl) return <img src={user.avatarUrl} alt="" style={style} className="shrink-0 rounded-full object-cover" />;
  return (
    <div style={style} className="grid shrink-0 place-items-center rounded-full bg-forest-100 text-xs font-bold text-forest-700">
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
      const res: any = await forum.likePost(postId);
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
      const res: any = await forum.likeComment(commentId);
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
      const newComment: any = await forum.addComment(postId, comment);
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
      const newReply: any = await forum.addReply(postId, replyText, replyingTo.id);
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
    <div className="grid min-h-[60vh] place-items-center">
      <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-forest-600 border-t-transparent" />
    </div>
  );

  if (error || !post) return (
    <div className="grid min-h-[60vh] place-items-center px-4 text-center">
      <div>
        <i className="ri-file-search-line text-4xl text-ink-faint" aria-hidden="true" />
        <p className="mb-4 mt-2 text-ink-soft">{error || 'Không tìm thấy bài viết'}</p>
        <Link href="/forum" className="btn-primary">Về diễn đàn</Link>
      </div>
    </div>
  );

  const isPostOwner = !!currentUserId && post.user?.id === currentUserId;
  const sortedComments = [...(post.comments || [])].sort((a: any, b: any) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  const totalComments = sortedComments.reduce((acc: number, c: any) => acc + 1 + (c.replies?.length || 0), 0);
  const when = (d: string, withYear = false) =>
    new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', ...(withYear ? { year: 'numeric' } : {}), hour: '2-digit', minute: '2-digit' });
  const act = 'inline-flex items-center gap-1 text-[12px] font-semibold text-ink-faint transition-colors';

  // One renderer for a comment and for a reply to it (parentId is set for replies)
  const renderComment = (c: any, parentId?: string) => {
    const isReply = !!parentId;
    const owner = !!currentUserId && c.user?.id === currentUserId;
    const editing = editingCommentId === c.id;
    const like = commentLikes[c.id] ?? { liked: false, count: c.likeCount ?? 0 };
    return (
      <div key={c.id} className="flex gap-2.5">
        <Avatar user={c.user} px={isReply ? 28 : 36} />
        <div className="min-w-0 flex-1">
          <div className={`rounded-xl px-3.5 py-2.5 ${c.isPinned ? 'border border-gold-200 bg-gold-50' : 'bg-paper'}`}>
            <p className="flex flex-wrap items-center gap-x-2 text-[13px]">
              <span className="font-semibold text-ink">{c.user?.fullName || c.user?.username}</span>
              {c.isPinned && <span className="inline-flex items-center gap-0.5 text-[12px] font-semibold text-gold-700"><i className="ri-pushpin-fill" aria-hidden="true" />Đã ghim</span>}
              <span className="text-[12px] text-ink-faint">{when(c.createdAt)}</span>
            </p>
            {editing ? (
              <div className="mt-1.5">
                <textarea value={editingContent} onChange={e => setEditingContent(e.target.value)} rows={2} className="field resize-none" />
                <div className="mt-1.5 flex gap-2">
                  <button onClick={() => handleUpdateComment(c.id, parentId)} className="btn-forest !px-3 !py-1.5 text-[13px]">Lưu</button>
                  <button onClick={() => setEditingCommentId(null)} className="btn-ghost !px-3 !py-1.5 text-[13px]">Hủy</button>
                </div>
              </div>
            ) : (
              <p className="mt-1 whitespace-pre-line text-[14px] leading-relaxed text-ink-soft">{c.content}</p>
            )}
          </div>

          {!editing && (
            <div className="ml-1 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
              <button onClick={() => handleCommentLike(c.id)} className={`${act} ${like.liked ? '!text-brand-600' : 'hover:text-brand-600'}`}>
                <i className={like.liked ? 'ri-heart-fill' : 'ri-heart-line'} aria-hidden="true" />
                Thích{like.count > 0 && ` (${like.count})`}
              </button>
              {!isReply && (
                <button
                  onClick={() => {
                    if (replyingTo?.id === c.id) { setReplyingTo(null); setReplyText(''); }
                    else { setReplyingTo({ id: c.id, name: c.user?.fullName || c.user?.username || 'người dùng' }); setReplyText(''); }
                  }}
                  className={`${act} hover:text-forest-700`}>
                  <i className="ri-reply-line" aria-hidden="true" />Trả lời
                </button>
              )}
              {owner && <button onClick={() => { setEditingCommentId(c.id); setEditingContent(c.content); }} className={`${act} hover:text-forest-700`}><i className="ri-edit-line" aria-hidden="true" />Sửa</button>}
              {(owner || isPostOwner) && <button onClick={() => handleDeleteComment(c.id, parentId)} className={`${act} hover:text-brand-600`}><i className="ri-delete-bin-line" aria-hidden="true" />Xóa</button>}
              {!isReply && isPostOwner && (
                <button onClick={() => handlePinComment(c.id)} className={`${act} hover:text-gold-700`}>
                  <i className={c.isPinned ? 'ri-pushpin-fill' : 'ri-pushpin-line'} aria-hidden="true" />{c.isPinned ? 'Bỏ ghim' : 'Ghim'}
                </button>
              )}
            </div>
          )}

          {!isReply && replyingTo?.id === c.id && (
            <form onSubmit={handleReply} className="mt-2">
              <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder={`Trả lời ${replyingTo?.name}...`} rows={2} autoFocus className="field resize-none" />
              <div className="mt-1.5 flex gap-2">
                <button type="submit" disabled={replySubmitting || !replyText.trim()} className="btn-forest !px-3 !py-1.5 text-[13px] disabled:opacity-50">{replySubmitting ? 'Đang gửi...' : 'Gửi'}</button>
                <button type="button" onClick={() => { setReplyingTo(null); setReplyText(''); }} className="btn-ghost !px-3 !py-1.5 text-[13px]">Hủy</button>
              </div>
            </form>
          )}

          {!isReply && c.replies?.length > 0 && (
            <div className="mt-2 space-y-3 border-l-2 border-line pl-3">{c.replies.map((r: any) => renderComment(r, c.id))}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-paper pb-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <nav className="flex items-center gap-1 py-3 text-[13px] text-ink-faint" aria-label="Đường dẫn">
          <Link href="/" className="hover:text-ink">Trang chủ</Link>
          <i className="ri-arrow-right-s-line" aria-hidden="true" />
          <Link href="/forum" className="hover:text-ink">Diễn đàn</Link>
          <i className="ri-arrow-right-s-line" aria-hidden="true" />
          <span className="truncate text-ink-soft">{post.title}</span>
        </nav>

        <article className="card p-4 sm:p-6">
          <p className="flex items-center gap-2 text-[13px] font-semibold">
            {post.category && <Link href={`/forum?category=${post.category}`} className="text-forest-700 hover:underline">{forumCategoryLabel(post.category)}</Link>}
          </p>
          <h1 className="mt-1 break-words text-[1.5rem] font-bold leading-snug text-ink sm:text-3xl">{post.title}</h1>

          <div className="mt-3 flex items-center gap-3">
            {post.isAnonymous
              ? <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-paper text-ink-faint"><i className="ri-user-line" aria-hidden="true" /></div>
              : <Avatar user={post.user} px={40} />}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{post.isAnonymous ? 'Ẩn danh' : (post.user?.fullName || post.user?.username)}</p>
              <p className="text-[12px] text-ink-faint">{when(post.createdAt, true)} · {post.viewCount} lượt xem</p>
            </div>
            {isPostOwner && <Link href={`/forum/${postId}/edit`} className="btn-ghost shrink-0"><i className="ri-edit-line" aria-hidden="true" /> Sửa</Link>}
          </div>

          {post.images?.length > 0 && (
            <div className={`mt-4 grid gap-2 ${post.images.length > 1 ? 'grid-cols-2' : ''}`}>
              {post.images.map((img: any, i: number) => (
                <img key={i} src={img.url || img} alt="" className="max-h-96 w-full rounded-lg bg-paper object-contain" />
              ))}
            </div>
          )}

          <div className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">{post.content}</div>

          {post.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {post.tags.map((tag: string, i: number) => <span key={i} className="rounded bg-paper px-2 py-0.5 text-[12px] text-ink-soft">#{tag}</span>)}
            </div>
          )}

          <div className="mt-5 flex items-center gap-5 border-t border-line pt-4 text-sm">
            <button onClick={handleLike} className={`inline-flex items-center gap-1.5 font-semibold transition-colors ${liked ? 'text-brand-600' : 'text-ink-soft hover:text-brand-600'}`}>
              <i className={liked ? 'ri-heart-fill' : 'ri-heart-line'} aria-hidden="true" />{post.likeCount} thích
            </button>
            <span className="inline-flex items-center gap-1.5 text-ink-soft"><i className="ri-chat-1-line" aria-hidden="true" />{totalComments} bình luận</span>
          </div>
        </article>

        <section className="card mt-4 p-4 sm:p-6" aria-label="Bình luận">
          <h2 className="text-lg font-bold text-ink">Bình luận ({totalComments})</h2>

          <form onSubmit={handleComment} className="mt-3">
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Viết bình luận của bạn..." rows={3} aria-label="Bình luận" className="field resize-none" />
            <button type="submit" disabled={submitting || !comment.trim()} className="btn-forest mt-2 disabled:opacity-50">{submitting ? 'Đang gửi...' : 'Gửi bình luận'}</button>
          </form>

          <div className="mt-6 space-y-5">
            {sortedComments.map((c: any) => renderComment(c))}
            {sortedComments.length === 0 && <p className="py-4 text-center text-sm text-ink-faint">Chưa có bình luận nào. Hãy là người đầu tiên.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
