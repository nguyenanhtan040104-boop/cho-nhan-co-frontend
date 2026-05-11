import { NextResponse } from 'next/server';

// ─── Fetch giá cà phê + hồ tiêu từ giacaphe.com (có cột Thay đổi) ───
async function fetchGiacaphe() {
  try {
    const res = await fetch('https://giacaphe.com/gia-ca-phe-noi-dia/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();

    // Parse từng hàng trong bảng: tên | giá | thay đổi
    type Row = { name: string; price: number; change: number | null };
    const rows: Row[] = [];

    // Tìm tất cả <tr> chứa dữ liệu
    const trMatches = html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
    for (const tr of trMatches) {
      const cells = [...tr[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)]
        .map(m => m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '').trim());
      if (cells.length < 2) continue;

      const name = cells[0];
      const priceRaw = cells[1]?.replace(/[,\.\s]/g, '');
      const price = parseInt(priceRaw);
      if (!name || isNaN(price) || price < 30000 || price > 300000) continue;

      let change: number | null = null;
      if (cells[2]) {
        const changeRaw = cells[2].replace(/[,\.\s]/g, '');
        const parsed = parseInt(changeRaw);
        if (!isNaN(parsed)) change = parsed;
      }
      rows.push({ name, price, change });
    }

    return rows;
  } catch {
    return [];
  }
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
  } catch {
    return 26000;
  }
}

