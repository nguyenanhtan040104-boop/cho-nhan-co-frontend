/**
 * Tiny helper for storing the current user's GPS location in localStorage
 * so feeds can show "X km away" badges. Used by category pages and any
 * "Gần bạn" filter. Re-asks for permission whenever the user clicks the
 * 'Cập nhật vị trí' button.
 */

const KEY = 'userLocation';

export type UserLocation = {
  latitude: number;
  longitude: number;
  capturedAt: number; // epoch ms
};

export function getUserLocation(): UserLocation | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.latitude === 'number' &&
      typeof parsed?.longitude === 'number' &&
      typeof parsed?.capturedAt === 'number'
    ) {
      return parsed as UserLocation;
    }
    return null;
  } catch {
    return null;
  }
}

export function setUserLocation(coords: { latitude: number; longitude: number }) {
  if (typeof window === 'undefined') return;
  const value: UserLocation = { ...coords, capturedAt: Date.now() };
  localStorage.setItem(KEY, JSON.stringify(value));
  // Tell any listeners on the page (cards, filters, etc.) to refresh distances
  window.dispatchEvent(new CustomEvent('userLocation:changed'));
}

export function clearUserLocation() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent('userLocation:changed'));
}

/**
 * Wrap navigator.geolocation in a promise. Returns null on error/denial.
 */
export function captureUserLocation(): Promise<UserLocation | null> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: UserLocation = {
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
          capturedAt: Date.now(),
        };
        setUserLocation(loc);
        resolve(loc);
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  });
}

/**
 * Haversine distance in km between two lat/lng points.
 */
export function distanceKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }): number {
  const R = 6371; // Earth radius km
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Format a km value into a short human-readable string.
 *   0.3 → '300m'
 *   1.2 → '1.2km'
 *   12.6 → '13km'
 *   105 → '105km'
 */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  if (km < 10) return `${km.toFixed(1).replace('.0', '')}km`;
  return `${Math.round(km)}km`;
}

/**
 * Reverse geocode a GPS coordinate to a Vietnamese-readable address using
 * OpenStreetMap Nominatim. Free, no API key required.
 *
 * Returns a short locality string like 'Xã Nhân Cơ, Huyện Đắk R'Lấp, Đắk Nông'.
 * Returns null on any failure (network, rate limit, malformed response).
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=vi&zoom=14`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return null;
    const data = await res.json();
    const a = data?.address || {};
    // Build a short locality: commune, district, province (skip street/house for privacy)
    const parts: string[] = [];
    const commune = a.village || a.suburb || a.hamlet || a.quarter || a.neighbourhood;
    const district = a.county || a.town || a.city_district || a.district;
    const province = a.state || a.province || a.region;
    if (commune) parts.push(commune);
    if (district) parts.push(district);
    if (province) parts.push(province);
    if (parts.length === 0 && data.display_name) {
      // Fallback: take first 3 comma-separated parts of display_name
      return data.display_name.split(',').slice(0, 3).map((s: string) => s.trim()).join(', ');
    }
    return parts.join(', ') || null;
  } catch {
    return null;
  }
}
