import { ImageResponse } from 'next/og';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

// Favicon: the awning over a "C", same mark as the logo.
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: 64, height: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#095F33', borderRadius: 14, position: 'relative' }}>
        <svg width="64" height="28" viewBox="0 0 64 28" style={{ position: 'absolute', top: 6, left: 0 }}>
          <path d="M8 0h16v8a8 8 0 0 1-16 0z" fill="#FFFFFF" />
          <path d="M24 0h16v8a8 8 0 0 1-16 0z" fill="#A6DDBC" />
          <path d="M40 0h16v8a8 8 0 0 1-16 0z" fill="#FFFFFF" />
        </svg>
        <div style={{ position: 'absolute', top: 24, display: 'flex', fontSize: 34, fontWeight: 700, color: '#FFFFFF' }}>C</div>
        <div style={{ position: 'absolute', top: 40, left: 40, width: 9, height: 9, borderRadius: 9, background: '#D23B27' }} />
      </div>
    ),
    { ...size },
  );
}
