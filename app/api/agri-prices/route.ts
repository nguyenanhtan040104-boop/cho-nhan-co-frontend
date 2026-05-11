import { NextResponse } from 'next/server';

// Mapping tỉnh cũ → tỉnh mới sau sáp nhập
const PROVINCE_MAP: Record<string, string> = {
  'đắk lắk': 'Đắk Lắk', 'dak lak': 'Đắk Lắk', 'phú yên': 'Đắk Lắk',
  'lâm đồng': 'Lâm Đồng', 'lam dong': 'Lâm Đồng',
  'đắk nông': 'Lâm Đồng', 'dak nong': 'Lâm Đồng',
  'bình thuận': 'Lâm Đồng', 'binh thuan': 'Lâm Đồng',
  'đồng nai': 'Đồng Nai', 'dong nai': 'Đồng Nai',
  'bình phước': 'Đồng Nai', 'binh phuoc': 'Đồng Nai',
  'bà rịa': 'Đồng Nai', 'ba ria': 'Đồng Nai',
  'gia lai': 'Gia Lai',
};

function mapProvince(text: string): string {
  const t = text.toLowerCase();
  for (const [key, val] of Object.entries(PROVINCE_MAP)) {
    if (t.includes(key)) return val;
  }
  return '';
}

// Parse giá VND từ string (hỗ trợ range "41,000-46,000" → lấy trung bình)
function parsePrice(s: string): number | null {
  if (!s) return null;
  const clean = s.replace(/[₫đ\s]/g, '');
  if (clean.includes('-')) {
    const parts = clean.split('-').map(p => parseInt(p.replace(/[,\.]/g, '')));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[0] > 1000 && parts[1] > 1000) {
      return Math.round((parts[0] + parts[1]) / 2);
    }
  }
  const n = parseInt(clean.replace(/[,\.]/g, ''));
  return (!isNaN(n) && n > 500) ? n : null;
}

// Parse change từ string "+1,000 (+0.71%)" hoặc "-400 (-0.46%)" hoặc số đơn giản
function parseChange(s: string): number | null {
  if (!s || s === '0') return 0;
  const noChange = ['no change', 'không đổi', 'không thay đổi', '—', '-'];
  if (noChange.some(nc => s.toLowerCase().trim() === nc)) return 0;
  const m = s.match(/([+-]?\d[\d,\.]*)/);
  if (m) {
    const n = parseInt(m[1].replace(/[,\.]/g, ''));
    return isNaN(n) ? null : n;
  }
  return null;
}

