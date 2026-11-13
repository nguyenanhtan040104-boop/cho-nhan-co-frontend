'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ListingCard from './ListingCard';
import { products as productsApi } from '../../lib/api';
import { getUserLocation, captureUserLocation, distanceKm, formatDistance, type UserLocation } from '../../lib/userLocation';

const RADIUS_KM = 30;

// "Gần bạn" on the home page: asks for the visitor's location once, then lists nearby listings.
export default function NearbySection() {
  const [loc, setLoc] = useState<UserLocation | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [asking, setAsking] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    setLoc(getUserLocation());
    const onChange = () => setLoc(getUserLocation());
    window.addEventListener('userLocation:changed', onChange);
    return () => window.removeEventListener('userLocation:changed', onChange);
  }, []);

  useEffect(() => {
    if (!loc) { setItems([]); return; }
    let cancelled = false;
    setLoading(true);
    productsApi
      .getAll({ nearLat: loc.latitude, nearLng: loc.longitude, radiusKm: RADIUS_KM, sortBy: 'newest', limit: 5 } as any)
      .then((res: any) => { if (!cancelled) setItems(res.data || []); })
      .catch(() => { if (!cancelled) setItems([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [loc]);

  async function ask() {
    setAsking(true);
    setDenied(false);
    const got = await captureUserLocation();
    setAsking(false);
    if (!got) setDenied(true);
  }

  return (
    <section aria-label="Tin gần bạn">
      <div className="mb-3 flex items-baseline justify-between gap-4 border-b border-line pb-2">
        <h2 className="text-xl font-bold text-ink">
          Gần bạn
          <span className="ml-2 text-[13px] font-normal text-ink-faint">trong vòng {RADIUS_KM} km</span>
        </h2>
        {loc && <Link href="/products" className="whitespace-nowrap text-[14px] font-semibold text-forest-700 hover:underline">Xem tất cả</Link>}
      </div>

      {!loc ? (
        <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[14px] text-ink-soft">
            Cho phép xem vị trí để thấy hàng quanh nhà bạn, gần nhất hiện trước. Vị trí chỉ lưu trên máy của bạn.
            {denied && <span className="mt-1 block font-semibold text-brand-600">Chưa lấy được vị trí. Kiểm tra quyền vị trí của trình duyệt rồi thử lại.</span>}
          </p>
          <button onClick={ask} disabled={asking} className="btn-forest shrink-0 disabled:opacity-60">
            {asking ? 'Đang lấy vị trí...' : 'Bật vị trí của tôi'}
          </button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => <div key={i} className="aspect-[4/5] animate-pulse rounded-card bg-line" />)}
        </div>
      ) : items.length === 0 ? (
        <p className="rounded-card border border-line bg-surface px-5 py-5 text-[14px] text-ink-soft">
          Chưa có tin trong {RADIUS_KM} km quanh bạn. <Link href="/products" className="font-semibold text-forest-700 underline underline-offset-2">Xem toàn bộ tin</Link>
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((item) => {
            const d = typeof item.latitude === 'number' && typeof item.longitude === 'number'
              ? distanceKm(loc, { latitude: item.latitude, longitude: item.longitude })
              : null;
            return <ListingCard key={item.id} item={item} type="product" distanceLabel={d != null ? formatDistance(d) : undefined} />;
          })}
        </div>
      )}
    </section>
  );
}
