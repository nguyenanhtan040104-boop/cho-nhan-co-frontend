'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV = [
  { href: '/',                label: 'Trang chủ',    icon: 'ri-home-5' },
  { href: '/products',        label: 'Nông sản',     icon: 'ri-seedling' },
  { href: '/real-estate',     label: 'Bất động sản', icon: 'ri-home-4' },
  { href: '/jobs',            label: 'Việc làm',     icon: 'ri-briefcase-4' },
  { href: '/vat-nuoi',        label: 'Vật nuôi',     icon: 'ri-bear-smile' },
  { href: '/dich-vu',         label: 'Dịch vụ',      icon: 'ri-tools' },
  { href: '/forum',           label: 'Diễn đàn',     icon: 'ri-chat-3' },
  { href: '/market-prices',   label: 'Bảng giá',     icon: 'ri-line-chart' },
  { href: '/advertisements',  label: 'Quảng cáo',    icon: 'ri-megaphone' },
  { href: '/canh-bao',        label: 'Cảnh báo',     icon: 'ri-alarm-warning' },
];

// Primary items shown in the mobile bottom bar (rest live behind "Thêm").
const MOBILE = ['/', '/products', '/real-estate', '/jobs', '/forum'];

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export default function AppNav() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try { setCollapsed(localStorage.getItem('nav_collapsed') === '1'); } catch {}
  }, []);
  function toggle() {
    setCollapsed(c => { try { localStorage.setItem('nav_collapsed', c ? '0' : '1'); } catch {} return !c; });
  }

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <aside
        className={`sticky top-0 z-40 hidden h-screen shrink-0 flex-col border-r border-line bg-surface md:flex
                    transition-[width] duration-200 ${collapsed ? 'w-[76px]' : 'w-[236px]'}`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-2.5 px-4">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-500 text-white shadow-brand">
              <i className="ri-store-2-fill text-lg" />
            </span>
            {!collapsed && <span className="truncate font-display text-[19px] font-semibold text-ink">Chợ Nhân Cơ</span>}
          </Link>
        </div>

        {/* Nav */}
        <nav aria-label="Danh mục chính" className="flex-1 overflow-y-auto px-3 py-2">
          {NAV.map(item => {
            const active = isActive(pathname, item.href);
            return (
              <Link key={item.href} href={item.href} title={item.label}
                className={`group mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold transition-colors
                  ${active ? 'bg-brand-50 text-brand-600' : 'text-ink-soft hover:bg-paper hover:text-ink'}
                  ${collapsed ? 'justify-center' : ''}`}>
                <i className={`${item.icon}-${active ? 'fill' : 'line'} text-xl shrink-0`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {active && !collapsed && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500" />}
              </Link>
            );
          })}
        </nav>

        {/* Post CTA + collapse */}
        <div className="border-t border-line p-3">
          <Link href="/dashboard"
            className={`flex items-center justify-center gap-2 rounded-pill bg-brand-500 py-2.5 font-bold text-white shadow-brand hover:bg-brand-600 ${collapsed ? 'px-0' : 'px-4'}`}>
            <i className="ri-add-line text-base" />{!collapsed && 'Đăng tin'}
          </Link>
          <button onClick={toggle} aria-label={collapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'} aria-pressed={collapsed}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold text-ink-faint hover:bg-paper">
            <i className={`ri-contract-left-line text-base transition-transform ${collapsed ? 'rotate-180' : ''}`} />
            {!collapsed && 'Thu gọn'}
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom nav ───────────────────────────────────────── */}
      <nav aria-label="Điều hướng nhanh" className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-surface/95 backdrop-blur md:hidden">
        {NAV.filter(n => MOBILE.includes(n.href)).map(item => {
          const active = isActive(pathname, item.href);
          return (
            <Link key={item.href} href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-semibold
                ${active ? 'text-brand-600' : 'text-ink-faint'}`}>
              <i className={`${item.icon}-${active ? 'fill' : 'line'} text-xl`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
