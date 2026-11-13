'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '../../lib/api';
import { POST_ITEMS, isActivePath } from './nav-data';

const TABS = [
  { href: '/',              label: 'Trang chủ', icon: 'ri-home-5' },
  { href: '/market-prices', label: 'Bảng giá',  icon: 'ri-line-chart' },
  { href: '/messages',      label: 'Tin nhắn',  icon: 'ri-chat-1' },
  { href: '/dashboard',     label: 'Của tôi',   icon: 'ri-user-3' },
];

// Phone-only tab bar. The centre button opens a sheet of "what do you want to post".
export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [sheet, setSheet] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => { setSheet(false); }, [pathname]);

  useEffect(() => {
    const onUnread = (e: Event) => setUnread((e as CustomEvent).detail || 0);
    window.addEventListener('unread-messages', onUnread);
    return () => window.removeEventListener('unread-messages', onUnread);
  }, []);

  useEffect(() => {
    if (!sheet) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSheet(false); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [sheet]);

  function openPost() {
    if (!auth.isLoggedIn()) { router.push('/profile'); return; }
    setSheet(true);
  }

  const tab = (t: (typeof TABS)[number]) => {
    const active = isActivePath(pathname, t.href);
    return (
      <Link
        key={t.href}
        href={t.href}
        aria-current={active ? 'page' : undefined}
        className={`relative flex flex-1 flex-col items-center gap-0.5 pb-1.5 pt-2 text-[11px] font-semibold ${active ? 'text-forest-700' : 'text-ink-faint'}`}
      >
        <i className={`${t.icon}-${active ? 'fill' : 'line'} text-[22px]`} aria-hidden="true" />
        {t.label}
        {t.href === '/messages' && unread > 0 && (
          <span className="absolute left-1/2 top-1 ml-2 min-w-[16px] rounded-full bg-brand-500 px-1 text-center text-[10px] font-bold leading-4 text-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      <nav
        aria-label="Điều hướng chính"
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 flex items-end border-t border-line bg-surface/95 shadow-nav backdrop-blur md:hidden"
      >
        {tab(TABS[0])}
        {tab(TABS[1])}
        <div className="flex flex-1 justify-center">
          <button
            onClick={openPost}
            aria-label="Đăng tin"
            className="-mt-5 mb-1 flex h-14 w-14 flex-col items-center justify-center rounded-full bg-brand-500 text-white shadow-brand ring-4 ring-surface transition active:scale-95"
          >
            <i className="ri-add-line text-3xl leading-none" aria-hidden="true" />
          </button>
        </div>
        {tab(TABS[2])}
        {tab(TABS[3])}
      </nav>

      {sheet && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Chọn loại tin muốn đăng">
          <button className="absolute inset-0 bg-ink/50" aria-label="Đóng" onClick={() => setSheet(false)} />
          <div className="safe-bottom absolute inset-x-0 bottom-0 animate-sheet-up rounded-t-sheet bg-surface p-4 shadow-lift">
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line" />
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink">Bạn muốn đăng gì?</h2>
              <button onClick={() => setSheet(false)} aria-label="Đóng" className="grid h-9 w-9 place-items-center rounded-full text-ink-soft hover:bg-paper">
                <i className="ri-close-line text-xl" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pb-2">
              {POST_ITEMS.map((p) => (
                <Link key={p.href} href={p.href} className="flex items-center gap-3 rounded-2xl border border-line bg-paper p-3 active:bg-forest-50">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-forest-100 text-forest-700">
                    <i className={`${p.icon} text-xl`} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-bold leading-tight text-ink">{p.label}</span>
                    <span className="block truncate text-[11px] text-ink-faint">{p.sub}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
