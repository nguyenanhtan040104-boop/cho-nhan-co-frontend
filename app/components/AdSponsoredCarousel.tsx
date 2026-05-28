'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { advertisements } from '../../lib/api';

type SponsoredAd = {
  id: string;
  href: string;
  title: string;
  description?: string;
  image?: string;
  businessName?: string;
  category?: string;
  ownerName?: string;
  packageLabel?: string;
  _isFallback?: boolean;
};

const FALLBACK_ADS: SponsoredAd[] = [
  {
    id: 'cta-1',
    href: '/advertisements/create',
    title: 'Cửa hàng tạp hóa, quán ăn, dịch vụ?',
    description: 'Đẩy thương hiệu lên đầu trang chủ, tiếp cận hàng nghìn bà con tại Đắk Nông.',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop&q=80',
    businessName: 'Quảng cáo của bạn',
    packageLabel: 'Gói 7 ngày · 50.000đ',
    ownerName: 'Chợ Nhân Cơ',
    _isFallback: true,
  },
  {
    id: 'cta-2',
    href: '/advertisements/create',
    title: 'Khai trương — Khuyến mãi mở cửa',
    description: 'Cho cửa hàng tạp hóa, quán ăn — thông báo khai trương đến cả cộng đồng.',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=600&fit=crop&q=80',
    businessName: 'Quảng cáo của bạn',
    packageLabel: 'Tiết kiệm 30%',
    ownerName: 'Chợ Nhân Cơ',
    _isFallback: true,
  },
  {
    id: 'cta-3',
    href: '/advertisements/create',
    title: 'Sự kiện cộng đồng, hội chợ, lễ hội',
    description: 'Đẩy thông tin sự kiện đến đông đảo bà con trong vùng với gói 30 ngày.',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop&q=80',
    businessName: 'Quảng cáo của bạn',
    packageLabel: 'Gói 30 ngày · 149.000đ',
    ownerName: 'Chợ Nhân Cơ',
    _isFallback: true,
  },
  {
    id: 'cta-4',
    href: '/advertisements/create',
    title: 'Bán nhanh hơn với nhãn VIP',
    description: 'Bài đăng có nhãn VIP nổi bật, đẩy lên top tìm kiếm và carousel này.',
    image: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=800&h=600&fit=crop&q=80',
    businessName: 'Quảng cáo của bạn',
    packageLabel: 'Bắt đầu từ 50.000đ',
    ownerName: 'Chợ Nhân Cơ',
    _isFallback: true,
  },
];

const CATEGORY_LABEL: Record<string, string> = {
  KHAI_TRUONG: 'Khai trương',
  KHUYEN_MAI: 'Khuyến mãi',
  SAN_PHAM_MOI: 'Sản phẩm mới',
  DICH_VU: 'Dịch vụ',
  SU_KIEN: 'Sự kiện',
  KHAC: 'Khác',
};

const AUTO_PLAY_MS = 5000;

