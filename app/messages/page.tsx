'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, messages as messagesApi } from '../../lib/api';

type FilterTab = 'all' | 'unread';

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
      .then((data: any) => {
        const list: any[] = Array.isArray(data) ? data : [];
        // A conversation the user already opened keeps unread at 0 until a newer message arrives
        try {
          const readMap: Record<string, string> = JSON.parse(localStorage.getItem('readConversations') || '{}');
          setConversations(list.map(c => {
            const readAt = readMap[c.id];
            if (!readAt) return c;
            const lastMsgTime = c.messages?.[0]?.createdAt;
            if (!lastMsgTime || new Date(lastMsgTime) <= new Date(readAt)) return { ...c, unreadCount: 0 };
            return c;
          }));
        } catch {
          setConversations(list);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = conversations.filter(c => {
    if (filter === 'unread' && !c.unreadCount) return false;
    const other = c.otherUser;
    const name = other?.fullName || other?.username || '';
    if (search && !name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function open(conv: any) {
    try {
      const readMap: Record<string, string> = JSON.parse(localStorage.getItem('readConversations') || '{}');
      readMap[conv.id] = new Date().toISOString();
      localStorage.setItem('readConversations', JSON.stringify(readMap));
    } catch {}

    if (conv.unreadCount > 0) {
      setConversations(prev => prev.map(c => (c.id === conv.id ? { ...c, unreadCount: 0 } : c)));
      // Tell the header to lower its badge
      window.dispatchEvent(new CustomEvent('conversation-read', { detail: { unreadCount: conv.unreadCount } }));
    }
    router.push(`/messages/${conv.id}`);
  }

  return (
    <div className="min-h-screen bg-paper pb-10">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <h1 className="py-4 text-xl font-bold text-ink sm:text-2xl">Tin nhắn</h1>

        <div className="card overflow-hidden">
          <div className="space-y-3 border-b border-line p-3 sm:p-4">
            <div className="relative">
              <i className="ri-search-line pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên" aria-label="Tìm cuộc trò chuyện" className="field !pl-9" />
            </div>
            <div className="flex gap-2" role="tablist" aria-label="Lọc tin nhắn">
              {([['all', 'Tất cả'], ['unread', 'Chưa đọc']] as [FilterTab, string][]).map(([key, label]) => (
                <button key={key} role="tab" aria-selected={filter === key} onClick={() => setFilter(key)} className={`chip ${filter === key ? 'chip-active' : ''}`}>{label}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <ul className="divide-y divide-line">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="flex animate-pulse items-center gap-3 px-4 py-3.5">
                  <div className="h-11 w-11 rounded-full bg-paper" />
                  <div className="flex-1 space-y-2"><div className="h-3 w-1/3 rounded bg-paper" /><div className="h-3 w-2/3 rounded bg-paper" /></div>
                </li>
              ))}
            </ul>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <i className="ri-chat-3-line text-4xl text-ink-faint" aria-hidden="true" />
              <p className="mt-2 font-semibold text-ink">{filter === 'unread' || search ? 'Không có cuộc trò chuyện phù hợp' : 'Chưa có tin nhắn nào'}</p>
              {!search && filter === 'all' && <p className="mt-1 text-sm text-ink-soft">Hãy nhắn tin cho người bán từ trang chi tiết của tin.</p>}
              {!search && filter === 'all' && <Link href="/products" className="btn-forest mt-4">Xem tin đang bán</Link>}
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {filtered.map((conv: any) => {
                const other = conv.otherUser;
                const name = other?.fullName || other?.username || 'Người dùng';
                const lastMsg = conv.messages?.[0];
                const lastText = lastMsg?.type === 'IMAGE' ? 'Đã gửi một ảnh' : (lastMsg?.content || 'Bắt đầu trò chuyện');
                const unread = conv.unreadCount > 0;
                return (
                  <li key={conv.id}>
                    <button onClick={() => open(conv)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-paper">
                      {other?.avatarUrl ? (
                        <img src={other.avatarUrl} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
                      ) : (
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-forest-100 font-bold text-forest-800">{name.trim().split(' ').pop()![0].toUpperCase()}</div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className={`truncate text-[15px] ${unread ? 'font-bold text-ink' : 'font-medium text-ink'}`}>{name}</span>
                          {lastMsg && <span className="shrink-0 text-[12px] text-ink-faint">{timeAgo(lastMsg.createdAt)}</span>}
                        </div>
                        <div className="mt-0.5 flex items-center justify-between gap-2">
                          <span className={`truncate text-sm ${unread ? 'font-medium text-ink' : 'text-ink-soft'}`}>{lastText}</span>
                          {unread && <span className="shrink-0 rounded-full bg-brand-500 px-1.5 text-[11px] font-bold text-white" aria-label={`${conv.unreadCount} tin chưa đọc`}>{conv.unreadCount}</span>}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
