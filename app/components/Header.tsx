'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '../../lib/api';
import Logo from './Logo';
import { CATEGORIES, POST_ITEMS, isActivePath } from './nav-data';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://cho-nhan-co-backend.onrender.com/api';
const WS_URL = API.replace('/api', '');

// Quy tắc: cụ thể nhất trước, chung nhất sau (thứ tự quan trọng)
const SEARCH_ROUTES: { keywords: string[]; route: string }[] = [
  // Bất động sản - sub
  { keywords: ['phòng trọ', 'phong tro', 'cho thuê phòng', 'nhà trọ', 'nha tro'], route: '/real-estate?type=PHONG_TRO' },
  { keywords: ['đất nền', 'dat nen', 'mua đất', 'bán đất', 'lô đất'], route: '/real-estate?type=DAT_NEN' },
  { keywords: ['mặt bằng', 'mat bang', 'thuê mặt bằng', 'mặt bằng kinh doanh'], route: '/real-estate?type=MAT_BANG' },
  { keywords: ['nhà ở', 'nha o', 'mua nhà', 'bán nhà', 'nhà đất', 'nha dat', 'căn hộ', 'can ho'], route: '/real-estate?type=NHA_O' },
  { keywords: ['bất động sản', 'bat dong san', 'bds'], route: '/real-estate' },
  // Việc làm - sub
  { keywords: ['tuyển dụng', 'tuyen dung', 'tuyển nhân viên', 'đăng tuyển', 'cần tuyển'], route: '/jobs?type=EMPLOYER' },
  { keywords: ['tìm việc', 'tim viec', 'xin việc', 'xin viec', 'cần việc', 'nhân công', 'nhan cong'], route: '/jobs?type=JOB_SEEKER' },
  { keywords: ['việc làm', 'viec lam', 'tuyển', 'lương', 'luong'], route: '/jobs' },
  // Dịch vụ - sub
  { keywords: ['sửa chữa', 'sua chua', 'bảo dưỡng', 'bao duong', 'sửa máy', 'sửa xe'], route: '/dich-vu?sub=s%E1%BB%ADa%20ch%E1%BB%AFa' },
  { keywords: ['vận chuyển', 'van chuyen', 'ship', 'giao hàng', 'giao hang', 'chuyển nhà', 'vận tải'], route: '/dich-vu?sub=v%E1%BA%ADn%20chuy%E1%BB%83n' },
  { keywords: ['tư vấn', 'tu van', 'tư vấn nông nghiệp', 'tư vấn kỹ thuật'], route: '/dich-vu?sub=t%C6%B0%20v%E1%BA%A5n' },
  { keywords: ['xây dựng', 'xay dung', 'thi công', 'thi cong', 'xây nhà', 'sửa nhà'], route: '/dich-vu?sub=x%C3%A2y%20d%E1%BB%B1ng' },
  { keywords: ['dịch vụ', 'dich vu'], route: '/dich-vu' },
  // Vật nuôi - sub
  { keywords: ['chó', 'cún', 'chó cảnh', 'mua chó', 'bán chó'], route: '/vat-nuoi?sub=ch%C3%B3' },
  { keywords: ['mèo', 'mèo cảnh', 'mua mèo', 'bán mèo'], route: '/vat-nuoi?sub=m%C3%A8o' },
  { keywords: ['gà', 'gia cầm', 'gia cam', 'vịt', 'ngan', 'ngỗng', 'chim'], route: '/vat-nuoi?sub=gia%20c%E1%BA%A7m' },
  { keywords: ['heo', 'bò', 'trâu', 'dê', 'cừu', 'ngựa', 'gia súc', 'gia suc'], route: '/vat-nuoi?sub=gia%20s%C3%BAc' },
  { keywords: ['vật nuôi', 'vat nuoi', 'thú cưng', 'thu cung', 'thỏ'], route: '/vat-nuoi' },
  // Diễn đàn - sub
  { keywords: ['kinh nghiệm trồng', 'chia sẻ kinh nghiệm'], route: '/forum?category=KINH_NGHIEM' },
  { keywords: ['hỏi đáp', 'hoi dap', 'thắc mắc'], route: '/forum?category=HOI_DAP' },
  { keywords: ['giá thị trường', 'tin tức thị trường'], route: '/forum?category=THI_TRUONG' },
  { keywords: ['chăn nuôi', 'chan nuoi', 'kỹ thuật chăn'], route: '/forum?category=CHAN_NUOI' },
  { keywords: ['diễn đàn', 'dien dan', 'forum'], route: '/forum' },
  // Cảnh báo - sub
  { keywords: ['lừa đảo mua bán', 'lua dao mua ban'], route: '/canh-bao?sub=L%E1%BB%ABa%20%C4%91%E1%BA%A3o%20mua%20b%C3%A1n' },
  { keywords: ['giả mạo danh tính', 'gia mao', 'giả danh', 'mạo danh'], route: '/canh-bao?sub=Gi%E1%BA%A3%20m%E1%BA%A1o%20danh%20t%C3%ADnh' },
  { keywords: ['lừa đảo đặt cọc', 'lua dao dat coc', 'lừa cọc', 'tiền cọc'], route: '/canh-bao?sub=L%E1%BB%ABa%20%C4%91%E1%BA%A3o%20%C4%91%E1%BA%B7t%20c%E1%BB%8Dc' },
  { keywords: ['cảnh báo', 'canh bao', 'lừa đảo', 'lua dao', 'tố cáo', 'hàng giả'], route: '/canh-bao' },
  // Quảng cáo - sub
  { keywords: ['khai trương', 'khai truong'], route: '/advertisements?category=KHAI_TRUONG' },
  { keywords: ['khuyến mãi', 'khuyen mai', 'giảm giá', 'giam gia', 'sale', 'ưu đãi'], route: '/advertisements?category=KHUYEN_MAI' },
  { keywords: ['sự kiện', 'su kien', 'hội chợ', 'hoi cho', 'triển lãm'], route: '/advertisements?category=SU_KIEN' },
  { keywords: ['quảng cáo', 'quang cao'], route: '/advertisements' },
  // Nông sản
  { keywords: ['nông sản', 'nong san', 'thực phẩm', 'thuc pham', 'rau củ', 'rau cu', 'trái cây', 'trai cay', 'lúa', 'gạo', 'cà phê', 'ca phe', 'tiêu', 'điều', 'sầu riêng'], route: '/products?category=NONG_SAN' },
];

