'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, messages } from '../../lib/api';

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.push('/profile'); return; }
    messages.getConversations()
      .then((data: any) => setConversations(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleArchive(e: React.MouseEvent, convId: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Lưu trữ cuộc trò chuyện này?')) return;
    try {
      await messages.archive(convId);
      setConversations(prev => prev.filter(c => c.id !== convId));
    } catch { alert('Thất bại'); }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/dashboard" className="w-9 h-9 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50">
            <i className="ri-arrow-left-line"></i>
          </Link>
          <h1 className="font-bold text-gray-900 text-lg flex-1">Tin nhắn</h1>
          <span className="text-sm text-gray-500">{conversations.length} cuộc trò chuyện</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-3 py-3 md:px-4 md:py-4">
        {conversations.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <i className="ri-chat-3-line text-5xl mb-3 block"></i>
            <p>Chưa có cuộc trò chuyện nào</p>
            <p className="text-sm mt-1">Nhắn tin với người bán từ trang sản phẩm</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
            {conversations.map((conv: any) => {
              const other = conv.otherUser;
              const lastMsg = conv.messages?.[0];
              return (
                <Link key={conv.id} href={`/messages/${conv.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group">
                  {other?.avatarUrl ? (
                    <img src={other.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 text-green-700 font-bold text-lg">
                      {other?.fullName?.[0] || other?.username?.[0] || 'U'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate">{other?.fullName || other?.username || 'Người dùng'}</p>
                      {lastMsg && (
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {new Date(lastMsg.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {lastMsg ? (lastMsg.type === 'IMAGE' ? '🖼 Đã gửi ảnh' : lastMsg.content) : 'Bắt đầu cuộc trò chuyện'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleArchive(e, conv.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-orange-500 transition-all"
                    title="Lưu trữ">
                    <i className="ri-archive-line text-lg"></i>
                  </button>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
