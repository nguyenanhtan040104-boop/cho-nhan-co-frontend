'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { advertisements } from '../../lib/api';

type Slide = {
  id: string;
  href: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  cta: string;
  _isFallback?: boolean;
};

const FALLBACK_SLIDES: Slide[] = [
  {
    id: 'cta-1',
    href: '/advertisements/create',
    title: 'Quảng cáo cửa hàng của bạn',
    subtitle: 'Tiếp cận hàng nghìn bà con tại Đắk Nông',
    description: 'Đẩy thương hiệu, khuyến mãi, sự kiện lên đầu trang chỉ từ 50.000đ. Banner chạy + popup khi khách mở site.',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=600&fit=crop&q=80',
    cta: 'Đăng quảng cáo ngay',
    _isFallback: true,
  },
  {
    id: 'cta-2',
    href: '/advertisements/create',
    title: 'Khai trương — Khuyến mãi',
    subtitle: 'Gói 7 ngày · 50.000đ',
    description: 'Cho cửa hàng tạp hóa, quán ăn, dịch vụ. Hiển thị trong popup khi khách lần đầu mở trang chủ.',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=600&fit=crop&q=80',
    cta: 'Tìm hiểu',
    _isFallback: true,
  },
  {
    id: 'cta-3',
    href: '/advertisements/create',
    title: 'Sự kiện cộng đồng',
    subtitle: 'Gói 30 ngày · 149.000đ (tiết kiệm 30%)',
    description: 'Hội chợ, lễ hội, ngày hội nông sản — đẩy thông tin sự kiện đến đông đảo bà con trong vùng.',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=600&fit=crop&q=80',
    cta: 'Bắt đầu',
    _isFallback: true,
  },
];

const AUTO_PLAY_MS = 6000;

export default function AdHeroCarousel() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  // Fetch featured ads on mount, fall back to CTAs if none
  useEffect(() => {
    advertisements
      .getFeatured(6)
      .then(res => {
        const list = res.data || [];
        if (list.length > 0) {
          setSlides(
            list.map((ad: any) => ({
              id: ad.id,
              href: `/advertisements/${ad.id}`,
              title: ad.title,
              subtitle: ad.businessName,
              description: ad.description,
              image: ad.images?.[0],
              cta: 'Xem chi tiết',
            })),
          );
        } else {
          setSlides(FALLBACK_SLIDES);
        }
      })
      .catch(() => setSlides(FALLBACK_SLIDES));
  }, []);

  const next = useCallback(() => {
    setActive(prev => (slides.length === 0 ? 0 : (prev + 1) % slides.length));
  }, [slides.length]);

  const prev = useCallback(() => {
    setActive(prev => (slides.length === 0 ? 0 : (prev - 1 + slides.length) % slides.length));
  }, [slides.length]);

  // Auto-play
  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const timer = setInterval(next, AUTO_PLAY_MS);
    return () => clearInterval(timer);
  }, [paused, slides.length, next]);

  // Touch swipe
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (diff > 60) prev();
    else if (diff < -60) next();
    touchStartX.current = null;
  }

  if (slides.length === 0) {
    return (
      <div className="mt-3 rounded-3xl overflow-hidden bg-gradient-to-br from-orange-100 via-amber-50 to-orange-50 animate-pulse" style={{ aspectRatio: '21/9', minHeight: 220 }} />
    );
  }

  return (
    <section
      className="mt-3 relative rounded-3xl overflow-hidden group/carousel select-none"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Track */}
      <div
        ref={trackRef}
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {slides.map((slide) => (
          <SlideContent key={slide.id} slide={slide} />
        ))}
      </div>

      {/* Prev / Next buttons */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Slide trước"
            className="absolute top-1/2 left-2 sm:left-4 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg transition-all opacity-0 group-hover/carousel:opacity-100 hover:scale-110"
          >
            <i className="ri-arrow-left-s-line text-2xl"></i>
          </button>
          <button
            onClick={next}
            aria-label="Slide tiếp"
            className="absolute top-1/2 right-2 sm:right-4 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg transition-all opacity-0 group-hover/carousel:opacity-100 hover:scale-110"
          >
            <i className="ri-arrow-right-s-line text-2xl"></i>
          </button>
        </>
      )}

      {/* Pagination dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Đến slide ${i + 1}`}
              className={`transition-all rounded-full ${
                i === active ? 'w-6 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}

      {/* Quảng cáo label (top-left) */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-10 px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold tracking-widest uppercase flex items-center gap-1">
        <i className="ri-megaphone-fill"></i>
        Quảng cáo
      </div>
    </section>
  );
}

// ─── Single slide ──────────────────────────────────────────────────────
function SlideContent({ slide }: { slide: Slide }) {
  return (
    <Link
      href={slide.href}
      className="relative flex-shrink-0 w-full block overflow-hidden"
      style={{ aspectRatio: '21/9', minHeight: 220 }}
    >
      {/* Background image */}
      {slide.image ? (
        <img
          src={slide.image}
          alt={slide.title}
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600" />
      )}

      {/* Gradient overlay for legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent sm:via-black/20" />

      {/* Glassmorphism content card */}
      <div className="absolute inset-0 flex items-center">
        <div className="w-full max-w-2xl px-4 sm:px-8 lg:px-12">
          <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-4 sm:p-6 shadow-2xl">
            {slide.subtitle && (
              <p className="text-[10px] sm:text-xs font-bold tracking-widest text-white/90 uppercase mb-1.5 sm:mb-2">
                <span className="inline-block w-4 sm:w-6 h-px bg-white/80 align-middle mr-2"></span>
                {slide.subtitle}
              </p>
            )}
            <h3 className="text-white font-black leading-tight mb-1.5 sm:mb-2.5" style={{ fontSize: 'clamp(1.05rem, 2.6vw, 1.75rem)', letterSpacing: '-0.5px' }}>
              {slide.title}
            </h3>
            {slide.description && (
              <p className="text-white/85 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">
                {slide.description}
              </p>
            )}
            <span className="inline-flex items-center gap-1.5 bg-white text-gray-900 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-lg hover:scale-105 transition-transform">
              {slide.cta}
              <i className="ri-arrow-right-line"></i>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
