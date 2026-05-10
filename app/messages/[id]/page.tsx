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
      ]);
      if (msgData.status === 'fulfilled') setMsgs((msgData.value as any).data || []);
      if (convData.status === 'fulfilled') {
        const convs = convData.value as any[];
        const conv = convs.find((c: any) => c.id === conversationId);
        if (conv?.otherUser) setOtherUser(conv.otherUser);
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
        reconnectionAttempts: 3,
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
    if (socketRef.current?.connected) {
      socketRef.current.emit('send_message', { conversationId, content: t, type: 'TEXT' });
    } else {
      // fallback: reload messages after short delay
      setTimeout(loadData, 500);
    }
  }

  async function handleImageSend(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const { url } = await uploads.uploadImage(file);
      socketRef.current?.emit('send_message', { conversationId, content: '', type: 'IMAGE', fileUrl: url });
    } catch { alert('Upload ảnh thất bại'); }
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/messages" className="w-9 h-9 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50">
            <i className="ri-arrow-left-line"></i>
          </Link>
          {otherUser?.avatarUrl ? (
            <img src={otherUser.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">
              {otherUser?.fullName?.[0] || otherUser?.username?.[0] || 'U'}
            </div>
          )}
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-sm">{otherUser?.fullName || otherUser?.username || 'Người dùng'}</p>
            {typing && <p className="text-xs text-green-600 animate-pulse">Đang nhập...</p>}
            {!socketReady && <p className="text-xs text-gray-400">Đang kết nối...</p>}
          </div>
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)}
              className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg">
              <i className="ri-more-2-line text-xl"></i>
            </button>
            {showMenu && (
              <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border w-44 z-10 overflow-hidden">
                {otherUser?.id && (
                  <Link href={`/profile/${otherUser.id}`}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                    <i className="ri-user-line"></i> Xem trang cá nhân
                  </Link>
                )}
                <button onClick={handleBlock}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50">
                  <i className="ri-forbid-line"></i> Chặn người dùng
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-2xl mx-auto w-full" onClick={() => setShowMenu(false)}>
        <div className="space-y-3">
          {msgs.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-10">Bắt đầu cuộc trò chuyện nào!</p>
          )}
          {msgs.map((msg: any) => {
            const isMe = msg.senderId === myId || msg.sender?.id === myId;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-2`}>
                {!isMe && (
                  <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center text-green-700 text-xs font-bold flex-shrink-0 mt-1">
                    {otherUser?.fullName?.[0] || 'U'}
                  </div>
                )}
                <div className={`max-w-[70%] flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}>
                  {msg.type === 'IMAGE' && msg.fileUrl ? (
                    <img src={msg.fileUrl} alt="ảnh" onClick={() => window.open(msg.fileUrl, '_blank')}
                      className={`rounded-2xl max-w-full max-h-60 object-cover cursor-pointer ${isMe ? 'rounded-br-sm' : 'rounded-bl-sm'}`} />
                  ) : (
                    <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe
                      ? 'bg-green-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-900 rounded-bl-sm shadow-sm border border-gray-100'}`}>
                      {msg.content}
                    </div>
                  )}
                  <span className="text-xs text-gray-400 px-1">
                    {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    {isMe && msg.isRead && <span className="ml-1 text-green-500">✓✓</span>}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t flex-shrink-0">
        <div className="max-w-2xl mx-auto px-4 py-3">
          {blocked ? (
            <p className="text-center text-gray-400 text-sm py-2">Bạn đã chặn người dùng này</p>
          ) : (
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSend} className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingImg}
                className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors disabled:opacity-50">
                {uploadingImg
                  ? <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  : <i className="ri-image-line text-xl"></i>}
              </button>
              <input value={text} onChange={handleTextChange}
                placeholder="Nhập tin nhắn..."
                className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors" />
              <button type="submit" disabled={!text.trim()}
                className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 disabled:opacity-40 transition-colors">
                <i className="ri-send-plane-fill"></i>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
