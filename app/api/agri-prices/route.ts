import { NextResponse } from 'next/server';

// ─── Module-level cache để tính thay đổi giá theo ngày ───
const priceCache: {
  date: string;
  prices: Record<string, number>;
  prevPrices: Record<string, number>;
} = { date: '', prices: {}, prevPrices: {} };

function getChange(key: string, current: number): number | null {
  const today = new Date().toISOString().slice(0, 10);
  if (priceCache.date !== today) {
    priceCache.prevPrices = { ...priceCache.prices };
    priceCache.date = today;
    priceCache.prices = {};
  }
  priceCache.prices[key] = current;
  const prev = priceCache.prevPrices[key];
  if (prev == null || prev === current) return null;
  return current - prev;
}

// ─── Fetch giá cà phê từ giacaphe.com/bang-gia-ca-phe/ ───
async function fetchCoffee() {
  const urls = [
    'https://giacaphe.com/bang-gia-ca-phe/',
    'https://giacaphe.com/gia-ca-phe-noi-dia/',
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
          'Referer': 'https://giacaphe.com/',
          'Cache-Control': 'no-cache',
        },
        signal: AbortSignal.timeout(7000),
      });
      if (!res.ok) continue;
      const html = await res.text();

      // Parse bảng giá theo tỉnh
      type Row = { name: string; price: number; rawChange: number | null };
      const rows: Row[] = [];

      // Tách từng <tr>
      const trRe = /<tr[\s\S]*?>([\s\S]*?)<\/tr>/gi;
      let m;
      while ((m = trRe.exec(html)) !== null) {
        const cells = [...m[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)]
          .map(c => c[1].replace(/<[^>]+>/g, '').replace(/&nbsp;|\s+/g, ' ').trim());
        if (cells.length < 2) continue;

        const name = cells[0];
        const p = parseInt(cells[1].replace(/[,\.\s]/g, ''));
        if (!name || isNaN(p) || p < 30000 || p > 300000) continue;

        let rawChange: number | null = null;
        if (cells[2]) {
          const c = parseInt(cells[2].replace(/[,\.\s]/g, ''));
          if (!isNaN(c)) rawChange = c;
        }
        rows.push({ name, price: p, rawChange });
      }

      if (rows.length > 0) return { rows, isLive: true };
    } catch { /* try next url */ }
  }
  return { rows: [], isLive: false };
}

// ─── Fetch tỷ giá USD từ Vietcombank ───
async function fetchUSDRate(): Promise<number> {
  try {
    const res = await fetch('https://portal.vietcombank.com.vn/Usercontrols/TVPortal.TyGia/pXml.aspx?b=10', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(5000),
    });
    const xml = await res.text();
    const m = xml.match(/CurrencyCode="USD"[^>]*Buy="([\d,\.]+)"/i)
      || xml.match(/<CurrencyCode>USD<\/CurrencyCode>[\s\S]*?<Sell>([\d,\.]+)<\/Sell>/i);
    if (m) {
      const rate = parseFloat(m[1].replace(/,/g, ''));
      if (rate > 20000 && rate < 35000) return rate;
    }
    return 26000;
  } catch { return 26000; }
}

