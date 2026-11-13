'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { products as productsApi, messages as messagesApi, auth, wallet as walletApi } from '../../../lib/api';
import CommentSection from '../../../components/CommentSection';
import ReviewSection from '../../../components/ReviewSection';
import ContactBar, { digits } from '../../components/ContactBar';
import ListingCard from '../../components/ListingCard';
import { timeAgo } from '../../../lib/format';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://cho-nhan-co-backend.onrender.com/api';

const CATEGORY_META: Record<string, { label: string; icon: string; listHref: string }> = {
  NONG_SAN: { label: 'Nông sản', icon: 'ri-plant-line', listHref: '/products?category=NONG_SAN' },
  VAT_NUOI: { label: 'Vật nuôi', icon: 'ri-bear-smile-line', listHref: '/vat-nuoi' },
  DICH_VU: { label: 'Dịch vụ', icon: 'ri-tools-line', listHref: '/dich-vu' },
  DO_DUNG_GIA_DINH: { label: 'Đồ dùng gia đình', icon: 'ri-home-gear-line', listHref: '/products?category=DO_DUNG_GIA_DINH' },
  HANG_TIEU_DUNG: { label: 'Hàng tiêu dùng', icon: 'ri-shopping-bag-line', listHref: '/products?category=HANG_TIEU_DUNG' },
};
const DEFAULT_META = { label: 'Sản phẩm', icon: 'ri-leaf-line', listHref: '/products' };

const money = (n: number) => `${Number(n || 0).toLocaleString('vi-VN')}đ`;
const imgUrl = (i: any): string => (i && (i.url || i)) || '';

interface ProductDetailProps {
  productId: string;
  initialProduct?: any;
}

