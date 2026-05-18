import { ImageResponse } from 'next/og';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 14,
          background: 'linear-gradient(135deg, #16a34a, #15803d)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        {/* Roof */}
        <div style={{
          width: 0,
          height: 0,
          borderLeft: '20px solid transparent',
          borderRight: '20px solid transparent',
          borderBottom: '14px solid white',
          marginBottom: -2,
        }} />
        {/* Body */}
        <div style={{
          width: 34,
          height: 20,
          background: 'white',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingBottom: 0,
        }}>
          {/* Door */}
          <div style={{
            width: 12,
            height: 13,
            background: '#16a34a',
            borderRadius: '3px 3px 0 0',
          }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
