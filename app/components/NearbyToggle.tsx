'use client';

import { useState, useEffect } from 'react';
import {
  getUserLocation,
  captureUserLocation,
  clearUserLocation,
  type UserLocation,
} from '../../lib/userLocation';

type Props = {
  /** Active state — controlled by parent so it can apply the filter */
  active: boolean;
  onChange: (active: boolean) => void;
  className?: string;
};

/**
 * Reusable inline cluster: a 'Vị trí của tôi' status pill + a 'Gần bạn'
 * filter toggle. Both share the same global localStorage GPS state via
 * lib/userLocation, so updating GPS here also updates /products etc.
 */
export default function NearbyToggle({ active, onChange, className = '' }: Props) {
  const [userLoc, setUserLoc] = useState<UserLocation | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    setUserLoc(getUserLocation());
    const handler = () => setUserLoc(getUserLocation());
    window.addEventListener('userLocation:changed', handler);
    return () => window.removeEventListener('userLocation:changed', handler);
  }, []);

  async function updateGPS() {
    setLocating(true);
    const loc = await captureUserLocation();
    setLocating(false);
    if (!loc) alert('Không lấy được vị trí. Vui lòng kiểm tra quyền GPS trong trình duyệt.');
  }

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {/* GPS status / capture */}
      <button
        type="button"
        onClick={userLoc ? clearUserLocation : updateGPS}
        disabled={locating}
        title={userLoc ? `Vị trí của bạn: ${userLoc.latitude.toFixed(3)}, ${userLoc.longitude.toFixed(3)}` : 'Chia sẻ GPS để xem khoảng cách'}
        className={`flex items-center gap-1 px-2.5 py-1 rounded text-[12px] font-medium transition-colors ${
          userLoc
            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
            : 'bg-stone-100 text-gray-700 hover:bg-stone-200'
        } disabled:opacity-50`}
      >
        <i className={`${locating ? 'ri-loader-4-line animate-spin' : userLoc ? 'ri-map-pin-2-fill' : 'ri-map-pin-line'}`}></i>
        {locating ? 'Đang lấy...' : userLoc ? 'Đã có GPS' : 'Vị trí của tôi'}
      </button>

      {/* Nearby filter — only enabled when GPS is set */}
      <button
        type="button"
        disabled={!userLoc}
        onClick={() => onChange(!active)}
        title={userLoc ? 'Lọc tin trong bán kính 30km' : 'Cần GPS để dùng bộ lọc này'}
        className={`flex items-center gap-1 px-2.5 py-1 rounded text-[12px] font-medium transition-colors ${
          active
            ? 'bg-emerald-700 text-white'
            : 'bg-stone-100 text-gray-700 hover:bg-stone-200'
        } disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <i className="ri-navigation-line"></i>
        Gần bạn
      </button>
    </div>
  );
}