export default function ProductDetail({ productId, initialProduct }: ProductDetailProps) {
  const router = useRouter();
  const [product, setProduct] = useState<any>(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialProduct?.likeCount || 0);
  const [deleting, setDeleting] = useState(false);
  const [buyingVip, setBuyingVip] = useState(false);
  const [more, setMore] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  useEffect(() => {
    if (initialProduct) {
      setLikeCount(initialProduct.likeCount || 0);
    } else {
      fetch(`${API}/products/${productId}`)
        .then(r => (r.ok ? r.json() : null))
        .then(data => { setProduct(data); setLikeCount(data?.likeCount || 0); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
    try {
      const ids: string[] = JSON.parse(localStorage.getItem('liked_items') || '[]');
      setLiked(ids.includes(productId));
    } catch {}
    try {
      const id = auth.getCurrentUserId?.() || JSON.parse(localStorage.getItem('user') || 'null')?.id || null;
      setCurrentUserId(id);
    } catch {}
  }, [productId, initialProduct]);

  // "Tin tương tự": the API's related list first, otherwise the same category
  useEffect(() => {
    if (!product) return;
    let cancelled = false;
    fetch(`${API}/products/${productId}/related`)
      .then(r => (r.ok ? r.json() : []))
      .then(async (rel) => {
        let list = Array.isArray(rel) ? rel : [];
        if (list.length === 0 && product.category) {
          const res = await fetch(`${API}/products?limit=9&category=${product.category}`).then(r => r.json()).catch(() => ({}));
          list = (res.data || []).filter((p: any) => String(p.id) !== String(productId));
        }
        if (!cancelled) setMore(list.slice(0, 8));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [product, productId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-content px-4 py-6 sm:px-6">
        <div className="grid animate-pulse gap-6 lg:grid-cols-[1.25fr_1fr]">
          <div className="aspect-[4/3] rounded-card bg-forest-50" />
          <div className="space-y-3">
            <div className="h-6 w-1/3 rounded bg-forest-50" />
            <div className="h-9 w-4/5 rounded bg-forest-50" />
            <div className="h-10 w-1/2 rounded bg-forest-50" />
            <div className="h-32 rounded-card bg-forest-50" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-ink">Không tìm thấy tin này</h1>
        <p className="mt-1 text-sm text-ink-soft">Tin có thể đã bị xóa hoặc người đăng đã gỡ xuống.</p>
        <Link href="/products" className="btn-forest mt-5">Xem các tin khác</Link>
      </div>
    );
  }

  const meta = CATEGORY_META[product.category] || DEFAULT_META;
  const isOwner = !!currentUserId && currentUserId === product.userId;
  const isVatNuoi = product.category === 'VAT_NUOI';
  const isDichVu = product.category === 'DICH_VU';
  const images: any[] = product.images || [];
  const main = images.length > 0 ? images[selected] : null;
  const phone = product.contactPhone || product.user?.phone || '';
  const num = phone ? digits(phone) : '';
  const stock = product.stock ?? product.quantity;

  const step = (d: number) => setSelected(i => (i + d + images.length) % images.length);

  const handleLike = () => {
    try {
      const ids: string[] = JSON.parse(localStorage.getItem('liked_items') || '[]');
      const now = !ids.includes(productId);
      localStorage.setItem('liked_items', JSON.stringify(now ? [...ids, productId] : ids.filter(x => x !== productId)));
      setLiked(now);
      setLikeCount((c: number) => Math.max(0, now ? c + 1 : c - 1));
    } catch {}
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: product.title, url }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(url); notify('Đã sao chép liên kết'); } catch { notify('Không sao chép được liên kết'); }
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xóa tin này?')) return;
    setDeleting(true);
    try {
      await productsApi.delete(productId);
      router.push('/products');
    } catch {
      notify('Xóa thất bại, thử lại sau');
      setDeleting(false);
    }
  };

  const handleBuyVip = async () => {
    if (!confirm('Mua VIP cho tin này với giá 50.000đ?')) return;
    setBuyingVip(true);
    try {
      const res = await walletApi.buyVip('product', productId) as any;
      notify(res.message || 'Mua VIP thành công');
      const d = await fetch(`${API}/products/${productId}`).then(r => r.json());
      setProduct(d);
    } catch (e: any) {
      notify(e.message || 'Không mua được VIP');
    } finally {
      setBuyingVip(false);
    }
  };

  const handleChat = async () => {
    if (!auth.isLoggedIn()) { router.push('/profile'); return; }
    try {
      const conv = await messagesApi.getOrCreate(product.user?.id) as any;
      router.push(`/messages/${conv.id}`);
    } catch { notify('Không mở được cuộc trò chuyện'); }
  };

  const facts: { label: string; value: string }[] = [
    { label: 'Loại tin', value: meta.label },
    ...(stock ? [{ label: isVatNuoi ? 'Số con còn' : 'Số lượng còn', value: `${stock}${isVatNuoi ? ' con' : product.unit ? ' ' + product.unit : ''}` }] : []),
    ...(product.unit && !isVatNuoi ? [{ label: 'Đơn vị', value: product.unit }] : []),
    ...(product.location ? [{ label: 'Khu vực', value: product.location }] : []),
    ...(product.createdAt ? [{ label: 'Đăng', value: timeAgo(product.createdAt) }] : []),
  ];

  return (
    <div className="pb-6">
      {toast && (
        <div role="status" className="fixed left-1/2 top-20 z-[70] -translate-x-1/2 rounded-pill bg-ink px-5 py-2.5 text-sm font-semibold text-white shadow-lift">{toast}</div>
      )}

      {/* Lightbox */}
      {lightbox && main && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90" onClick={() => { setLightbox(false); setZoom(1); }} role="dialog" aria-modal="true" aria-label="Xem ảnh lớn">
          <div className="absolute right-4 top-4 z-10 flex gap-2">
            <button onClick={e => { e.stopPropagation(); setZoom(z => Math.min(z + 0.5, 4)); }} aria-label="Phóng to" className="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white hover:bg-white/35"><i className="ri-zoom-in-line text-lg" /></button>
            <button onClick={e => { e.stopPropagation(); setZoom(z => Math.max(z - 0.5, 0.5)); }} aria-label="Thu nhỏ" className="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white hover:bg-white/35"><i className="ri-zoom-out-line text-lg" /></button>
            <button onClick={() => { setLightbox(false); setZoom(1); }} aria-label="Đóng" className="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white hover:bg-white/35"><i className="ri-close-line text-xl" /></button>
          </div>
          {images.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); step(-1); }} aria-label="Ảnh trước" className="absolute left-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/20 text-white hover:bg-white/35"><i className="ri-arrow-left-s-line text-2xl" /></button>
              <button onClick={e => { e.stopPropagation(); step(1); }} aria-label="Ảnh sau" className="absolute right-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/20 text-white hover:bg-white/35"><i className="ri-arrow-right-s-line text-2xl" /></button>
              <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-pill bg-black/50 px-3 py-1 text-sm text-white">{selected + 1} / {images.length}</span>
            </>
          )}
          <div className="flex max-h-full max-w-full items-center justify-center overflow-auto" onClick={e => e.stopPropagation()}>
            <img src={imgUrl(main)} alt={product.title} onClick={() => setZoom(z => (z > 1 ? 1 : 2))}
              style={{ transform: `scale(${zoom})`, transition: 'transform .2s', maxWidth: '92vw', maxHeight: '86vh', objectFit: 'contain', cursor: zoom > 1 ? 'zoom-out' : 'zoom-in' }} />
          </div>
        </div>
      )}

      <div className="mx-auto max-w-content px-4 sm:px-6">
        <nav aria-label="Đường dẫn" className="flex items-center gap-1 overflow-x-auto py-3 text-[13px] text-ink-faint no-scrollbar">
          <Link href="/" className="shrink-0 hover:text-forest-700">Trang chủ</Link>
          <i className="ri-arrow-right-s-line" aria-hidden="true" />
          <Link href={meta.listHref} className="shrink-0 hover:text-forest-700">{meta.label}</Link>
          <i className="ri-arrow-right-s-line" aria-hidden="true" />
          <span className="truncate text-ink-soft">{product.title}</span>
        </nav>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-8">
          {/* ── Gallery ── */}
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-line bg-forest-50 sm:aspect-[16/11]">
              {main ? (
                <button type="button" onClick={() => { setLightbox(true); setZoom(1); }} className="block h-full w-full cursor-zoom-in" aria-label="Xem ảnh lớn">
                  <img src={imgUrl(main)} alt={product.title} className="h-full w-full object-cover" />
                </button>
              ) : (
                <div className="grid h-full w-full place-items-center text-forest-300"><i className={`${meta.icon} text-6xl`} /></div>
              )}
              {product.isVip && (
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-gold-500 px-2.5 py-1 text-xs font-extrabold text-ink"><i className="ri-vip-crown-fill" aria-hidden="true" /> Nổi bật</span>
              )}
              <div className="absolute right-3 top-3 flex gap-2">
                <button onClick={handleLike} aria-label={liked ? 'Bỏ lưu tin' : 'Lưu tin'} aria-pressed={liked} className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink-soft shadow-card backdrop-blur transition hover:scale-105">
                  <i className={`${liked ? 'ri-heart-fill text-brand-500' : 'ri-heart-line'} text-xl`} />
                </button>
                <button onClick={handleShare} aria-label="Chia sẻ" className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink-soft shadow-card backdrop-blur transition hover:scale-105">
                  <i className="ri-share-forward-line text-xl" />
                </button>
              </div>
              {images.length > 1 && (
                <>
                  <button onClick={() => step(-1)} aria-label="Ảnh trước" className="absolute left-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-card"><i className="ri-arrow-left-s-line text-xl text-ink" /></button>
                  <button onClick={() => step(1)} aria-label="Ảnh sau" className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-card"><i className="ri-arrow-right-s-line text-xl text-ink" /></button>
                  <span className="absolute bottom-3 right-3 rounded-pill bg-black/55 px-2.5 py-0.5 text-xs font-semibold text-white">{selected + 1}/{images.length}</span>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="no-scrollbar mt-2.5 flex gap-2 overflow-x-auto pb-1">
                {images.map((im: any, i: number) => (
                  <button key={i} onClick={() => setSelected(i)} aria-label={`Ảnh ${i + 1}`} aria-current={selected === i}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition ${selected === i ? 'border-forest-600' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                    <img src={imgUrl(im)} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className="space-y-4">
            <div className="card p-4 sm:p-5">
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-forest-100 px-3 py-1 text-xs font-bold text-forest-700"><i className={meta.icon} aria-hidden="true" />{meta.label}</span>
              <h1 className="mt-2.5 break-words text-[1.4rem] font-extrabold leading-snug text-ink sm:text-3xl">{product.title}</h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-faint">
                {product.location && <span><i className="ri-map-pin-line" aria-hidden="true" /> {product.location}</span>}
                {product.createdAt && <span><i className="ri-time-line" aria-hidden="true" /> {timeAgo(product.createdAt)}</span>}
                {product.viewCount !== undefined && <span><i className="ri-eye-line" aria-hidden="true" /> {product.viewCount} lượt xem</span>}
                {likeCount > 0 && <span><i className="ri-heart-line" aria-hidden="true" /> {likeCount} lượt lưu</span>}
              </p>

              <p className="mt-4 text-[2rem] font-extrabold leading-none tabular-nums text-forest-700">
                {Number(product.price) > 0 ? money(product.price) : 'Thỏa thuận'}
                {Number(product.price) > 0 && product.unit && <span className="ml-1.5 text-base font-semibold text-ink-faint">/{product.unit}</span>}
              </p>

              {!isDichVu && !isVatNuoi && Number(product.price) > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-paper px-3.5 py-3">
                  <span className="text-[13px] font-semibold text-ink-soft">Tạm tính cho</span>
                  <div className="flex items-center">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} aria-label="Giảm" className="grid h-9 w-9 place-items-center rounded-l-xl border border-line bg-white hover:bg-forest-50"><i className="ri-subtract-line" /></button>
                    <input type="number" min={1} value={quantity} aria-label="Số lượng" onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="h-9 w-16 border-y border-line bg-white text-center text-sm font-bold text-ink focus:outline-none" />
                    <button onClick={() => setQuantity(q => q + 1)} aria-label="Tăng" className="grid h-9 w-9 place-items-center rounded-r-xl border border-line bg-white hover:bg-forest-50"><i className="ri-add-line" /></button>
                  </div>
                  <span className="text-[13px] text-ink-faint">{product.unit || 'đơn vị'}</span>
                  <span className="ml-auto text-lg font-extrabold tabular-nums text-ink">{money(product.price * quantity)}</span>
                </div>
              )}

              {/* Desktop contact buttons (phones use the bar fixed at the bottom) */}
              {!isOwner ? (
                <div className="mt-4 hidden gap-2 md:flex">
                  {num && <a href={`tel:${num}`} className="btn-forest flex-1 py-3"><i className="ri-phone-fill" aria-hidden="true" /> Gọi {phone}</a>}
                  {num && <a href={`https://zalo.me/${num}`} target="_blank" rel="noopener noreferrer" className="btn-ghost flex-1 py-3"><i className="ri-chat-smile-3-line" aria-hidden="true" /> Zalo</a>}
                  <button onClick={handleChat} className={`${num ? 'btn-ghost' : 'btn-forest'} flex-1 py-3`}><i className="ri-message-3-line" aria-hidden="true" /> Nhắn tin</button>
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  <p className="flex items-center gap-2 rounded-xl bg-forest-50 px-4 py-3 text-sm font-semibold text-forest-800"><i className="ri-store-2-line" aria-hidden="true" /> Đây là tin của bạn</p>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/products/${productId}/edit`} className="btn-ghost flex-1"><i className="ri-edit-line" aria-hidden="true" /> Sửa tin</Link>
                    {!product.isVip ? (
                      <button onClick={handleBuyVip} disabled={buyingVip} className="btn flex-1 bg-gold-500 text-ink hover:bg-gold-600 disabled:opacity-50"><i className="ri-vip-crown-fill" aria-hidden="true" /> {buyingVip ? 'Đang xử lý...' : 'Đẩy tin nổi bật'}</button>
                    ) : (
                      <span className="btn flex-1 border border-gold-200 bg-gold-50 text-gold-700"><i className="ri-vip-crown-fill" aria-hidden="true" /> Đang nổi bật</span>
                    )}
                    <button onClick={handleDelete} disabled={deleting} aria-label="Xóa tin" className="btn border border-brand-200 bg-white text-brand-600 hover:bg-brand-50 disabled:opacity-50"><i className="ri-delete-bin-line" aria-hidden="true" /></button>
                  </div>
                </div>
              )}
            </div>

            {/* Seller */}
            {product.user && (
              <div className="card flex items-center gap-3 p-4">
                {product.user.avatar ? (
                  <img src={product.user.avatar} alt="" className="h-12 w-12 rounded-full border border-line object-cover" />
                ) : (
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-forest-100 text-lg font-extrabold uppercase text-forest-700" aria-hidden="true">{(product.user.fullName || 'U').charAt(0)}</span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] text-ink-faint">Người bán</p>
                  <Link href={`/profile/${product.user.id}`} className="block truncate text-[15px] font-bold text-ink hover:text-forest-700">{product.user.fullName}</Link>
                  <p className="truncate text-[12px] text-ink-faint"><i className="ri-map-pin-line" aria-hidden="true" /> {product.user.location || 'Nhân Cơ, Đắk Nông'}</p>
                </div>
                <Link href={`/profile/${product.user.id}`} className="btn-ghost shrink-0 px-4 py-2 text-[13px]">Xem trang</Link>
              </div>
            )}

            {/* Safety */}
            <div className="rounded-card border border-gold-200 bg-gold-50 p-4">
              <p className="flex items-center gap-2 text-[14px] font-bold text-gold-800"><i className="ri-shield-check-fill text-lg" aria-hidden="true" /> Mua bán an toàn</p>
              <ul className="mt-2 space-y-1 text-[13px] leading-snug text-gold-900/80">
                <li>Gặp trực tiếp và xem hàng trước khi trả tiền.</li>
                <li>Không chuyển tiền đặt cọc cho người chưa gặp mặt.</li>
                <li>Không đọc mã OTP hay gửi ảnh thẻ ngân hàng cho bất kỳ ai.</li>
              </ul>
              <Link href="/canh-bao" className="mt-2 inline-block text-[13px] font-bold text-brand-600 hover:underline">Báo cáo tin có dấu hiệu lừa đảo</Link>
            </div>
          </div>
        </div>

        {/* Details */}
        <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-8">
          <div className="card p-4 sm:p-6">
            <h2 className="text-lg font-extrabold text-ink">Mô tả chi tiết</h2>
            {product.description ? (
              <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-ink-soft">{product.description}</p>
            ) : (
              <p className="mt-3 text-sm text-ink-faint">Người bán chưa viết mô tả.</p>
            )}
          </div>
          <div className="card p-4 sm:p-6">
            <h2 className="text-lg font-extrabold text-ink">Thông tin nhanh</h2>
            <dl className="mt-3 divide-y divide-line text-[14px]">
              {facts.map(f => (
                <div key={f.label} className="flex justify-between gap-4 py-2.5">
                  <dt className="text-ink-faint">{f.label}</dt>
                  <dd className="text-right font-semibold text-ink">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {more.length > 0 && (
          <section className="mt-8" aria-label="Tin tương tự">
            <h2 className="mb-4 text-xl font-extrabold text-ink">Tin tương tự</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {more.map((p: any) => <ListingCard key={p.id} item={p} type="product" />)}
            </div>
          </section>
        )}

        <div className="mt-8 space-y-5">
          <CommentSection targetType="PRODUCT" targetId={productId} />
          <ReviewSection productId={productId} sellerId={product.user?.id || ''} />
        </div>
      </div>

      {!isOwner && product.user && <ContactBar phone={phone} onChat={handleChat} />}
    </div>
  );
}
