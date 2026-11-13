'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { products as productsApi, wallet as walletApi } from '../../../lib/api';
import CommentSection from '../../../components/CommentSection';
import ReviewSection from '../../../components/ReviewSection';
import ContactBar from '../../components/ContactBar';
import ListingCard from '../../components/ListingCard';
import Gallery from '../../components/detail/Gallery';
import { Breadcrumb, ContactButtons, DetailSkeleton, Facts, NotFound, SafetyNote, SellerCard } from '../../components/detail/Blocks';
import { useCurrentUserId, useStartChat, useToast } from '../../components/detail/hooks';
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

interface ProductDetailProps {
  productId: string;
  initialProduct?: any;
}

export default function ProductDetail({ productId, initialProduct }: ProductDetailProps) {
  const router = useRouter();
  const [product, setProduct] = useState<any>(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialProduct?.likeCount || 0);
  const [deleting, setDeleting] = useState(false);
  const [buyingVip, setBuyingVip] = useState(false);
  const [more, setMore] = useState<any[]>([]);
  const currentUserId = useCurrentUserId();
  const { notify, toast } = useToast();
  const chat = useStartChat(product?.user?.id, notify);

  useEffect(() => {
    if (!initialProduct) {
      fetch(`${API}/products/${productId}`)
        .then(r => (r.ok ? r.json() : null))
        .then(data => { setProduct(data); setLikeCount(data?.likeCount || 0); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
    try { setLiked((JSON.parse(localStorage.getItem('liked_items') || '[]') as string[]).includes(productId)); } catch {}
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

  if (loading) return <DetailSkeleton />;
  if (!product) return <NotFound what="tin này" href="/products" label="Xem các tin khác" />;

  const meta = CATEGORY_META[product.category] || DEFAULT_META;
  const isOwner = !!currentUserId && currentUserId === product.userId;
  const isVatNuoi = product.category === 'VAT_NUOI';
  const isDichVu = product.category === 'DICH_VU';
  const phone = product.contactPhone || product.user?.phone || '';
  const stock = product.stock ?? product.quantity;
  const hasPrice = Number(product.price) > 0;

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
    if (navigator.share) { try { await navigator.share({ title: product.title, url }); } catch {} }
    else { try { await navigator.clipboard.writeText(url); notify('Đã sao chép liên kết'); } catch { notify('Không sao chép được liên kết'); } }
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
      setProduct(await fetch(`${API}/products/${productId}`).then(r => r.json()));
    } catch (e: any) {
      notify(e.message || 'Không mua được VIP');
    } finally {
      setBuyingVip(false);
    }
  };

  return (
    <div className="pb-6">
      {toast}
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <Breadcrumb trail={[{ label: 'Trang chủ', href: '/' }, { label: meta.label, href: meta.listHref }, { label: product.title }]} />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-8">
          <Gallery images={product.images || []} title={product.title} icon={meta.icon} badge={product.isVip ? 'Nổi bật' : undefined} liked={liked} onLike={handleLike} onShare={handleShare} />

          <div className="space-y-4">
            <div className="card p-4 sm:p-5">
              <p className="text-[13px] font-semibold text-forest-700">{meta.label}</p>
              <h1 className="mt-1.5 break-words text-[1.4rem] font-bold leading-snug text-ink sm:text-3xl">{product.title}</h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-faint">
                {product.location && <span><i className="ri-map-pin-line" aria-hidden="true" /> {product.location}</span>}
                {product.createdAt && <span>{timeAgo(product.createdAt)}</span>}
                {product.viewCount !== undefined && <span>{product.viewCount} lượt xem</span>}
                {likeCount > 0 && <span>{likeCount} lượt lưu</span>}
              </p>

              <p className="mt-4 text-[2rem] font-bold leading-none tabular-nums text-forest-700">
                {hasPrice ? money(product.price) : 'Thỏa thuận'}
                {hasPrice && product.unit && <span className="ml-1.5 text-base font-medium text-ink-faint">/{product.unit}</span>}
              </p>

              {!isDichVu && !isVatNuoi && hasPrice && (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-paper px-3.5 py-3">
                  <span className="text-[13px] text-ink-soft">Tạm tính cho</span>
                  <div className="flex items-center">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} aria-label="Giảm" className="grid h-9 w-9 place-items-center rounded-l-lg border border-line bg-white hover:bg-forest-50"><i className="ri-subtract-line" /></button>
                    <input type="number" min={1} value={quantity} aria-label="Số lượng" onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="h-9 w-16 border-y border-line bg-white text-center text-sm font-bold text-ink focus:outline-none" />
                    <button onClick={() => setQuantity(q => q + 1)} aria-label="Tăng" className="grid h-9 w-9 place-items-center rounded-r-lg border border-line bg-white hover:bg-forest-50"><i className="ri-add-line" /></button>
                  </div>
                  <span className="text-[13px] text-ink-faint">{product.unit || 'đơn vị'}</span>
                  <span className="ml-auto text-lg font-bold tabular-nums text-ink">{money(product.price * quantity)}</span>
                </div>
              )}

              {!isOwner ? (
                <ContactButtons phone={phone} onChat={chat} />
              ) : (
                <div className="mt-4 space-y-2">
                  <p className="rounded-lg bg-forest-50 px-4 py-3 text-sm font-semibold text-forest-800">Đây là tin của bạn</p>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/products/${productId}/edit`} className="btn-ghost flex-1"><i className="ri-edit-line" aria-hidden="true" /> Sửa tin</Link>
                    {!product.isVip ? (
                      <button onClick={handleBuyVip} disabled={buyingVip} className="btn flex-1 bg-gold-500 text-ink hover:bg-gold-600 disabled:opacity-50">{buyingVip ? 'Đang xử lý...' : 'Đẩy tin nổi bật'}</button>
                    ) : (
                      <span className="btn flex-1 border border-gold-200 bg-gold-50 text-gold-700">Đang nổi bật</span>
                    )}
                    <button onClick={handleDelete} disabled={deleting} aria-label="Xóa tin" className="btn border border-brand-200 bg-white text-brand-600 hover:bg-brand-50 disabled:opacity-50"><i className="ri-delete-bin-line" aria-hidden="true" /></button>
                  </div>
                </div>
              )}
            </div>

            <SellerCard user={product.user} label="Người bán" />
            <SafetyNote />
          </div>
        </div>

        <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-8">
          <div className="card p-4 sm:p-6">
            <h2 className="text-lg font-bold text-ink">Mô tả chi tiết</h2>
            {product.description
              ? <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-ink-soft">{product.description}</p>
              : <p className="mt-3 text-sm text-ink-faint">Người bán chưa viết mô tả.</p>}
          </div>
          <Facts items={[
            { label: 'Loại tin', value: meta.label },
            { label: isVatNuoi ? 'Số con còn' : 'Số lượng còn', value: stock ? `${stock}${isVatNuoi ? ' con' : product.unit ? ' ' + product.unit : ''}` : '' },
            { label: 'Đơn vị', value: product.unit && !isVatNuoi ? product.unit : '' },
            { label: 'Khu vực', value: product.location || '' },
            { label: 'Đăng', value: product.createdAt ? timeAgo(product.createdAt) : '' },
          ]} />
        </section>

        {more.length > 0 && (
          <section className="mt-8" aria-label="Tin tương tự">
            <h2 className="mb-3 border-b border-line pb-2 text-xl font-bold text-ink">Tin tương tự</h2>
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

      {!isOwner && product.user && <ContactBar phone={phone} onChat={chat} />}
    </div>
  );
}