export default function AdSponsoredCarousel() {
  const [ads, setAds] = useState<SponsoredAd[]>([]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    advertisements
      .getFeatured(8)
      .then(res => {
        const list = res.data || [];
        if (list.length > 0) {
          setAds(list.map((ad: any) => ({
            id: ad.id,
            href: `/advertisements/${ad.id}`,
            title: ad.title,
            description: ad.description,
            image: ad.images?.[0],
            businessName: ad.businessName,
            category: ad.category,
            ownerName: ad.user?.fullName || ad.user?.username,
            packageLabel: CATEGORY_LABEL[ad.category] || ad.category,
          })));
        } else {
          setAds(FALLBACK_ADS);
        }
      })
      .catch(() => setAds(FALLBACK_ADS));
  }, []);

  // Scroll helper — moves the track to the i-th card
  const goTo = useCallback((i: number) => {
    if (!trackRef.current) return;
    const card = trackRef.current.children[0] as HTMLElement | undefined;
    if (!card) return;
    const cardWidth = card.offsetWidth + 16; // 16px gap
    trackRef.current.scrollTo({ left: cardWidth * i, behavior: 'smooth' });
    setActive(i);
  }, []);

  const next = useCallback(() => {
    if (ads.length === 0) return;
    goTo((active + 1) % ads.length);
  }, [active, ads.length, goTo]);

  const prev = useCallback(() => {
    if (ads.length === 0) return;
    goTo((active - 1 + ads.length) % ads.length);
  }, [active, ads.length, goTo]);

  // Autoplay
  useEffect(() => {
    if (paused || ads.length <= 1) return;
    const t = setInterval(next, AUTO_PLAY_MS);
    return () => clearInterval(t);
  }, [paused, ads.length, next]);

  // Track active index when user scrolls manually
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const card = track.children[0] as HTMLElement | undefined;
        if (!card) return;
        const cardWidth = card.offsetWidth + 16;
        const i = Math.round(track.scrollLeft / cardWidth);
        setActive(i);
      });
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => { track.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, [ads.length]);

  // Touch swipe (in case browser doesn't auto-snap)
  function onTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX; }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx > 60) prev();
    else if (dx < -60) next();
    touchStartX.current = null;
  }

  if (ads.length === 0) {
    return (
      <section className="mt-3 bg-white rounded-2xl p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-shrink-0 w-[85%] md:w-[48%] lg:w-[31%] bg-gray-100 rounded-2xl animate-pulse" style={{ aspectRatio: '4/5' }} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      className="mt-3 bg-white rounded-2xl overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-50">
        <div>
          <p className="text-[9px] font-bold tracking-widest text-orange-600 uppercase mb-1 flex items-center gap-1.5">
            <i className="ri-megaphone-fill text-sm"></i>
            Quảng cáo
          </p>
          <h2 className="font-extrabold text-gray-900 flex items-center gap-2" style={{ fontSize: 15, letterSpacing: '-0.3px' }}>
            Tài trợ bởi cộng đồng
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            aria-label="Trước"
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
          >
            <i className="ri-arrow-left-s-line text-lg"></i>
          </button>
          <button
            onClick={next}
            aria-label="Sau"
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
          >
            <i className="ri-arrow-right-s-line text-lg"></i>
          </button>
        </div>
      </div>

      {/* Card track */}
      <div
        ref={trackRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="flex gap-4 px-4 py-4 overflow-x-auto snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' as any }}
      >
        <style jsx>{`
          div::-webkit-scrollbar { display: none; }
        `}</style>
        {ads.map(ad => <AdCard key={ad.id} ad={ad} />)}
      </div>

      {/* Pagination dots */}
      {ads.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 pb-4">
          {ads.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Đến quảng cáo ${i + 1}`}
              className={`transition-all rounded-full ${
                i === active ? 'w-6 h-1.5 bg-orange-500' : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Card ──────────────────────────────────────────────────────────────
function AdCard({ ad }: { ad: SponsoredAd }) {
  return (
    <Link
      href={ad.href}
      className="group flex-shrink-0 w-[85%] md:w-[48%] lg:w-[31%] snap-start bg-white rounded-2xl overflow-hidden border border-gray-100 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] transition-all duration-300"
    >
      {/* Image */}
      <div className="relative bg-gray-100 overflow-hidden" style={{ aspectRatio: '4/3' }}>
        {ad.image ? (
          <img
            src={ad.image}
            alt={ad.title}
            className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
            <i className="ri-megaphone-line text-5xl text-white/80"></i>
          </div>
        )}

        {/* 'Quảng cáo' badge */}
        <div className="absolute top-2.5 left-2.5 bg-white/85 backdrop-blur-md border border-white/40 text-orange-700 text-[10px] font-black tracking-wider uppercase px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <i className="ri-megaphone-fill text-xs"></i>
          Quảng cáo
        </div>

        {/* Package label badge — top right */}
        {ad.packageLabel && (
          <div className="absolute top-2.5 right-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
            {ad.packageLabel}
          </div>
        )}

        {/* Bottom glass info bar (business name) */}
        {ad.businessName && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5">
            <div className="bg-black/35 backdrop-blur-md border border-white/15 rounded-xl px-3 py-1.5 text-white text-xs font-semibold truncate">
              {ad.businessName}
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-black text-gray-900 leading-tight line-clamp-2 mb-1.5" style={{ fontSize: 15, letterSpacing: '-0.2px' }}>
          {ad.title}
        </h3>
        {ad.description && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">
            {ad.description}
          </p>
        )}

        {/* Footer: owner + CTA */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-50">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <i className="ri-store-2-line text-orange-600 text-xs"></i>
            </div>
            <span className="text-[11px] text-gray-500 font-medium truncate">{ad.ownerName || 'Quảng cáo'}</span>
          </div>
          <span className="inline-flex items-center gap-0.5 bg-orange-50 text-orange-700 text-[11px] font-bold px-2.5 py-1 rounded-full group-hover:bg-orange-600 group-hover:text-white transition-colors">
            Xem
            <i className="ri-arrow-right-line text-sm"></i>
          </span>
        </div>
      </div>
    </Link>
  );
}
