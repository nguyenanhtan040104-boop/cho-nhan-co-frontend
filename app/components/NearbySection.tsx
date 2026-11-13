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
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-forest-100 text-forest-700">
            <i className="ri-map-pin-2-line text-xl" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold leading-tight text-ink">Gần bạn</h2>
            <p className="text-[13px] text-ink-faint">Tin trong vòng {RADIUS_KM} km quanh vị trí của bạn</p>
          </div>
        </div>
        {loc && (
          <Link href="/products" className="inline-flex items-center gap-0.5 whitespace-nowrap rounded-pill px-3 py-1.5 text-[13px] font-bold text-forest-700 transition hover:bg-forest-50">
            Xem tất cả <i className="ri-arrow-right-s-line text-base" aria-hidden="true" />
          </Link>
        )}
      </div>

      {!loc ? (
        <div className="flex flex-col items-start gap-3 rounded-card border border-dashed border-forest-300 bg-forest-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[14px] text-forest-800">
            Cho phép xem vị trí để thấy hàng của bà con quanh nhà, gần nhất hiện trước.
            {denied && <span className="mt-1 block text-[13px] font-semibold text-brand-600">Chưa lấy được vị trí. Bạn kiểm tra quyền vị trí (GPS) của trình duyệt rồi thử lại nhé.</span>}
          </p>
          <button onClick={ask} disabled={asking} className="btn-forest shrink-0 disabled:opacity-60">
            <i className={asking ? 'ri-loader-4-line animate-spin' : 'ri-focus-3-line'} aria-hidden="true" />
            {asking ? 'Đang lấy vị trí...' : 'Bật vị trí của tôi'}
          </button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => <div key={i} className="aspect-[4/5] animate-pulse rounded-card bg-forest-50" />)}
        </div>
      ) : items.length === 0 ? (
        <p className="rounded-card border border-line bg-surface px-5 py-6 text-center text-[14px] text-ink-soft">
          Chưa có tin trong {RADIUS_KM} km quanh bạn. <Link href="/products" className="font-bold text-forest-700 hover:underline">Xem toàn bộ tin</Link>
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
