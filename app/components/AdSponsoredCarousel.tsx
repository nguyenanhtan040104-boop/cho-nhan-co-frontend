'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { advertisements } from '../../lib/api';

type Slide = {
  id: string;
  href: string;
  title: string;
  description?: string;
  image: string;
  storeName?: string;
  cta: string;
};

// Local Nhân Cơ / Đắk Nông flavor — coffee, pepper, farmland, shops, services, events
const FALLBACK_SLIDES: Slide[] = [
  {
    id: 'fb-coffee',
    href: '/advertisements/create',
    title: 'Cà phê Đắk Nông — Đẩy thương hiệu lên top',
    description: 'Cho hộ rang xay, vườn cà phê, quán cà phê tại Nhân Cơ. Tiếp cận hàng nghìn khách hàng trong vùng.',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=1600&h=900&fit=crop&q=80',
    storeName: 'Quảng cáo · Nông sản',
    cta: 'Đăng quảng cáo ngay',
  },
  {
    id: 'fb-pepper',
    href: '/advertisements/create',
    title: 'Hồ tiêu Nhân Cơ — Tăng đầu ra cho mùa vụ',
    description: 'Quảng bá vườn tiêu, sản phẩm tiêu sạch đến thương lái và khách hàng tại Đắk Nông.',
    image: 'https://images.unsplash.com/photo-1599909366516-6c1d0e5b3e9b?w=1600&h=900&fit=crop&q=80',
    storeName: 'Quảng cáo · Nông sản',
    cta: 'Đăng quảng cáo ngay',
  },
  {
    id: 'fb-land',
    href: '/advertisements/create',
    title: 'Đất rẫy, vườn cây — Bán nhanh trong tuần',
    description: 'Đẩy tin đất nông nghiệp, rẫy cà phê, vườn tiêu lên đầu trang. Khách thật, gần nhà.',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&h=900&fit=crop&q=80',
    storeName: 'Quảng cáo · Bất động sản',
    cta: 'Đăng quảng cáo ngay',
  },
  {
    id: 'fb-shop',
    href: '/advertisements/create',
    title: 'Tạp hóa, quán ăn — Khai trương, khuyến mãi',
    description: 'Cửa hàng địa phương, dịch vụ sửa chữa, vận chuyển. Thông báo đến cả cộng đồng Nhân Cơ.',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1600&h=900&fit=crop&q=80',
    storeName: 'Quảng cáo · Cửa hàng & Dịch vụ',
    cta: 'Đăng quảng cáo ngay',
  },
  {
    id: 'fb-event',
    href: '/advertisements/create',
    title: 'Sự kiện cộng đồng — Hội chợ, lễ hội',
    description: 'Quảng bá hội chợ nông sản, ngày hội cà phê, sự kiện làng xã đến đông đảo bà con.',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&h=900&fit=crop&q=80',
    storeName: 'Quảng cáo · Sự kiện',
    cta: 'Đăng quảng cáo ngay',
  },
];

const AUTO_PLAY_MS = 5000;

