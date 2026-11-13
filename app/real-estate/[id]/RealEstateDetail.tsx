'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { realEstate } from '../../../lib/api';
import CommentSection from '../../../components/CommentSection';
import ContactBar from '../../components/ContactBar';
import ListingCard from '../../components/ListingCard';
import Gallery from '../../components/detail/Gallery';
import { Breadcrumb, ContactButtons, DetailSkeleton, Facts, NotFound, SafetyNote, SellerCard } from '../../components/detail/Blocks';
import { useCurrentUserId, useStartChat, useToast } from '../../components/detail/hooks';
import { shortMoney, timeAgo } from '../../../lib/format';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://cho-nhan-co-backend.onrender.com/api';

const TYPE_LABEL: Record<string, string> = { NHA_O: 'Nhà ở', DAT_NEN: 'Đất nền', PHONG_TRO: 'Phòng trọ', MAT_BANG: 'Mặt bằng kinh doanh' };
const STATUS_LABEL: Record<string, string> = { NEW: 'Mới đăng', TRADING: 'Đang giao dịch', COMPLETED: 'Đã hoàn tất', PAUSED: 'Tạm dừng' };

export default function RealEstateDetail({ propertyId, initialItem }: { propertyId: string; initialItem?: any }) {
  const [item, setItem] = useState<any>(initialItem || null);
  const [loading, setLoading] = useState(!initialItem);
  const [similar, setSimilar] = useState<any[]>([]);
  const [liked, setLiked] = useState(false);
  const currentUserId = useCurrentUserId();
  const { notify, toast } = useToast();
  const chat = useStartChat(item?.user?.id, notify);

  useEffect(() => {
    if (!initialItem) {
      realEstate.getOne(propertyId)
        .then(data => setItem(data))
        .catch(() => setItem(null))
        .finally(() => setLoading(false));
    }
    try { setLiked((JSON.parse(localStorage.getItem('liked_items') || '[]') as string[]).includes(propertyId)); } catch {}
  }, [propertyId, initialItem]);

  useEffect(() => {
    if (!item?.type) return;
    let cancelled = false;
    fetch(`${API}/real-estates?type=${item.type}&limit=9`)
      .then(r => r.json())
      .then(res => { if (!cancelled) setSimilar((res.data || []).filter((p: any) => String(p.id) !== String(propertyId)).slice(0, 8)); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [item?.type, propertyId]);

  if (loading) return <DetailSkeleton />;
  if (!item) return <NotFound what="tin nhà đất" href="/real-estate" label="Xem các tin khác" />;

  const isOwner = !!currentUserId && item.user?.id === currentUserId;
  const price = Number(item.price);
  const area = Number(item.area);
  const phone = item.contactPhone || item.user?.phone || '';
  const history: any[] = item.priceHistory || [];
  const mapUrl = typeof item.latitude === 'number' && typeof item.longitude === 'number'
    ? `https://www.google.com/maps?q=${item.latitude},${item.longitude}` : '';

  const handleLike = () => {
    try {
      const ids: string[] = JSON.parse(localStorage.getItem('liked_items') || '[]');
      const now = !ids.includes(propertyId);
      localStorage.setItem('liked_items', JSON.stringify(now ? [...ids, propertyId] : ids.filter(x => x !== propertyId)));
      setLiked(now);
    } catch {}
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) { try { await navigator.share({ title: item.title, url }); } catch {} }
    else { try { await navigator.clipboard.writeText(url); notify('Đã sao chép liên kết'); } catch { notify('Không sao chép được liên kết'); } }
  };

  return (
    <div className="pb-6">
      {toast}
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <Breadcrumb trail={[{ label: 'Trang chủ', href: '/' }, { label: 'Nhà đất', href: '/real-estate' }, { label: item.title }]} />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-8">
          <Gallery images={item.images || []} title={item.title} icon="ri-home-4-line" badge={item.isVip ? 'Nổi bật' : undefined} liked={liked} onLike={handleLike} onShare={handleShare} />

          <div className="space-y-4">
            <div className="card p-4 sm:p-5">
              <p className="text-[13px] font-semibold text-forest-700">{TYPE_LABEL[item.type] || item.type}{STATUS_LABEL[item.status] ? ` · ${STATUS_LABEL[item.status]}` : ''}</p>
              <h1 className="mt-1.5 break-words text-[1.4rem] font-bold leading-snug text-ink sm:text-3xl">{item.title}</h1>
              <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-faint">
                {item.address && <span><i className="ri-map-pin-line" aria-hidden="true" /> {item.address}</span>}
                {item.createdAt && <span>{timeAgo(item.createdAt)}</span>}
                {item.viewCount !== undefined && <span>{item.viewCount} lượt xem</span>}
              </p>

              <p className="mt-4 text-[2rem] font-bold leading-none tabular-nums text-forest-700">{price > 0 ? shortMoney(price) : 'Thỏa thuận'}</p>
              {price > 0 && area > 0 && (
                <p className="mt-1.5 text-[13px] text-ink-faint">{area.toLocaleString('vi-VN')} m² · khoảng {shortMoney(Math.round(price / area))}/m²</p>
              )}

              {!isOwner ? (
                <ContactButtons phone={phone} onChat={chat} chatLabel="Nhắn tin người đăng" />
              ) : (
                <div className="mt-4 space-y-2">
                  <p className="rounded-lg bg-forest-50 px-4 py-3 text-sm font-semibold text-forest-800">Đây là tin của bạn</p>
                  <Link href={`/real-estate/${propertyId}/edit`} className="btn-ghost w-full"><i className="ri-edit-line" aria-hidden="true" /> Chỉnh sửa tin</Link>
                </div>
              )}
            </div>

            <SellerCard user={item.user} label="Người đăng tin" />
            <SafetyNote tips={[
              'Kiểm tra sổ đỏ, giấy tờ pháp lý và gặp chủ đất tại thực địa trước khi đặt cọc.',
              'Chỉ chuyển tiền khi có hợp đồng, tốt nhất công chứng tại cơ quan có thẩm quyền.',
              'Không đặt cọc cho người chỉ liên hệ qua tin nhắn.',
            ]} />
          </div>
        </div>

        <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-8">
          <div className="space-y-5">
            <div className="card p-4 sm:p-6">
              <h2 className="text-lg font-bold text-ink">Mô tả chi tiết</h2>
              {item.description
                ? <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">{item.description}</p>
                : <p className="mt-3 text-sm text-ink-faint">Người đăng chưa viết mô tả.</p>}
            </div>

            {history.length > 0 && (
              <div className="card p-4 sm:p-6">
                <h2 className="text-lg font-bold text-ink">Lịch sử thay đổi giá</h2>
                <table className="mt-3 w-full text-[14px]">
                  <thead><tr className="border-b border-line text-left text-[12px] text-ink-faint"><th className="py-2 font-medium">Ngày</th><th className="py-2 text-right font-medium">Giá</th></tr></thead>
                  <tbody className="divide-y divide-line">
                    <tr><td className="py-2.5 text-ink-soft">Hiện tại</td><td className="py-2.5 text-right font-bold tabular-nums text-forest-700">{shortMoney(price)}</td></tr>
                    {history.map((h, i) => (
                      <tr key={i}>
                        <td className="py-2.5 text-ink-soft">{new Date(h.changedAt).toLocaleDateString('vi-VN')}</td>
                        <td className="py-2.5 text-right tabular-nums text-ink">{shortMoney(Number(h.price))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <Facts items={[
              { label: 'Loại', value: TYPE_LABEL[item.type] || item.type },
              { label: 'Diện tích', value: area > 0 ? `${area.toLocaleString('vi-VN')} m²` : '' },
              { label: 'Giá mỗi m²', value: price > 0 && area > 0 ? `${shortMoney(Math.round(price / area))}/m²` : '' },
              { label: 'Pháp lý', value: item.legalStatus || '' },
              { label: 'Tình trạng', value: STATUS_LABEL[item.status] || '' },
              { label: 'Địa chỉ', value: item.address || '' },
            ]} />
            {mapUrl && (
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost w-full"><i className="ri-map-pin-2-line" aria-hidden="true" /> Xem vị trí trên bản đồ</a>
            )}
          </div>
        </section>

        {similar.length > 0 && (
          <section className="mt-8" aria-label="Tin tương tự">
            <h2 className="mb-3 border-b border-line pb-2 text-xl font-bold text-ink">Tin tương tự</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {similar.map((p: any) => <ListingCard key={p.id} item={p} type="real-estate" />)}
            </div>
          </section>
        )}

        <div className="mt-8"><CommentSection targetType="REAL_ESTATE" targetId={propertyId} /></div>
      </div>

      {!isOwner && item.user && <ContactBar phone={phone} onChat={chat} />}
    </div>
  );
}