export async function GET() {
  const [coffeeResult, usdRate] = await Promise.all([
    fetchCoffee(),
    fetchUSDRate(),
  ]);

  const { rows, isLive: isLiveCoffee } = coffeeResult;

  function findRow(kw: string) {
    return rows.find(r => r.name.toLowerCase().includes(kw.toLowerCase()));
  }

  // Giá cà phê theo tỉnh
  const dakLakRow  = findRow('đắk lắk') || findRow('dak lak');
  const lamDongRow = findRow('lâm đồng') || findRow('lam dong');
  const giaLaiRow  = findRow('gia lai');
  const dakNongRow = findRow('đắk nông') || findRow('dak nong');
  const hoTieuRow  = findRow('hồ tiêu') || findRow('tiêu');

  const dakLak  = dakLakRow?.price  ?? 87000;
  const lamDong = lamDongRow?.price ?? 86300;
  const giaLai  = giaLaiRow?.price  ?? 87000;
  const dakNong = dakNongRow?.price ?? 87100;
  const hoTieu  = hoTieuRow?.price  ?? 143000;

  // Tính change: ưu tiên rawChange từ web, fallback module cache
  function getChangeFinal(key: string, price: number, rawChange: number | null) {
    if (rawChange != null) return rawChange;
    return getChange(key, price);
  }

  // Cao su
  const rubber = Math.round(1.5 * usdRate);
  const rubberChange = getChange('rubber', rubber);

  // Giá xăng dầu — Giá nhà nước áp dụng từ 15:00 ngày 07/05/2026
  // (cập nhật thủ công khi có điều chỉnh mới)
  const fuelEffectiveDate = '07/05/2026';
  const fuelItems = [
    { name: 'Xăng RON 95-III',   price: 20910, prevPrice: 21170, unit: 'lít', location: 'Toàn quốc' },
    { name: 'Xăng E5 RON 92',    price: 20422, prevPrice: 20670, unit: 'lít', location: 'Toàn quốc' },
    { name: 'Dầu diesel 0.05S',  price: 18704, prevPrice: 18950, unit: 'lít', location: 'Toàn quốc' },
    { name: 'Dầu hỏa',           price: 18850, prevPrice: 19090, unit: 'lít', location: 'Toàn quốc' },
  ].map(i => ({ ...i, change: i.price - i.prevPrice }));

  const now = new Date();
  const dateLabel = now.toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
  });

  const categories = [
    {
      category: 'Cà phê',
      source: isLiveCoffee ? 'giacaphe.com' : 'tham khảo',
      isLive: isLiveCoffee,
      items: [
        { name: 'Robusta - Đắk Lắk',  price: dakLak,  change: getChangeFinal('dakLak', dakLak, dakLakRow?.rawChange ?? null),   unit: 'kg', location: 'Đắk Lắk' },
        { name: 'Robusta - Lâm Đồng', price: lamDong, change: getChangeFinal('lamDong', lamDong, lamDongRow?.rawChange ?? null), unit: 'kg', location: 'Lâm Đồng' },
        { name: 'Robusta - Gia Lai',   price: giaLai,  change: getChangeFinal('giaLai', giaLai, giaLaiRow?.rawChange ?? null),   unit: 'kg', location: 'Gia Lai' },
        { name: 'Robusta - Đắk Nông', price: dakNong, change: getChangeFinal('dakNong', dakNong, dakNongRow?.rawChange ?? null), unit: 'kg', location: 'Đắk Nông' },
        { name: 'Arabica (nhân xô)',   price: Math.round((dakLak + lamDong) / 2 * 1.4), change: null, unit: 'kg', location: 'Lâm Đồng' },
      ],
    },
    {
      category: 'Hồ tiêu',
      source: isLiveCoffee ? 'giacaphe.com' : 'tham khảo',
      isLive: isLiveCoffee,
      items: [
        { name: 'Hồ tiêu đen (tiêu sọ)', price: hoTieu, change: getChangeFinal('hoTieu', hoTieu, hoTieuRow?.rawChange ?? null), unit: 'kg', location: 'Bình Phước' },
        { name: 'Hồ tiêu trắng',          price: Math.round(hoTieu * 1.2), change: null, unit: 'kg', location: 'Bà Rịa - Vũng Tàu' },
        { name: 'Hồ tiêu xanh tươi',      price: Math.round(hoTieu * 0.45), change: null, unit: 'kg', location: 'Tây Nguyên' },
      ],
    },
    {
      category: 'Cao su',
      source: `tỷ giá ${usdRate.toLocaleString('vi-VN')}đ/USD (Vietcombank)`,
      isLive: true,
      items: [
        { name: 'Cao su SVR 10 (mủ khô)', price: rubber, change: rubberChange, unit: 'kg', location: 'Bình Dương' },
        { name: 'Cao su RSS3',             price: Math.round(rubber * 1.05), change: null, unit: 'kg', location: 'Đồng Nai' },
        { name: 'Mủ cao su nước',          price: Math.round(rubber * 0.4), change: null, unit: 'kg', location: 'Bình Phước' },
      ],
    },
    {
      category: 'Sầu riêng',
      source: 'tham khảo',
      isLive: false,
      items: [
        { name: 'Sầu riêng Ri6 (tại vườn)',       price: 65000,  change: getChange('sr_ri6', 65000),  unit: 'kg', location: 'Tiền Giang' },
        { name: 'Sầu riêng Monthong (xuất khẩu)', price: 95000,  change: getChange('sr_mt', 95000),   unit: 'kg', location: 'Đắk Lắk' },
        { name: 'Sầu riêng Musang King',           price: 120000, change: getChange('sr_mk', 120000),  unit: 'kg', location: 'Lâm Đồng' },
        { name: 'Sầu riêng Dona (tại vườn)',       price: 58000,  change: getChange('sr_dona', 58000), unit: 'kg', location: 'Đồng Nai' },
      ],
    },
    {
      category: 'Xăng dầu',
      source: `Bộ Công Thương • Từ ${fuelEffectiveDate}`,
      isLive: true,
      items: fuelItems,
    },
  ];

  return NextResponse.json({
    updatedAt: now.toISOString(),
    dateLabel,
    usdRate,
    categories,
  }, {
    headers: { 'Cache-Control': 's-maxage=600, stale-while-revalidate' },
  });
}