export default function AdSponsoredCarousel() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const CATEGORY_LABEL: Record<string, string> = {
      KHAI_TRUONG: 'Khai trương',
      KHUYEN_MAI: 'Khuyến mãi',
      SAN_PHAM_MOI: 'Sản phẩm mới',
      DICH_VU: 'Dịch vụ',
      SU_KIEN: 'Sự kiện',
      KHAC: 'Quảng cáo',
    };

    const toSlide = (ad: any): Slide | null => {
      const image = ad.images?.[0];
      if (!image) return null;
      const categoryLabel = CATEGORY_LABEL[ad.category] || 'Quảng cáo';
      return {
        id: ad.id,
        href: `/advertisements/${ad.id}`,
        title: ad.title,
        description: ad.description,
        image,
        storeName: ad.businessName
          ? `Quảng cáo · ${ad.businessName}`
          : `Quảng cáo · ${categoryLabel}`,
        cta: 'Xem chi tiết',
      };
    };

    async function load() {
      try {
        // 1. Prefer VIP/featured ads (paid sponsorships go first)
        const featured = await advertisements.getFeatured(8).catch(() => ({ data: [] }));
        const vipSlides = (featured.data || []).map(toSlide).filter(Boolean) as Slide[];
        if (vipSlides.length > 0) {
          if (!cancelled) setSlides(vipSlides);
          return;
        }

        // 2. No VIP yet — show recent user-submitted ads as carousel fill
        const recent = await advertisements.getAll({ limit: 8 }).catch(() => ({ data: [] }));
        const recentSlides = (recent.data || []).map(toSlide).filter(Boolean) as Slide[];
        if (recentSlides.length > 0) {
          if (!cancelled) setSlides(recentSlides);
          return;
        }

        // 3. DB has zero ads at all — last resort: themed CTA placeholders
        if (!cancelled) setSlides(FALLBACK_SLIDES);
      } catch {
        if (!cancelled) setSlides(FALLBACK_SLIDES);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const next = useCallback(() => {
    setActive(prev => (slides.length === 0 ? 0 : (prev + 1) % slides.length));
  }, [slides.length]);

  const prev = useCallback(() => {
    setActive(prev => (slides.length === 0 ? 0 : (prev - 1 + slides.length) % slides.length));
  }, [slides.length]);

  // Autoplay
  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const t = setInterval(next, AUTO_PLAY_MS);
    return () => clearInterval(t);
  }, [paused, slides.length, next]);

  // Touch swipe
  function onTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX; }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx > 60) prev();
    else if (dx < -60) next();
    touchStartX.current = null;
  }

  if (slides.length === 0) {
    return (
      <div
        className="mt-3 w-full rounded-3xl bg-gradient-to-br from-orange-100 via-amber-50 to-orange-50 animate-pulse"
        style={{ height: 'clamp(220px, 30vw, 380px)' }}
      />
    );
  }

  return (
    <section
      className="mt-3 relative w-full overflow-hidden rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.08)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides — each is absolutely positioned and cross-faded for smooth single-slide transitions */}
      <div className="relative w-full h-[220px] md:h-[280px] lg:h-[380px]">
        {slides.map((slide, i) => (
          <SlideContent key={slide.id} slide={slide} active={i === active} />
        ))}
      </div>

      {/* 'Quảng cáo' badge — top left */}
      <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 shadow-lg">
        <i className="ri-megaphone-fill text-sm"></i>
        Quảng cáo
      </div>

      {/* Prev/Next — grouped on the right side (top) */}
      {slides.length > 1 && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5">
          <button
            onClick={prev}
            aria-label="Trước"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg transition-all hover:scale-110"
          >
            <i className="ri-arrow-left-s-line text-xl"></i>
          </button>
          <button
            onClick={next}
            aria-label="Sau"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg transition-all hover:scale-110"
          >
            <i className="ri-arrow-right-s-line text-xl"></i>
          </button>
        </div>
      )}

      {/* Pagination dots — bottom center */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/15">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Đến slide ${i + 1}`}
              className={`transition-all rounded-full ${
                i === active ? 'w-7 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/45 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Single slide ──────────────────────────────────────────────────────
function SlideContent({ slide, active }: { slide: Slide; active: boolean }) {
  return (
    <Link
      href={slide.href}
      tabIndex={active ? 0 : -1}
      aria-hidden={!active}
      className={`absolute inset-0 block transition-opacity duration-700 ease-out ${
        active ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
      }`}
    >
      {/* Background image */}
      <img
        src={slide.image}
        alt={slide.title}
        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out ${
          active ? 'scale-100' : 'scale-105'
        }`}
        loading={active ? 'eager' : 'lazy'}
      />

      {/* Dark gradient overlay — bottom-left to top-right so text on left is legible */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/50 to-transparent" />
      {/* Extra bottom-vignette for dots/buttons contrast */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />

      {/* Content — glassmorphism box on the left */}
      <div className="absolute inset-0 flex items-end md:items-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-[88%] sm:max-w-md lg:max-w-lg bg-white/12 backdrop-blur-md border border-white/25 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-2xl">
          {slide.storeName && (
            <p className="text-[10px] sm:text-xs font-black tracking-widest text-white/90 uppercase mb-1.5 sm:mb-2 flex items-center gap-2">
              <span className="inline-block w-4 sm:w-5 h-px bg-white/80"></span>
              {slide.storeName}
            </p>
          )}
          <h3
            className="text-white font-black leading-tight mb-1.5 sm:mb-2.5 line-clamp-2"
            style={{ fontSize: 'clamp(1.05rem, 2.4vw, 1.75rem)', letterSpacing: '-0.5px' }}
          >
            {slide.title}
          </h3>
          {slide.description && (
            <p className="text-white/85 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-2 lg:line-clamp-3">
              {slide.description}
            </p>
          )}
          <span className="inline-flex items-center gap-1.5 bg-white text-gray-900 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-lg group-hover:scale-105 transition-transform">
            {slide.cta}
            <i className="ri-arrow-right-line"></i>
          </span>
        </div>
      </div>
    </Link>
  );
}