function smartSearch(q: string): string {
  const lower = q.toLowerCase().trim().normalize('NFC');
  for (const { keywords, route } of SEARCH_ROUTES) {
    if (keywords.some(k => lower.includes(k.toLowerCase().normalize('NFC')))) {
      const sep = route.includes('?') ? '&' : '?';
      return route + sep + `search=${encodeURIComponent(q)}`;
    }
  }
  return `/products?search=${encodeURIComponent(q)}`;
}

function timeAgoHeader(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

const iconBtn = 'relative grid h-10 w-10 place-items-center rounded-full text-ink-soft transition hover:bg-forest-50 hover:text-forest-700';
const dropdown = 'absolute right-0 top-12 z-50 overflow-hidden rounded-2xl border border-line bg-surface shadow-lift';

export default function Header() {
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showSavedDropdown, setShowSavedDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [notifTab, setNotifTab] = useState<'activity' | 'news'>('activity');
  const [savedProducts, setSavedProducts] = useState<any[]>([]);
  const [msgToast, setMsgToast] = useState<{ title: string; body: string; conversationId: string } | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const postMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const savedRef = useRef<HTMLDivElement>(null);
  const isOnMessagesRef = useRef(false);
  // Sau khi user vào /messages, ẩn badge cho đến khi có tin mới
  const msgSuppressRef = useRef(false);

  function navDashboard(tab: string) {
    if (pathname === '/dashboard') {
      // Đang ở dashboard: dispatch event để switch tab ngay + replace URL
      window.dispatchEvent(new CustomEvent('dashboard-switch-tab', { detail: tab }));
      router.replace(`/dashboard?tab=${tab}`);
    } else {
      router.push(`/dashboard?tab=${tab}`);
    }
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (postMenuRef.current && !postMenuRef.current.contains(e.target as Node)) setShowPostMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifDropdown(false);
      if (savedRef.current && !savedRef.current.contains(e.target as Node)) setShowSavedDropdown(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Khởi tạo suppress từ localStorage khi reload trang
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('msgSuppressed') === '1') {
      msgSuppressRef.current = true;
    }
  }, []);

  useEffect(() => {
    setShowPostMenu(false);
    setShowNotifDropdown(false);
    setShowSavedDropdown(false);
    if (pathname === '/dashboard') setUnreadCount(0);
    if (pathname.startsWith('/messages')) {
      setUnreadMessages(0);
      msgSuppressRef.current = true;
      if (typeof window !== 'undefined') localStorage.setItem('msgSuppressed', '1');
    }
    isOnMessagesRef.current = pathname.startsWith('/messages');
  }, [pathname]);

  // Tell the phone tab bar how many unread messages there are
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('unread-messages', { detail: unreadMessages }));
  }, [unreadMessages]);

  function openNotifDropdown() {
    setShowSavedDropdown(false);
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/profile'); return; }
    setShowNotifDropdown(v => !v);
    fetch(`${API}/notifications?limit=10`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => setNotifs(data.data || [])).catch(() => {});
    setUnreadCount(0);
  }

  function openSavedDropdown() {
    setShowNotifDropdown(false);
    setShowSavedDropdown(v => !v);
    // Tin đã lưu lấy từ localStorage
    try {
      const ids: string[] = JSON.parse(localStorage.getItem('liked_items') || '[]');
      if (ids.length === 0) { setSavedProducts([]); return; }
      Promise.all(
        ids.slice(0, 6).map(id =>
          fetch(`${API}/products/${id}`).then(r => r.ok ? r.json() : null).catch(() => null)
        )
      ).then(results => setSavedProducts(results.filter(Boolean)));
    } catch { setSavedProducts([]); }
  }

  useEffect(() => {
    function fetchUnread() {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) return;
      fetch(`${API}/notifications/unread-count`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data?.count !== undefined) setUnreadCount(data.count); })
        .catch(() => {});
      fetch(`${API}/conversations/unread-count`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data?.count !== undefined && !isOnMessagesRef.current && !msgSuppressRef.current) setUnreadMessages(data.count); })
        .catch(() => {});
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket — nhận thông báo realtime khi có tin nhắn mới
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return;
    let socket: any;
    import('socket.io-client').then(({ io }) => {
      socket = io(`${WS_URL}/messaging`, {
        auth: { token },
        transports: ['websocket'],
        reconnectionAttempts: 5,
      });
      socket.on('new_notification', (data: any) => {
        if (data.type === 'MESSAGE') {
          if (!isOnMessagesRef.current) {
            msgSuppressRef.current = false;
            if (typeof window !== 'undefined') localStorage.removeItem('msgSuppressed');
            setUnreadMessages(prev => prev + 1);
          }
          setUnreadCount(prev => prev + 1);
          setMsgToast({
            title: data.title || 'Tin nhắn mới',
            body: data.body || '',
            conversationId: data.data?.conversationId || '',
          });
          setTimeout(() => setMsgToast(null), 5000);
        } else {
          setUnreadCount(prev => prev + 1);
        }
      });
    }).catch(() => {});
    return () => { if (socket) socket.disconnect(); };
  }, []);

  // Lắng nghe khi user click vào 1 cuộc trò chuyện → giảm badge
  useEffect(() => {
    function handleConvRead(e: Event) {
      const count = (e as CustomEvent).detail?.unreadCount || 0;
      if (count > 0) {
        setUnreadMessages(prev => {
          const next = Math.max(0, prev - count);
          if (next === 0) msgSuppressRef.current = true;
          return next;
        });
      }
    }
    window.addEventListener('conversation-read', handleConvRead);
    return () => window.removeEventListener('conversation-read', handleConvRead);
  }, []);

  function handlePostClick() {
    if (!auth.isLoggedIn()) { router.push('/profile'); return; }
    setShowPostMenu(v => !v);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/95 backdrop-blur-md" suppressHydrationWarning>
      <div className="mx-auto flex h-16 max-w-content items-center gap-3 px-4 sm:px-6" suppressHydrationWarning>
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Chợ Nhân Cơ, trang chủ">
          <Logo size={36} />
          <span className="hidden text-[19px] font-extrabold tracking-tight text-ink sm:block">Chợ Nhân Cơ</span>
        </Link>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const v = ((new FormData(e.currentTarget).get('q') as string) || '').trim();
            if (v) router.push(smartSearch(v));
          }}
          className="min-w-0 flex-1 md:mx-4 md:max-w-2xl"
          role="search"
        >
          <div className="flex h-11 items-center gap-2 rounded-pill border border-line bg-paper pl-4 pr-1.5 transition-colors focus-within:border-forest-500 focus-within:bg-surface">
            <i className="ri-search-line text-ink-faint" aria-hidden="true" />
            <input
              name="q"
              type="search"
              aria-label="Tìm kiếm trên Chợ Nhân Cơ"
              placeholder="Tìm cà phê, tiêu, đất rẫy, việc làm..."
              className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder-ink-faint focus:outline-none"
            />
            <button type="submit" className="hidden h-8 shrink-0 rounded-pill bg-forest-600 px-4 text-[13px] font-bold text-white transition hover:bg-forest-700 sm:block">
              Tìm
            </button>
          </div>
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-0.5" suppressHydrationWarning>
          {/* Tin đã lưu */}
          <div className="relative hidden sm:block" ref={savedRef}>
            <button onClick={openSavedDropdown} title="Tin đã lưu" aria-label="Tin đã lưu" className={iconBtn}>
              <i className="ri-heart-line text-xl" />
            </button>
            {showSavedDropdown && (
              <div className={`${dropdown} w-[min(20rem,calc(100vw-2rem))]`}>
                <div className="flex items-center justify-between border-b border-line px-4 py-3">
                  <h3 className="text-[15px] font-bold text-ink">Tin đã lưu</h3>
                  <button onClick={() => { setShowSavedDropdown(false); navDashboard('liked'); }} className="text-xs font-semibold text-forest-700 hover:underline">Xem tất cả</button>
                </div>
                {savedProducts.length === 0 ? (
                  <div className="px-6 py-10 text-center text-ink-faint">
                    <i className="ri-heart-line mb-2 block text-3xl" />
                    <p className="text-sm font-semibold text-ink">Bạn chưa lưu tin nào</p>
                    <p className="mt-1 text-xs">Bấm hình trái tim trên tin bạn thích, tin sẽ hiện ở đây.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-line">
                    {savedProducts.map((p: any) => (
                      <Link key={p.id} href={`/products/${p.id}`} onClick={() => setShowSavedDropdown(false)} className="flex items-center gap-3 px-4 py-3 transition hover:bg-paper">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-forest-50">
                          {p.images?.[0]?.url
                            ? <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />
                            : <i className="ri-image-line grid h-full w-full place-items-center text-forest-300" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-medium text-ink">{p.title}</p>
                          <p className="text-sm font-bold text-forest-700">{Number(p.price).toLocaleString('vi-VN')}đ</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Thông báo */}
          <div className="relative hidden sm:block" ref={notifRef}>
            <button onClick={openNotifDropdown} title="Thông báo" aria-label="Thông báo" className={iconBtn}>
              <i className="ri-notification-3-line text-xl" />
              {unreadCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold leading-none text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            {showNotifDropdown && (
              <div className={`${dropdown} w-[min(25rem,calc(100vw-2rem))]`}>
                <div className="px-5 pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-ink">Thông báo</h3>
                    <button onClick={() => { setShowNotifDropdown(false); navDashboard('notifications'); }} className="text-xs font-semibold text-forest-700 hover:underline">Xem tất cả</button>
                  </div>
                  <div className="flex border-b border-line">
                    {(['activity', 'news'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setNotifTab(tab)}
                        className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition ${notifTab === tab ? 'border-forest-600 text-forest-700' : 'border-transparent text-ink-faint hover:text-ink-soft'}`}
                      >
                        {tab === 'activity' ? 'Hoạt động' : 'Tin tức'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="max-h-[28rem] overflow-y-auto">
                  {notifTab === 'news' ? (
                    <div className="py-12 text-center text-ink-faint">
                      <i className="ri-newspaper-line mb-2 block text-4xl" />
                      <p className="text-sm">Chưa có tin tức nào</p>
                    </div>
                  ) : notifs.length === 0 ? (
                    <div className="py-12 text-center text-ink-faint">
                      <i className="ri-notification-3-line mb-2 block text-4xl" />
                      <p className="text-sm font-semibold text-ink-soft">Chưa có thông báo nào</p>
                      <p className="mt-1 text-xs">Thông báo về tin nhắn, lượt thích sẽ hiện ở đây</p>
                    </div>
                  ) : (
                    <div>
                      {notifs.map((n: any) => {
                        const isLike = n.type?.includes('LIKE');
                        const isComment = n.type?.includes('COMMENT');
                        const iconClass = isLike ? 'ri-heart-fill text-brand-500' : isComment ? 'ri-chat-1-fill text-forest-600' : 'ri-notification-2-fill text-gold-600';
                        const iconBg = isLike ? 'bg-brand-50' : isComment ? 'bg-forest-50' : 'bg-gold-400/15';
                        return (
                          <div
                            key={n.id}
                            className={`flex cursor-pointer items-start gap-3 px-5 py-3.5 transition hover:bg-paper ${!n.isRead ? 'bg-forest-50/60' : ''}`}
                            onClick={async () => {
                              setShowNotifDropdown(false);
                              if (!n.isRead) {
                                try {
                                  await fetch(`${API}/notifications/${n.id}/read`, { method: 'PUT', headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });
                                  setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
                                } catch {}
                              }
                              const d = n.data as any;
                              const url = d?.url
                                || (d?.targetType && d?.targetId ? (d.targetType === 'REAL_ESTATE' ? `/real-estate/${d.targetId}` : d.targetType === 'JOB' ? `/jobs/${d.targetId}` : `/products/${d.targetId}`) : null)
                                || (n.relatedId ? `/products/${n.relatedId}` : null);
                              if (url) router.push(url);
                              else navDashboard('notifications');
                            }}
                          >
                            <div className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full ${iconBg}`}>
                              <i className={`${iconClass} text-base`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              {n.title && <p className={`text-sm leading-snug ${!n.isRead ? 'font-bold text-ink' : 'font-medium text-ink-soft'}`}>{n.title}</p>}
                              <p className={`mt-0.5 line-clamp-2 text-sm leading-snug ${!n.isRead ? 'text-ink-soft' : 'text-ink-faint'}`}>{n.body || n.message}</p>
                              <p className="mt-1 text-xs text-ink-faint">{timeAgoHeader(n.createdAt)}</p>
                            </div>
                            {!n.isRead && <div className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-500" />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tin nhắn */}
          <Link href="/messages" aria-label="Tin nhắn" title="Tin nhắn" className={`${iconBtn} hidden md:grid`}>
            <i className="ri-chat-1-line text-xl" />
            {unreadMessages > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold leading-none text-white">
                {unreadMessages > 99 ? '99+' : unreadMessages}
              </span>
            )}
          </Link>

          <button onClick={() => navDashboard('products')} className="hidden rounded-pill px-3 py-2 text-sm font-semibold text-ink-soft transition hover:bg-forest-50 hover:text-forest-700 lg:block">
            Quản lý tin
          </button>

          {/* Đăng tin (desktop; on phones the centre tab does this) */}
          <div className="relative hidden md:block" ref={postMenuRef}>
            <button onClick={handlePostClick} aria-label="Đăng tin" aria-expanded={showPostMenu} className="btn-primary ml-1">
              <i className="ri-add-line text-lg" aria-hidden="true" />Đăng tin
            </button>
            {showPostMenu && (
              <div className={`${dropdown} top-12 w-72 py-2`}>
                <p className="border-b border-line px-4 py-2 text-xs font-bold text-ink-faint">Bạn muốn đăng gì?</p>
                {POST_ITEMS.map(item => (
                  <Link key={item.href} href={item.href} onClick={() => setShowPostMenu(false)} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-paper">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-forest-100 text-forest-700"><i className={`${item.icon} text-lg`} /></span>
                    <span>
                      <span className="block text-sm font-semibold text-ink">{item.label}</span>
                      <span className="block text-xs text-ink-faint">{item.sub}</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/dashboard" aria-label="Tài khoản của tôi" className="ml-1 hidden h-10 w-10 place-items-center rounded-full bg-forest-100 text-forest-700 transition hover:bg-forest-200 md:grid">
            <i className="ri-user-3-line text-lg" />
          </Link>
        </div>
      </div>

      {/* Danh mục — a scrolling row of chips, same on phone and desktop */}
      <nav aria-label="Danh mục" className="border-t border-line/70">
        <div className="no-scrollbar mx-auto flex max-w-content gap-2 overflow-x-auto px-4 py-2 sm:px-6">
          {CATEGORIES.map((c) => {
            const active = isActivePath(pathname, c.href);
            return (
              <Link key={c.href} href={c.href} aria-current={active ? 'page' : undefined} className={`chip ${active ? 'chip-active' : ''}`}>
                <i className={`${c.icon} text-base`} aria-hidden="true" />
                {c.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {msgToast && (
        <button
          className="fixed bottom-24 right-4 z-[9999] flex max-w-xs items-start gap-3 rounded-2xl border border-line bg-surface p-4 text-left shadow-lift md:bottom-5 md:right-5"
          style={{ animation: 'slideUp 0.3s ease' }}
          onClick={() => {
            if (msgToast.conversationId) router.push(`/messages/${msgToast.conversationId}`);
            else router.push('/messages');
            setMsgToast(null);
          }}
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest-100 text-forest-700">
            <i className="ri-chat-1-fill text-lg" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold leading-snug text-ink">{msgToast.title}</span>
            {msgToast.body && <span className="mt-0.5 line-clamp-2 block text-xs text-ink-soft">{msgToast.body}</span>}
            <span className="mt-1 block text-[10px] text-ink-faint">Nhấn để xem tin nhắn</span>
          </span>
        </button>
      )}
    </header>
  );
}