// ─── Fetch từ banggianongsan.com ───
async function fetchBangGia() {
  try {
    const res = await fetch('https://banggianongsan.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8',
        'Referer': 'https://banggianongsan.com/',
      },
      signal: AbortSignal.timeout(9000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    type Row = { name: string; price: number; change: number | null; province: string };
    const rows: Row[] = [];

    const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let m;
    while ((m = trRe.exec(html)) !== null) {
      const cells = [...m[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)]
        .map(c => c[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim());
      if (cells.length < 3) continue;

      const name = cells[0];
      if (!name || name.length < 3) continue;

      // Bỏ qua hàng USD/ton (giá quốc tế)
      if (/usd|USD/i.test(cells[1]) || /usd|USD/i.test(cells[2])) continue;

      const newPrice = parsePrice(cells[2]) ?? parsePrice(cells[1]);
      if (!newPrice || newPrice < 1000 || newPrice > 10_000_000) continue;

      // Change: cells[3] hoặc tính từ old/new
      let change: number | null = null;
      if (cells[3]) {
        change = parseChange(cells[3]);
      } else if (cells[1] && cells[2]) {
        const oldP = parsePrice(cells[1]);
        const newP = parsePrice(cells[2]);
        if (oldP && newP) change = newP - oldP;
      }

      const province = mapProvince(name);
      rows.push({ name, price: newPrice, change, province });
    }

    return rows.length > 0 ? rows : null;
  } catch {
    return null;
  }
}

// ─── Fetch tỷ giá USD ───
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
  const [rows, usdRate] = await Promise.all([fetchBangGia(), fetchUSDRate()]);
  const isLive = !!rows;

  // Helper tìm row theo keyword
  function find(kw: string) {
    return rows?.find(r => r.name.toLowerCase().includes(kw.toLowerCase()));
  }
  function findAll(kw: string) {
    return rows?.filter(r => r.name.toLowerCase().includes(kw.toLowerCase())) ?? [];
  }

  // ── Cà phê ──
  const coffeeRows = [
    find('đắk lắk') ?? find('dak lak'),
    find('lâm đồng') ?? find('lam dong'),
    find('gia lai'),
    find('đắk nông') ?? find('dak nong'),
  ].filter(Boolean) as NonNullable<typeof rows>[0][];

  const fallbackCoffee = [
    { name: 'Robusta - Đắk Lắk', price: 87100, change: -400, province: 'Đắk Lắk' },
    { name: 'Robusta - Lâm Đồng', price: 86700, change: -400, province: 'Lâm Đồng' },
  ];

  // ── Hồ tiêu ──
  const pepperRows = findAll('tiêu').filter(r => r.price > 50000 && r.price < 300000);
  const fallbackPepper = [
    { name: 'Hồ tiêu Đắk Lắk', price: 144000, change: 0, province: 'Đắk Lắk' },
    { name: 'Hồ tiêu Đắk Nông', price: 144000, change: 0, province: 'Lâm Đồng' },
    { name: 'Hồ tiêu Đồng Nai', price: 142500, change: 500, province: 'Đồng Nai' },
  ];

  // ── Sầu riêng ──
  const durianRows = findAll('sầu riêng').filter(r => r.price > 20000 && r.price < 500000);
  const fallbackDurian = [
    { name: 'Sầu riêng Ri6 A', price: 43500, change: 3500, province: 'Đắk Lắk' },
    { name: 'Sầu riêng Ri6 B', price: 27500, change: 2500, province: 'Lâm Đồng' },
    { name: 'Sầu riêng Thái VIP A', price: 85000, change: 0, province: 'Đắk Lắk' },
    { name: 'Sầu riêng Black Thorn A', price: 120000, change: 30000, province: 'Lâm Đồng' },
  ];

  // ── Cao su ──
  const rubber = Math.round(1.5 * usdRate);
  const rubberRows = findAll('cao su').filter(r => r.price > 5000);
  const fallbackRubber = [
    { name: 'Cao su SVR 10 (mủ khô)', price: rubber, change: null, province: 'Đồng Nai' },
    { name: 'Mủ cao su nước DRC 35-45%', price: 13500, change: -1100, province: 'Đồng Nai' },
  ];

  function toItems(list: { name: string; price: number; change: number | null; province: string }[], unit = 'kg') {
    return list.map(r => ({
      name: r.name,
      price: r.price,
      change: r.change,
      unit,
      location: r.province || 'Tây Nguyên',
    }));
  }

  // Giá xăng — Bộ Công Thương, áp dụng từ 15:00 ngày 07/05/2026
  const fuelItems = [
    { name: 'Xăng RON 95-III', price: 20910, change: -260, unit: 'lít', location: 'Toàn quốc' },
    { name: 'Xăng E5 RON 92',  price: 20422, change: -248, unit: 'lít', location: 'Toàn quốc' },
    { name: 'Dầu diesel 0.05S', price: 18704, change: -246, unit: 'lít', location: 'Toàn quốc' },
    { name: 'Dầu hỏa',          price: 18850, change: -240, unit: 'lít', location: 'Toàn quốc' },
  ];

  const now = new Date();
  const categories = [
    {
      category: 'Cà phê',
      source: isLive ? 'banggianongsan.com' : 'tham khảo',
      isLive,
      items: toItems(coffeeRows.length > 0 ? coffeeRows : fallbackCoffee),
    },
    {
      category: 'Hồ tiêu',
      source: isLive ? 'banggianongsan.com' : 'tham khảo',
      isLive,
      items: toItems(pepperRows.length > 0 ? pepperRows : fallbackPepper),
    },
    {
      category: 'Sầu riêng',
      source: isLive ? 'banggianongsan.com' : 'tham khảo',
      isLive,
      items: toItems(durianRows.length > 0 ? durianRows : fallbackDurian),
    },
    {
      category: 'Cao su',
      source: isLive && rubberRows.length > 0 ? 'banggianongsan.com' : `Vietcombank ${usdRate.toLocaleString('vi-VN')}đ/USD`,
      isLive: true,
      items: toItems(rubberRows.length > 0 ? rubberRows : fallbackRubber),
    },
    {
      category: 'Xăng dầu',
      source: 'Bộ Công Thương • Từ 15:00 ngày 07/05/2026',
      isLive: true,
      items: fuelItems,
    },
  ];

  return NextResponse.json({
    updatedAt: now.toISOString(),
    dateLabel: now.toLocaleDateString('vi-VN', {
      weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
    }),
    usdRate,
    categories,
  }, {
    headers: { 'Cache-Control': 's-maxage=600, stale-while-revalidate' },
  });
}