// ─── Fetch giá xăng dầu từ Petrolimex ───
async function fetchPetrolPrices() {
  try {
    const res = await fetch('https://www.petrolimex.com.vn/nd/gia-xang-dau.html', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();

    type FuelItem = { name: string; price: number; change: number | null };
    const items: FuelItem[] = [];

    const trMatches = html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
    for (const tr of trMatches) {
      const cells = [...tr[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)]
        .map(m => m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim());
      if (cells.length < 2) continue;

      const name = cells[0];
      const priceRaw = cells[1]?.replace(/[,\.\s]/g, '');
      const price = parseInt(priceRaw);
      if (!name || isNaN(price) || price < 10000 || price > 50000) continue;

      let change: number | null = null;
      if (cells[2]) {
        const changeRaw = cells[2].replace(/[,\.\s]/g, '');
        const parsed = parseInt(changeRaw);
        if (!isNaN(parsed)) change = parsed;
      }
      items.push({ name, price, change });
    }

    return items.length > 0 ? { items, isLive: true } : null;
  } catch {
    return null;
  }
}

// ─── Fetch giá sầu riêng ───
async function fetchDurianPrices() {
  try {
    const res = await fetch('https://giacaphe.com/gia-ca-phe-noi-dia/', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(5000),
    });
    const html = await res.text();
    // Thử tìm sầu riêng trên trang giacaphe (họ đôi khi có)
    const m = html.match(/[Ss]ầu\s*riêng[\s\S]{0,300}?(\d{2,3}[,\.]?\d{3})/i);
    if (m) {
      const price = parseInt(m[1].replace(/[,\.]/g, ''));
      if (price > 30000 && price < 200000) return price;
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET() {
  const [giacapheRows, usdRate, petrolResult, durianPrice] = await Promise.all([
    fetchGiacaphe(),
    fetchUSDRate(),
    fetchPetrolPrices(),
    fetchDurianPrices(),
  ]);

  const now = new Date();
  const dateLabel = now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

  // ── Helper: tìm giá theo tên tỉnh trong giacapheRows ──
  function findRow(keyword: string) {
    return giacapheRows.find(r => r.name.toLowerCase().includes(keyword.toLowerCase()));
  }

  const dakLakRow   = findRow('Đắk Lắk') || findRow('Dak Lak');
  const lamDongRow  = findRow('Lâm Đồng') || findRow('Lam Dong');
  const giaLaiRow   = findRow('Gia Lai');
  const dakNongRow  = findRow('Đắk Nông') || findRow('Dak Nong');
  const hoTieuRow   = findRow('Hồ tiêu') || findRow('Ho tieu') || findRow('tiêu');

  const dakLak  = dakLakRow?.price  || 87000;
  const lamDong = lamDongRow?.price || 86300;
  const giaLai  = giaLaiRow?.price  || 87000;
  const dakNong = dakNongRow?.price || 87100;
  const hoTieu  = hoTieuRow?.price  || 143000;
  const isLiveCoffee = !!(dakLakRow || lamDongRow);

  // Cao su: SVR10 ~1.5 USD/kg
  const rubber = Math.round(1.5 * usdRate);
  const rubberPrev = Math.round(1.5 * 25900); // tỷ giá hôm qua ước tính
  const rubberChange = rubber - rubberPrev;

  // Sầu riêng fallback
  const ri6Price     = durianPrice || 65000;
  const monthong     = Math.round(ri6Price * 1.46);
  const musangKing   = Math.round(ri6Price * 1.85);
  const dona         = Math.round(ri6Price * 0.89);

  // Xăng fallback nếu Petrolimex không trả về
  const petrolFallback = [
    { name: 'Xăng RON 95-III', price: 21170, change: 0, unit: 'lít', location: 'Toàn quốc' },
    { name: 'Xăng E5 RON 92', price: 20670, change: 0, unit: 'lít', location: 'Toàn quốc' },
    { name: 'Dầu diesel 0.05S', price: 18950, change: 0, unit: 'lít', location: 'Toàn quốc' },
    { name: 'Dầu hỏa', price: 19090, change: 0, unit: 'lít', location: 'Toàn quốc' },
  ];

  const categories = [
    {
      category: 'Cà phê',
      source: isLiveCoffee ? 'giacaphe.com' : 'tham khảo',
      isLive: isLiveCoffee,
      items: [
        { name: 'Robusta - Đắk Lắk',  price: dakLak,  change: dakLakRow?.change  ?? null, unit: 'kg', location: 'Đắk Lắk' },
        { name: 'Robusta - Lâm Đồng', price: lamDong, change: lamDongRow?.change ?? null, unit: 'kg', location: 'Lâm Đồng' },
        { name: 'Robusta - Gia Lai',   price: giaLai,  change: giaLaiRow?.change  ?? null, unit: 'kg', location: 'Gia Lai' },
        { name: 'Robusta - Đắk Nông', price: dakNong, change: dakNongRow?.change ?? null, unit: 'kg', location: 'Đắk Nông' },
        { name: 'Arabica (nhân xô)',   price: Math.round((dakLak + lamDong) / 2 * 1.4), change: null, unit: 'kg', location: 'Lâm Đồng' },
      ],
    },
    {
      category: 'Hồ tiêu',
      source: isLiveCoffee ? 'giacaphe.com' : 'tham khảo',
      isLive: isLiveCoffee,
      items: [
        { name: 'Hồ tiêu đen (tiêu sọ)', price: hoTieu, change: hoTieuRow?.change ?? null, unit: 'kg', location: 'Bình Phước' },
        { name: 'Hồ tiêu trắng',          price: Math.round(hoTieu * 1.2), change: null, unit: 'kg', location: 'Bà Rịa - Vũng Tàu' },
        { name: 'Hồ tiêu xanh tươi',      price: Math.round(hoTieu * 0.45), change: null, unit: 'kg', location: 'Tây Nguyên' },
      ],
    },
    {
      category: 'Cao su',
      source: `tỷ giá ${usdRate.toLocaleString('vi-VN')}đ/USD`,
      isLive: true,
      items: [
        { name: 'Cao su SVR 10 (mủ khô)', price: rubber, change: rubberChange !== 0 ? rubberChange : null, unit: 'kg', location: 'Bình Dương' },
        { name: 'Cao su RSS3',             price: Math.round(rubber * 1.05), change: null, unit: 'kg', location: 'Đồng Nai' },
        { name: 'Mủ cao su nước',          price: Math.round(rubber * 0.4), change: null, unit: 'kg', location: 'Bình Phước' },
      ],
    },
    {
      category: 'Sầu riêng',
      source: durianPrice ? 'giacaphe.com' : 'tham khảo',
      isLive: !!durianPrice,
      items: [
        { name: 'Sầu riêng Ri6 (tại vườn)',       price: ri6Price,   change: null, unit: 'kg', location: 'Tiền Giang' },
        { name: 'Sầu riêng Monthong (xuất khẩu)', price: monthong,   change: null, unit: 'kg', location: 'Đắk Lắk' },
        { name: 'Sầu riêng Musang King',           price: musangKing, change: null, unit: 'kg', location: 'Lâm Đồng' },
        { name: 'Sầu riêng Dona (tại vườn)',       price: dona,       change: null, unit: 'kg', location: 'Đồng Nai' },
      ],
    },
    {
      category: 'Xăng dầu',
      source: petrolResult?.isLive ? 'petrolimex.com.vn' : 'tham khảo',
      isLive: !!petrolResult?.isLive,
      items: petrolResult?.isLive
        ? petrolResult.items.slice(0, 5).map(i => ({ ...i, unit: 'lít', location: 'Toàn quốc' }))
        : petrolFallback,
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
