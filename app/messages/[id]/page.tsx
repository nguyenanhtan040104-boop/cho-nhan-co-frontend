'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, messages, uploads } from '../../../lib/api';

const WS_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace('/api', '');

function getCurrentUserId(): string | null {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.id || null;
  } catch { return null; }
}

export default function ChatPage() {
  const params = useParams();
  const conversationId = Array.isArray(params.id) ? params.id[0] : params.id as string;
  const router = useRouter();
  const [msgs, setMsgs] = useState<any[]>([]);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [myId, setMyId] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [socketReady, setSocketReady] = useState(false);
  const socketRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const msgsRef = useRef<any[]>([]);

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.push('/profile'); return; }
    const uid = getCurrentUserId();
    setMyId(uid);

    // Lưu timestamp đọc vào localStorage để trang danh sách biết đã xem
    try {
      const readMap: Record<string, string> = JSON.parse(localStorage.getItem('readConversations') || '{}');
      readMap[conversationId] = new Date().toISOString();
      localStorage.setItem('readConversations', JSON.stringify(readMap));
    } catch {}

    loadData();
    initSocket(uid);
    return () => {
      socketRef.current?.disconnect();
    };
  }, [conversationId]);

  useEffect(() => {
    msgsRef.current = msgs;
  }, [msgs]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  async function loadData() {
    try {
      const [msgData, convData] = await Promise.allSettled([
        messages.getMessages(conversationId),
        messages.getConversations(),
        // Đánh dấu đã đọc ngay qua REST — không chờ WebSocket
        messages.markRead(conversationId),
      ]);
      if (msgData.status === 'fulfilled') setMsgs((msgData.value as any).data || []);
      if (convData.status === 'fulfilled') {
        const convs = convData.value as any[];
        const conv = convs.find((c: any) => c.id === conversationId);
        if (conv?.otherUser) setOtherUser(conv.otherUser);
        // Cập nhật badge header ngay khi biết unreadCount
        const unread = conv?.unreadCount || 0;
        if (unread > 0) {
          window.dispatchEvent(new CustomEvent('conversation-read', {
            detail: { unreadCount: unread }
          }));
        }
      }
    } catch (e) {
      console.error('loadData error:', e);
    } finally {
      setLoading(false);
    }
  }

  async function initSocket(uid: string | null) {
    try {
      const { io } = await import('socket.io-client');
      const token = localStorage.getItem('accessToken');
      const socket = io(`${WS_URL}/messaging`, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 10000,
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        setSocketReady(true);
        socket.emit('join_conversation', { conversationId });
        socket.emit('mark_read', { conversationId });
      });

      socket.on('connect_error', (err) => {
        console.warn('Socket connect error:', err.message);
      });

      socket.on('new_message', (msg: any) => {
        setMsgs(prev => {
          if (prev.find(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        if (msg.senderId !== uid) {
          socket.emit('mark_read', { conversationId });
        }
      });

      socket.on('user_typing', () => setTyping(true));
      socket.on('user_stop_typing', () => setTyping(false));
    } catch (e) {
      console.error('Socket init failed:', e);
    }
  }

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    setText(e.target.value);
    socketRef.current?.emit('typing_start', { conversationId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('typing_stop', { conversationId });
    }, 1500);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setText('');
    socketRef.current?.emit('typing_stop', { conversationId });

    // Nếu socket đang kết nối — đợi tối đa 3 giây
    if (socketRef.current && !socketRef.current.connected) {
      await new Promise<void>(resolve => {
        const timeout = setTimeout(resolve, 3000);
        socketRef.current?.once('connect', () => { clearTimeout(timeout); resolve(); });
      });
    }

    if (socketRef.current?.connected) {
      socketRef.current.emit('send_message', { conversationId, content: t, type: 'TEXT' });
    } else {
      // REST fallback khi WebSocket không kết nối được
      try {
        const msg = await messages.sendMessage(conversationId, t, 'TEXT');
        setMsgs(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
      } catch (err: any) {
        alert(err?.message || 'Gửi thất bại, vui lòng thử lại');
        setText(t);
      }
    }
  }

  async function handleImageSend(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const { url } = await uploads.uploadImage(file);
      if (socketRef.current?.connected) {
        socketRef.current.emit('send_message', { conversationId, content: '', type: 'IMAGE', fileUrl: url });
      } else {
        const msg = await messages.sendMessage(conversationId, '', 'IMAGE', url);
        setMsgs(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
      }
    } catch { alert('Gửi ảnh thất bại'); }
    finally {
      setUploadingImg(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleBlock() {
    if (!otherUser?.id) return;
    if (!confirm(`Chặn ${otherUser.fullName || otherUser.username}?`)) return;
    try {
      await messages.blockUser(otherUser.id);
      setBlocked(true);
      setShowMenu(false);
    } catch { alert('Thất bại'); }
  }

  if (loading) {
    return <div className="grid min-h-[60vh] place-items-center"><div className="h-9 w-9 animate-spin rounded-full border-[3px] border-forest-600 border-t-transparent" /></div>;
  }

  const otherName = otherUser?.fullName || otherUser?.username || 'Người dùng';

  // A focused view: full screen on phones (covers the tab bar so the input is never hidden),
  // a bordered panel on larger screens.
  return (
    <div className="fixed inset-0 z-[55] flex flex-col bg-paper md:static md:z-auto md:mx-auto md:my-4 md:h-[calc(100dvh-9rem)] md:max-w-3xl md:overflow-hidden md:rounded-card md:border md:border-line">
      <div className="shrink-0 border-b border-line bg-surface">
        <div className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
          <Link href="/messages" aria-label="Quay lại danh sách" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line hover:border-forest-500">
            <i className="ri-arrow-left-line" />
          </Link>
          {otherUser?.avatarUrl ? (
            <img src={otherUser.avatarUrl} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest-100 font-bold text-forest-800">{otherName[0]?.toUpperCase()}</div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{otherName}</p>
            <p className="text-[12px] text-ink-faint">
              {typing ? 'Đang nhập...' : socketReady ? 'Đang trực tuyến' : 'Đang kết nối...'}
            </p>
          </div>
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} aria-label="Tùy chọn" aria-expanded={showMenu} className="grid h-9 w-9 place-items-center rounded-lg text-ink-soft hover:bg-paper">
              <i className="ri-more-2-line text-xl" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-10 z-10 w-48 rounded-card border border-line bg-surface py-1">
                {otherUser?.id && <Link href={`/profile/${otherUser.id}`} className="block px-4 py-2.5 text-sm text-ink hover:bg-paper">Xem trang cá nhân</Link>}
                <button onClick={handleBlock} className="block w-full px-4 py-2.5 text-left text-sm text-brand-600 hover:bg-brand-50">Chặn người dùng</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-4" onClick={() => setShowMenu(false)}>
        <div className="space-y-2.5">
          {msgs.length === 0 && <p className="py-10 text-center text-sm text-ink-faint">Hãy gửi lời chào đầu tiên.</p>}
          {msgs.map((msg: any) => {
            const isMe = msg.senderId === myId || msg.sender?.id === myId;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[78%] flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}>
                  {msg.type === 'IMAGE' && msg.fileUrl ? (
                    <img src={msg.fileUrl} alt="Ảnh đã gửi" onClick={() => window.open(msg.fileUrl, '_blank')} className="max-h-60 max-w-full cursor-pointer rounded-card object-cover" />
                  ) : (
                    <div className={`whitespace-pre-wrap break-words rounded-card px-3.5 py-2 text-[15px] ${isMe ? 'bg-forest-600 text-white' : 'border border-line bg-surface text-ink'}`}>{msg.content}</div>
                  )}
                  <span className="px-1 text-[11px] text-ink-faint">
                    {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    {isMe && msg.isRead && ' · Đã xem'}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="safe-bottom shrink-0 border-t border-line bg-surface">
        <div className="px-3 py-2.5 sm:px-4">
          {blocked ? (
            <p className="py-2 text-center text-sm text-ink-faint">Bạn đã chặn người dùng này</p>
          ) : (
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSend} className="sr-only" tabIndex={-1} />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingImg} aria-label="Gửi ảnh"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-ink-soft hover:bg-paper disabled:opacity-50">
                {uploadingImg ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-forest-600 border-t-transparent" /> : <i className="ri-image-line text-xl" />}
              </button>
              <input value={text} onChange={handleTextChange} placeholder="Nhập tin nhắn..." aria-label="Tin nhắn" className="field min-w-0 flex-1" />
              <button type="submit" disabled={!text.trim()} className="btn-forest shrink-0 disabled:opacity-40">Gửi</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
