'use client';

import { useState } from 'react';

type Props = {
  value: { latitude?: number | null; longitude?: number | null };
  onChange: (coords: { latitude: number | null; longitude: number | null }) => void;
  /** Label for the "get my location" action */
  label?: string;
  /** Subtitle hint, shown under the button */
  hint?: string;
};

/**
 * Captures the user's GPS coordinates via the Geolocation API and reports
 * lat/lng up to the parent. Works on any HTTPS page (required by browsers).
 * Shows captured status, error messages, and a 'remove' option.
 */
export default function GPSLocationPicker({
  value,
  onChange,
  label = 'Lấy vị trí GPS của tôi',
  hint = 'Giúp người mua thấy bài đăng gần họ hơn. Vị trí chỉ dùng để tính khoảng cách, không lộ địa chỉ cụ thể.',
}: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const hasGPS = typeof value.latitude === 'number' && typeof value.longitude === 'number';

  function capture() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('error');
      setError('Trình duyệt của bạn không hỗ trợ định vị');
      return;
    }
    setStatus('loading');
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        });
        setStatus('idle');
      },
      (err) => {
        setStatus('error');
        if (err.code === err.PERMISSION_DENIED) {
          setError('Bạn đã từ chối chia sẻ vị trí. Vào cài đặt trình duyệt để bật lại.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError('Không lấy được tín hiệu GPS. Hãy thử ra khu vực thoáng hơn.');
        } else if (err.code === err.TIMEOUT) {
          setError('Quá thời gian chờ. Vui lòng thử lại.');
        } else {
          setError('Không thể lấy vị trí. Vui lòng thử lại.');
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  }

  function clear() {
    onChange({ latitude: null, longitude: null });
    setStatus('idle');
    setError(null);
  }

  return (
    <div className="space-y-2">
      {hasGPS ? (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2.5">
          <i className="ri-map-pin-2-fill text-emerald-700"></i>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-emerald-900">Đã lưu vị trí GPS</p>
            <p className="text-[11px] text-emerald-700 font-mono">
              {value.latitude!.toFixed(5)}, {value.longitude!.toFixed(5)}
            </p>
          </div>
          <button
            type="button"
            onClick={capture}
            className="text-[12px] font-semibold text-emerald-700 hover:underline"
          >
            Cập nhật lại
          </button>
          <button
            type="button"
            onClick={clear}
            aria-label="Xóa vị trí GPS"
            className="w-7 h-7 flex items-center justify-center text-emerald-700 hover:bg-emerald-100 rounded"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={capture}
          disabled={status === 'loading'}
          className="w-full flex items-center justify-center gap-2 border border-stone-300 hover:border-emerald-700 text-gray-700 hover:text-emerald-800 rounded-md px-3 py-2.5 text-[13px] font-semibold transition-colors disabled:opacity-50"
        >
          <i className={`${status === 'loading' ? 'ri-loader-4-line animate-spin' : 'ri-map-pin-add-line'} text-lg`}></i>
          {status === 'loading' ? 'Đang lấy vị trí...' : label}
        </button>
      )}

      {status === 'error' && error && (
        <p className="text-[12px] text-red-600 flex items-start gap-1.5">
          <i className="ri-error-warning-line mt-0.5 flex-shrink-0"></i>
          <span>{error}</span>
        </p>
      )}

      {!hasGPS && status !== 'error' && hint && (
        <p className="text-[11.5px] text-gray-500 leading-relaxed">{hint}</p>
      )}
    </div>
  );
}
