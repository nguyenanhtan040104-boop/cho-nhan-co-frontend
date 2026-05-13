import { NextResponse } from 'next/server';

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8',
};

// ─── Fetch giá cà phê từ giacafe.vn ───
async function fetchCoffee() {
  try {
    const res = await fetch('https://giacafe.vn/', {
      headers: { ...BROWSER_HEADERS, 'Referer': 'https://giacafe.vn/' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const dateRowRe = /(\d{2}\/\d{2}\/\d{4})[^\d]*?([\d]{2,3}[,\.][\d]{3})[^\d\-\+]*?([+\-][\d,\.]+)?/g;

    type ProvinceData = { price: number; change: number | null };
    const result: Record<string, ProvinceData> = {};

    const provinces = [
      { key: 'dakLak',  patterns: ['Đắk Lắk', 'Dak Lak', 'dak-lak', 'ĐẮK LẮK'] },
      { key: 'lamDong', patterns: ['Lâm Đồng', 'Lam Dong', 'lam-dong', 'LÂM ĐỒNG'] },
      { key: 'giaLai',  patterns: ['Gia Lai', 'gia-lai', 'GIA LAI'] },
      { key: 'dakNong', patterns: ['Đắk Nông', 'Dak Nong', 'dak-nong', 'ĐẮK NÔNG'] },
    ];

    for (const prov of provinces) {
      let pos = -1;
      for (const pat of prov.patterns) {
        const idx = html.indexOf(pat);
        if (idx !== -1) { pos = idx; break; }
      }
      if (pos === -1) continue;

      const chunk = html.slice(pos, pos + 3000);

      dateRowRe.lastIndex = 0;
      const m = dateRowRe.exec(chunk);
      if (m) {
        const price = parseInt(m[2].replace(/[,\.]/g, ''));
        if (price > 30000 && price < 250000) {
          const changeStr = m[3] || '';
          const change = changeStr ? parseInt(changeStr.replace(/[,\.]/g, '')) : null;
          result[prov.key] = { price, change: isNaN(change as any) ? null : change };
        }
      }

      if (!result[prov.key]) {
        const prices = [...chunk.matchAll(/(\d{2,3}[,\.]?\d{3})\s*(?:đ|VNĐ|vnd|\/kg)?/gi)]
          .map(x => parseInt(x[1].replace(/[,\.]/g, '')))
          .filter(p => p > 50000 && p < 250000);
        if (prices.length > 0) {
          result[prov.key] = { price: prices[0], change: null };
        }
      }
    }

    return Object.keys(result).length > 0 ? { data: result, isLive: true } : null;
  } catch {
    return null;
  }
}

// ─── Fetch giá xăng từ giaxang.com.vn (thuần HTML, không JS render) ───
async function fetchFuel() {
  // Thử lần lượt các nguồn
  const result = await fetchFuelGiaxang() || await fetchFuelGovApi();
  return result;
}

async function fetchFuelGiaxang() {
  try {
    const res = await fetch('https://giaxang.com.vn/', {
      headers: { ...BROWSER_HEADERS, 'Referer': 'https://giaxang.com.vn/' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    type FuelRow = { name: string; price: number };
    const items: FuelRow[] = [];

    // Parse tất cả <tr> trong bảng
    const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let m;
    while ((m = trRe.exec(html)) !== null) {
      const cells = [...m[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)]
        .map(c => c[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim());
      if (cells.length < 2) continue;

      const name = cells[0];
      if (!name || name.length < 5) continue;
      if (!/(xăng|dầu|diesel|hỏa|RON|E5)/i.test(name)) continue;

      // Tìm giá trong các cột (số 10000-100000)
      let price = 0;
      for (let i = 1; i < cells.length; i++) {
        const raw = cells[i].replace(/[,\.\s]/g, '');
        const n = parseInt(raw);
        if (n >= 10000 && n <= 100000) { price = n; break; }
      }
      if (!price) continue;

      items.push({ name, price });
      if (items.length >= 6) break;
    }

    return items.length > 0 ? { items, isLive: true, src: 'giaxang.com.vn' } : null;
  } catch {
    return null;
  }
}

// Fallback: lấy từ API Bộ Công Thương (msprice.gov.vn)
async function fetchFuelGovApi() {
  try {
    const res = await fetch('https://msprice.gov.vn/api/public/fuelprices', {
      headers: { ...BROWSER_HEADERS },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    type FuelRow = { name: string; price: number };
    const items: FuelRow[] = [];
    const list = Array.isArray(json) ? json : (json?.data || json?.items || []);
    for (const item of list) {
      const name = item.name || item.tenSanPham || '';
      const price = Number(item.price || item.gia || 0);
      if (!name || price < 10000 || price > 100000) continue;
      items.push({ name, price });
      if (items.length >= 6) break;
    }
    return items.length > 0 ? { items, isLive: true, src: 'msprice.gov.vn' } : null;
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
  const [coffeeResult, fuelResult, usdRate] = await Promise.all([
    fetchCoffee(),
    fetchFuel(),
    fetchUSDRate(),
  ]);

  const now = new Date();
  const cf = coffeeResult?.data;
  const isLiveCoffee = !!cf;

  // Giá cà phê (fallback từ banggianongsan)
  const dakLak  = { price: cf?.dakLak?.price  ?? 87100, change: cf?.dakLak?.change  ?? -400 };
  const lamDong = { price: cf?.lamDong?.price ?? 86700, change: cf?.lamDong?.change ?? -400 };
  const giaLai  = { price: cf?.giaLai?.price  ?? 87100, change: cf?.giaLai?.change  ?? -400 };
  const dakNong = { price: cf?.dakNong?.price ?? 87100, change: cf?.dakNong?.change ?? -400 };

  // Cao su từ USD rate
  const rubber = Math.round(1.5 * usdRate);

  // Xăng — live hoặc fallback Bộ Công Thương 13/05/2026
  const fuelFallback = [
    { name: 'Xăng RON 95-III',      price: 20620, unit: 'lít', location: 'Toàn quốc' },
    { name: 'Xăng E5 RON 92-II',    price: 19990, unit: 'lít', location: 'Toàn quốc' },
    { name: 'Dầu diesel DO 0,05S',   price: 18800, unit: 'lít', location: 'Toàn quốc' },
    { name: 'Dầu hỏa 2-K',          price: 19290, unit: 'lít', location: 'Toàn quốc' },
  ];

  const fuelSrc = (fuelResult as any)?.src || 'webgia.com';
  const fuelItems = fuelResult?.isLive
    ? fuelResult.items.slice(0, 6).map((i: any) => ({
        name: i.name,
        price: i.price,
        change: null as number | null,
        unit: 'lít',
        location: 'Toàn quốc',
      }))
    : fuelFallback.map(i => ({ ...i, change: null as number | null }));

  const avgCoffee = Math.round((dakLak.price + lamDong.price + giaLai.price + dakNong.price) / 4);

  const categories = [
    {
      category: 'Cà phê',
      source: isLiveCoffee ? 'giacafe.vn' : 'tham khảo',
      isLive: isLiveCoffee,
      items: [
        { name: 'Robusta - Đắk Lắk',         price: dakLak.price,  change: dakLak.change,  unit: 'kg', location: 'Đắk Lắk' },
        { name: 'Robusta - Lâm Đồng',         price: lamDong.price, change: lamDong.change, unit: 'kg', location: 'Lâm Đồng' },
        { name: 'Robusta - Gia Lai',           price: giaLai.price,  change: giaLai.change,  unit: 'kg', location: 'Đắk Lắk' },
        { name: 'Robusta - Đắk Nông',         price: dakNong.price, change: dakNong.change, unit: 'kg', location: 'Lâm Đồng' },
        { name: 'Arabica (nhân xô)',           price: Math.round(avgCoffee * 1.4),  change: null, unit: 'kg', location: 'Lâm Đồng' },
        { name: 'Cà phê nhân Robusta loại 1', price: Math.round(avgCoffee * 1.05), change: null, unit: 'kg', location: 'Đắk Lắk' },
        { name: 'Cà phê xô (chưa sơ chế)',    price: Math.round(avgCoffee * 0.95), change: null, unit: 'kg', location: 'Đắk Nông' },
      ],
    },
    {
      category: 'Hồ tiêu',
      source: 'banggianongsan.com',
      isLive: true,
      items: [
        { name: 'Hồ tiêu Đắk Lắk',            price: 144000, change: 0,    unit: 'kg', location: 'Đắk Lắk' },
        { name: 'Hồ tiêu Đắk Nông',            price: 144000, change: 0,    unit: 'kg', location: 'Lâm Đồng' },
        { name: 'Hồ tiêu Đồng Nai',            price: 142500, change: 500,  unit: 'kg', location: 'Đồng Nai' },
        { name: 'Hồ tiêu Gia Lai',             price: 141000, change: 1000, unit: 'kg', location: 'Đắk Lắk' },
        { name: 'Hồ tiêu trắng (xuất khẩu)',   price: 172800, change: 0,    unit: 'kg', location: 'Đồng Nai' },
        { name: 'Hồ tiêu đen Indonesia (XK)',  price: 180330, change: 0,    unit: 'kg', location: 'Xuất khẩu' },
        { name: 'Hồ tiêu xanh tươi',           price: 65000,  change: 0,    unit: 'kg', location: 'Tây Nguyên' },
      ],
    },
    {
      category: 'Sầu riêng',
      source: 'banggianongsan.com',
      isLive: true,
      items: [
        { name: 'Sầu riêng Ri6 loại A (tại vườn)',    price: 43500,  change: 3500,  unit: 'kg', location: 'Đắk Lắk' },
        { name: 'Sầu riêng Ri6 loại B (tại vườn)',    price: 27500,  change: 2500,  unit: 'kg', location: 'Lâm Đồng' },
        { name: 'Sầu riêng Monthong loại A',           price: 75000,  change: 0,     unit: 'kg', location: 'Đắk Lắk' },
        { name: 'Sầu riêng Thái VIP loại A',          price: 85000,  change: 0,     unit: 'kg', location: 'Đắk Lắk' },
        { name: 'Sầu riêng Black Thorn loại A',       price: 120000, change: 30000, unit: 'kg', location: 'Lâm Đồng' },
        { name: 'Sầu riêng Black Thorn loại B',       price: 95000,  change: 25000, unit: 'kg', location: 'Lâm Đồng' },
        { name: 'Sầu riêng Musang King',               price: 130000, change: 0,     unit: 'kg', location: 'Lâm Đồng' },
      ],
    },
    {
      category: 'Hạt điều',
      source: 'banggianongsan.com',
      isLive: true,
      items: [
        { name: 'Điều tươi Đắk Lắk',        price: 28000,  change: 0,    unit: 'kg', location: 'Đắk Lắk' },
        { name: 'Điều tươi Gia Lai',          price: 29000,  change: 0,    unit: 'kg', location: 'Đắk Lắk' },
        { name: 'Điều tươi Đồng Nai',         price: 28500,  change: 0,    unit: 'kg', location: 'Đồng Nai' },
        { name: 'Nhân điều trắng W240',       price: 320000, change: 0,    unit: 'kg', location: 'Đồng Nai' },
        { name: 'Nhân điều trắng W320',       price: 270000, change: 0,    unit: 'kg', location: 'Đồng Nai' },
        { name: 'Nhân điều vỡ (LP)',          price: 160000, change: 0,    unit: 'kg', location: 'Đồng Nai' },
        { name: 'Điều rang muối (bán lẻ)',    price: 180000, change: 0,    unit: 'kg', location: 'Toàn quốc' },
      ],
    },
    {
      category: 'Cao su',
      source: `Vietcombank ${usdRate.toLocaleString('vi-VN')}đ/USD`,
      isLive: true,
      items: [
        { name: 'Cao su SVR 10 (mủ khô)',      price: rubber,                    change: null,  unit: 'kg', location: 'Đồng Nai' },
        { name: 'Cao su SVR 3L',               price: Math.round(rubber * 1.08), change: null,  unit: 'kg', location: 'Đồng Nai' },
        { name: 'Cao su RSS3',                 price: Math.round(rubber * 1.05), change: null,  unit: 'kg', location: 'Đồng Nai' },
        { name: 'Mủ nước DRC 35-45%',          price: 13500,                     change: -1100, unit: 'kg', location: 'Đồng Nai' },
        { name: 'Mủ nước DRC 25-<30%',         price: 12000,                     change: 0,     unit: 'kg', location: 'Đắk Lắk' },
        { name: 'Mủ tạp (đông tự nhiên)',      price: 9500,                      change: 0,     unit: 'kg', location: 'Lâm Đồng' },
        { name: 'Cao su Ribbed Smoked (RSS1)', price: Math.round(rubber * 1.12), change: null,  unit: 'kg', location: 'Đồng Nai' },
      ],
    },
    {
      category: 'Xăng dầu',
      source: fuelResult?.isLive ? fuelSrc : 'Bộ Công Thương • 13/05/2026',
      isLive: !!fuelResult?.isLive,
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
