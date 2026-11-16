import { ImageResponse } from 'next/og';

export const alt = 'Chợ Nhân Cơ, chợ của bà con Nhân Cơ, Đắk Nông';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const TITLE = 'Chợ Nhân Cơ';
const TAGLINE = 'Chợ của bà con Nhân Cơ, Đắk Nông';
const LINE = 'Nông sản · Nhà đất · Việc làm · Giá thị trường';

// The default image font has no Vietnamese diacritics, so fetch Be Vietnam Pro with only the glyphs we use.
async function loadFont(weight: number): Promise<ArrayBuffer | null> {
  try {
    const text = encodeURIComponent(TITLE + TAGLINE + LINE);
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@${weight}&text=${text}`)).text();
    const url = css.match(/src: url\(([^)]+)\) format\('(?:truetype|opentype)'\)/)?.[1];
    if (!url) return null;
    return await (await fetch(url)).arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const [bold, medium] = await Promise.all([loadFont(700), loadFont(500)]);
  const fonts: any[] = [];
  if (bold) fonts.push({ name: 'BeVietnam', data: bold, weight: 700, style: 'normal' });
  if (medium) fonts.push({ name: 'BeVietnam', data: medium, weight: 500, style: 'normal' });
  const family = fonts.length ? 'BeVietnam' : 'sans-serif';

  // Awning across the top: 12 stripes of 100px, scalloped lower edge
  const stripes = Array.from({ length: 12 }, (_, i) => {
    const x = i * 100;
    return <path key={i} d={`M${x} 0h100v34a50 50 0 0 1-100 0z`} fill={i % 2 === 0 ? '#0D7A41' : '#D2EEDD'} />;
  });

  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: 'flex', flexDirection: 'column', background: '#FFFFFF', fontFamily: family }}>
        <svg width="1200" height="90" viewBox="0 0 1200 90">{stripes}</svg>

        <div style={{ display: 'flex', alignItems: 'center', padding: '70px 90px 0 90px' }}>
          <div style={{ display: 'flex', width: 220, height: 220, background: '#095F33', borderRadius: 48, position: 'relative' }}>
            <svg width="220" height="90" viewBox="0 0 220 90" style={{ position: 'absolute', top: 30, left: 0 }}>
              <path d="M28 0h54v26a27 27 0 0 1-54 0z" fill="#FFFFFF" />
              <path d="M82 0h54v26a27 27 0 0 1-54 0z" fill="#A6DDBC" />
              <path d="M136 0h54v26a27 27 0 0 1-54 0z" fill="#FFFFFF" />
            </svg>
            <div style={{ position: 'absolute', top: 110, left: 0, width: 190, display: 'flex', justifyContent: 'center', fontSize: 82, fontWeight: 700, color: '#FFFFFF' }}>Cơ</div>
            <div style={{ position: 'absolute', top: 158, left: 168, width: 28, height: 28, borderRadius: 28, background: '#D23B27' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 70 }}>
            <div style={{ fontSize: 112, fontWeight: 700, color: '#222222', lineHeight: 1.05 }}>{TITLE}</div>
            <div style={{ fontSize: 44, fontWeight: 500, color: '#484848', marginTop: 18 }}>{TAGLINE}</div>
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 38, fontWeight: 500, color: '#0D7A41', padding: '70px 90px 0 90px' }}>{LINE}</div>
      </div>
    ),
    { ...size, fonts },
  );
}
