'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, messages as messagesApi } from '../../lib/api';

type FilterTab = 'all' | 'unread' | 'spam';

const COLORS = ['bg-yellow-400', 'bg-blue-400', 'bg-green-400', 'bg-pink-400', 'bg-purple-400'];

function getInitials(name: string) {
  const parts = (name || 'U').trim().split(' ');
  return parts[parts.length - 1][0].toUpperCase();
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Vừa xong';
  if (m < 60) return `${m} phút`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ`;
  return `${Math.floor(h / 24)} ngày`;
}

export default function MessagesPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.push('/profile'); return; }
    messagesApi.getConversations()
      .then((data: any) => setConversations(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = conversations.filter(c => {
    if (filter === 'unread' && !c.unreadCount) return false;
    if (filter === 'spam') return false;
    const other = c.otherUser;
    const name = other?.fullName || other?.username || '';
    if (search && !name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex h-[calc(100vh-56px)] bg-white">

      {/* LEFT: contact list */}
      <div className="w-full sm:w-80 lg:w-96 flex-shrink-0 border-r border-gray-200 flex flex-col">

        {/* Header */}
        <div className="px-4 pt-4 pb-2 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-3">Tin nhắn</h2>
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
            <i className="ri-search-line text-gray-400 text-sm flex-shrink-0"></i>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm..."
              className="flex-1 text-sm bg-transparent focus:outline-none text-gray-800 placeholder-gray-400"
            />
          </div>
          <div className="flex gap-1 mt-3">
            {([['all', 'Tất cả'], ['unread', 'Chưa đọc'], ['spam', 'Tin rác']] as [FilterTab, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setFilter(key as FilterTab)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition ${filter === key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filter === 'spam' ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
              <i className="ri-spam-2-line text-4xl mb-2"></i>
              <p className="text-sm">Không có tin rác</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
              <i className="ri-chat-3-line text-4xl mb-2"></i>
              <p className="text-sm">Chưa có tin nhắn nào</p>
              <p className="text-xs mt-1 text-center px-4">Nhắn tin với người bán từ trang sản phẩm</p>
            </div>
          ) : (
            filtered.map((conv: any, i: number) => {
              const other = conv.otherUser;
              const name = other?.fullName || other?.username || 'Người dùng';
              const lastMsg = conv.messages?.[0];
              const lastText = lastMsg?.type === 'IMAGE' ? '🖼 Đã gửi ảnh' : (lastMsg?.content || 'Bắt đầu trò chuyện');
              return (
                <button key={conv.id} onClick={() => router.push(`/messages/${conv.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition text-left border-b border-gray-50">
                  <div className="relative flex-shrink-0">
                    {other?.avatarUrl ? (
                      <img src={other.avatarUrl} alt="" className="w-11 h-11 rounded-full object-cover" />
                    ) : (
                      <div className={`w-11 h-11 rounded-full ${COLORS[i % COLORS.length]} flex items-center justify-center text-white font-bold text-base`}>
                        {getInitials(name)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm truncate ${conv.unreadCount ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{name}</span>
                      {lastMsg && <span className="text-xs text-gray-400 flex-shrink-0 ml-1">{timeAgo(lastMsg.createdAt)}</span>}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className={`text-xs truncate ${conv.unreadCount ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>{lastText}</span>
                      {conv.unreadCount > 0 && (
                        <span className="ml-1 flex-shrink-0 w-5 h-5 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full flex items-center justify-center">{conv.unreadCount}</span>
                      )}
                    </div>
                  </div>
                  <i className="ri-arrow-right-s-line text-gray-300 flex-shrink-0 text-lg"></i>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT: empty state — desktop only */}
      <div className="hidden sm:flex flex-1 flex-col items-center justify-center gap-4 text-center px-8 bg-gray-50">
        <div className="w-28 h-28 bg-yellow-50 rounded-full flex items-center justify-center">
          <i className="ri-message-3-line text-yellow-400 text-5xl"></i>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-800">Tích cực chat, chốc lát chốt đơn!</p>
          <p className="text-sm text-gray-400 mt-1">Chọn một cuộc trò chuyện để bắt đầu nhắn tin</p>
        </div>
      </div>
    </div>
  );
}
