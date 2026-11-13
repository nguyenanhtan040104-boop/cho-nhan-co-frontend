'use client';

import { useState, useEffect } from 'react';

const urlOf = (i: any): string => (i && (i.url || (typeof i === 'string' ? i : ''))) || '';

type GalleryProps = {
  images: any[];
  title: string;
  icon: string;               // placeholder icon when there is no photo
  badge?: string;             // e.g. "Nổi bật"
  liked?: boolean;
  onLike?: () => void;
  onShare?: () => void;
};

// Photo viewer shared by every listing page: main photo, thumbnails, full-screen zoom.
export default function Gallery({ images, title, icon, badge, liked, onLike, onShare }: GalleryProps) {
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const list = images || [];
  const main = list[selected];
  const step = (d: number) => setSelected(i => (i + d + list.length) % list.length);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); setZoom(1); }
      if (e.key === 'ArrowLeft' && list.length > 1) step(-1);
      if (e.key === 'ArrowRight' && list.length > 1) step(1);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, list.length]);

  const round = 'grid place-items-center rounded-full';

  return (
    <div>
      {open && main && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90" onClick={() => { setOpen(false); setZoom(1); }} role="dialog" aria-modal="true" aria-label="Xem ảnh lớn">
          <div className="absolute right-4 top-4 z-10 flex gap-2">
            <button onClick={e => { e.stopPropagation(); setZoom(z => Math.min(z + 0.5, 4)); }} aria-label="Phóng to" className={`${round} h-10 w-10 bg-white/20 text-white hover:bg-white/35`}><i className="ri-zoom-in-line text-lg" /></button>
            <button onClick={e => { e.stopPropagation(); setZoom(z => Math.max(z - 0.5, 0.5)); }} aria-label="Thu nhỏ" className={`${round} h-10 w-10 bg-white/20 text-white hover:bg-white/35`}><i className="ri-zoom-out-line text-lg" /></button>
            <button onClick={() => { setOpen(false); setZoom(1); }} aria-label="Đóng" className={`${round} h-10 w-10 bg-white/20 text-white hover:bg-white/35`}><i className="ri-close-line text-xl" /></button>
          </div>
          {list.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); step(-1); }} aria-label="Ảnh trước" className={`${round} absolute left-3 top-1/2 z-10 h-11 w-11 -translate-y-1/2 bg-white/20 text-white hover:bg-white/35`}><i className="ri-arrow-left-s-line text-2xl" /></button>
              <button onClick={e => { e.stopPropagation(); step(1); }} aria-label="Ảnh sau" className={`${round} absolute right-3 top-1/2 z-10 h-11 w-11 -translate-y-1/2 bg-white/20 text-white hover:bg-white/35`}><i className="ri-arrow-right-s-line text-2xl" /></button>
              <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-pill bg-black/50 px-3 py-1 text-sm text-white">{selected + 1} / {list.length}</span>
            </>
          )}
          <div className="flex max-h-full max-w-full items-center justify-center overflow-auto" onClick={e => e.stopPropagation()}>
            <img
              src={urlOf(main)}
              alt={title}
              onClick={() => setZoom(z => (z > 1 ? 1 : 2))}
              style={{ transform: `scale(${zoom})`, transition: 'transform .2s', maxWidth: '92vw', maxHeight: '86vh', objectFit: 'contain', cursor: zoom > 1 ? 'zoom-out' : 'zoom-in' }}
            />
          </div>
        </div>
      )}

      <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-line bg-paper sm:aspect-[16/11]">
        {main ? (
          <button type="button" onClick={() => { setOpen(true); setZoom(1); }} className="block h-full w-full cursor-zoom-in" aria-label="Xem ảnh lớn">
            <img src={urlOf(main)} alt={title} className="h-full w-full object-cover" />
          </button>
        ) : (
          <div className="grid h-full w-full place-items-center text-ink-faint/50">
            <span className="text-center"><i className={`${icon} block text-6xl`} /><span className="mt-1 block text-sm">Chưa có ảnh</span></span>
          </div>
        )}
        {badge && <span className="absolute left-3 top-3 rounded bg-gold-500 px-2 py-1 text-xs font-bold text-ink">{badge}</span>}
        {(onLike || onShare) && (
          <div className="absolute right-3 top-3 flex gap-2">
            {onLike && (
              <button onClick={onLike} aria-label={liked ? 'Bỏ lưu tin' : 'Lưu tin'} aria-pressed={liked} className={`${round} h-10 w-10 bg-white/95 text-ink-soft shadow-card transition hover:text-ink`}>
                <i className={`${liked ? 'ri-heart-fill text-brand-500' : 'ri-heart-line'} text-xl`} />
              </button>
            )}
            {onShare && (
              <button onClick={onShare} aria-label="Chia sẻ" className={`${round} h-10 w-10 bg-white/95 text-ink-soft shadow-card transition hover:text-ink`}>
                <i className="ri-share-forward-line text-xl" />
              </button>
            )}
          </div>
        )}
        {list.length > 1 && (
          <>
            <button onClick={() => step(-1)} aria-label="Ảnh trước" className={`${round} absolute left-2 top-1/2 h-10 w-10 -translate-y-1/2 bg-white/95 shadow-card`}><i className="ri-arrow-left-s-line text-xl text-ink" /></button>
            <button onClick={() => step(1)} aria-label="Ảnh sau" className={`${round} absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2 bg-white/95 shadow-card`}><i className="ri-arrow-right-s-line text-xl text-ink" /></button>
            <span className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">{selected + 1}/{list.length}</span>
          </>
        )}
      </div>

      {list.length > 1 && (
        <div className="no-scrollbar mt-2.5 flex gap-2 overflow-x-auto pb-1">
          {list.map((im, i) => (
            <button key={i} onClick={() => setSelected(i)} aria-label={`Ảnh ${i + 1}`} aria-current={selected === i}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${selected === i ? 'border-forest-700' : 'border-transparent opacity-70 hover:opacity-100'}`}>
              <img src={urlOf(im)} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
