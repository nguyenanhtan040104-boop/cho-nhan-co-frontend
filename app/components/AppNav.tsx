'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV = [
  { href: '/',                label: 'Trang nhất',   icon: 'ri-home-5' },
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
      {/* ── Desktop sidebar — a newspaper index ("mục lục") ───────────── */}
      <aside
        className={`sticky top-0 z-40 hidden h-screen shrink-0 flex-col border-r border-line bg-surface md:flex
                    transition-[width] duration-200 ${collapsed ? 'w-[76px]' : 'w-[248px]'}`}
      >
        {/* Masthead nameplate */}
        <div className={`border-b-2 border-ink ${collapsed ? 'px-0 py-4 text-center' : 'px-5 py-4'}`}>
          <Link href="/" className="block">
            {collapsed ? (
              <span className="font-display text-xl font-bold text-brand-600">C</span>
            ) : (
              <>
                <p className="font-display text-[21px] font-semibold leading-none text-ink">Chợ Nhân Cơ</p>
                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">Báo chợ · Đắk Nông</p>
              </>
            )}
          </Link>
        </div>

        {/* Index */}
        <nav aria-label="Mục lục" className="flex-1 overflow-y-auto px-3 py-3">
          {!collapsed && <p className="mb-1 px-2 font-display text-sm italic text-ink-faint">Mục lục</p>}
          {NAV.map((item, i) => {
            const active = isActive(pathname, item.href);
            const num = i === 0 ? '' : String(i).padStart(2, '0');
            return (
              <Link key={item.href} href={item.href} title={item.label}
                className={`group flex items-center border-b border-line/70 transition-colors last:border-0
                  ${collapsed ? 'justify-center py-3' : 'gap-3 px-2 py-2.5'}
                  ${active ? 'text-brand-600' : 'text-ink hover:text-brand-600'}`}>
                {collapsed ? (
                  <i className={`${item.icon}-${active ? 'fill' : 'line'} text-xl`} />
                ) : (
                  <>
                    <span className={`w-5 shrink-0 font-sans text-[11px] font-bold tabular-nums ${active ? 'text-brand-500' : 'text-ink-faint'}`}>{num || '·'}</span>
                    <span className={`font-display text-[16px] leading-tight ${active ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                    {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500" />}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Post CTA + collapse */}
        <div className="border-t-2 border-ink p-3">
          <Link href="/dashboard"
            className={`flex items-center justify-center gap-2 rounded-pill bg-brand-500 py-2.5 font-bold text-white shadow-brand hover:bg-brand-600 ${collapsed ? 'px-0' : 'px-4'}`}>
            <i className="ri-quill-pen-line text-base" />{!collapsed && 'Đăng tin'}
          </Link>
          <button onClick={toggle} aria-label={collapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'} aria-pressed={collapsed}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold text-ink-faint hover:bg-paper">
            <i className={`ri-contract-left-line text-base transition-transform ${collapsed ? 'rotate-180' : ''}`} />
            {!collapsed && 'Thu gọn'}
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom nav ───────────────────────────────────────── */}
      <nav aria-label="Điều hướng nhanh" className="fixed inset-x-0 bottom-0 z-40 flex border-t-2 border-ink bg-surface/95 backdrop-blur md:hidden">
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
