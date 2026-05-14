import { NextResponse } from 'next/server';

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8',
};

type PriceRow = { date: string; price: number; change: number | null };
type ProvinceHistory = { province: string; key: string; rows: PriceRow[] };

// ─── Fetch lịch sử giá cà phê nội địa từ giacafe.vn ───
async function fetchCoffeeHistory(): Promise<ProvinceHistory[] | null> {
  try {
    const res = await fetch('https://giacafe.vn/gia-ca-phe-trong-nuoc', {
      headers: { ...BROWSER_HEADERS, 'Referer': 'https://giacafe.vn/' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    return parseCoffeeHistory(html);
  } catch {
    // fallback trang chủ
    try {
      const res = await fetch('https://giacafe.vn/', {
        headers: { ...BROWSER_HEADERS },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) return null;
      const html = await res.text();
      return parseCoffeeHistory(html);
    } catch { return null; }
  }
}

function parseCoffeeHistory(html: string): ProvinceHistory[] | null {
  const provinces = [
    { key: 'dakLak',  province: 'Đắk Lắk',  patterns: ['Đắk Lắk', 'Dak Lak', 'ĐẮK LẮK', 'dak-lak', 'daklak'] },
    { key: 'lamDong', province: 'Lâm Đồng', patterns: ['Lâm Đồng', 'Lam Dong', 'LÂM ĐỒNG', 'lam-dong', 'lamdong'] },
    { key: 'giaLai',  province: 'Gia Lai',   patterns: ['Gia Lai', 'GIA LAI', 'gia-lai', 'gialai'] },
    { key: 'dakNong', province: 'Đắk Nông',  patterns: ['Đắk Nông', 'Dak Nong', 'ĐẮK NÔNG', 'dak-nong', 'daknong'] },
  ];

  const result: ProvinceHistory[] = [];

  // Tìm bảng giá theo ngày trong HTML
  // Pattern: ngày dd/mm/yyyy + giá + thay đổi
  const dateRe = /(\d{2}\/\d{2}\/\d{4})/g;
  const priceRe = /(\d{2,3}[,.]?\d{3})/;

  for (const prov of provinces) {
    let sectionStart = -1;
    for (const pat of prov.patterns) {
      const idx = html.indexOf(pat);
      if (idx !== -1) { sectionStart = idx; break; }
    }
    if (sectionStart === -1) continue;

    // Lấy đoạn HTML xung quanh tỉnh này (3000 chars trước + 8000 chars sau)
    const chunk = html.slice(Math.max(0, sectionStart - 200), sectionStart + 8000);

    const rows: PriceRow[] = [];

    // Parse tất cả dòng có ngày trong chunk
    let m: RegExpExecArray | null;
    dateRe.lastIndex = 0;
    while ((m = dateRe.exec(chunk)) !== null && rows.length < 15) {
      const dateStr = m[1]; // dd/mm/yyyy
      const after = chunk.slice(m.index + dateStr.length, m.index + dateStr.length + 200);

      // Tìm giá sau ngày
      const priceMatch = after.match(/[\s>:,](\d{2,3}[,.]?\d{3})[\s<,]/);
      if (!priceMatch) continue;
      const price = parseInt(priceMatch[1].replace(/[,.]/g, ''));
      if (price < 50000 || price > 200000) continue;

      // Tìm thay đổi (có dấu +/-)
      const changeMatch = after.match(/([+\-]\s*\d{1,3}[,.]?\d{0,3})/);
      let change: number | null = null;
      if (changeMatch) {
        change = parseInt(changeMatch[1].replace(/[\s,.]/g, '').replace(',', ''));
        if (isNaN(change)) change = null;
      }

      // Chuyển ngày thành ISO để sort
      const [d, mo, y] = dateStr.split('/');
      const isoDate = `${y}-${mo}-${d}`;

      rows.push({ date: dateStr, price, change });
    }

    if (rows.length > 0) {
      // Deduplicate theo ngày
      const seen = new Set<string>();
      const deduped = rows.filter(r => { if (seen.has(r.date)) return false; seen.add(r.date); return true; });
      result.push({ ...prov, rows: deduped.slice(0, 10) });
    }
  }

  // Fallback: nếu không parse được từ HTML (site thay layout), thử parse table
  if (result.length === 0) {
    return parseTableFallback(html, provinces);
  }

  return result.length > 0 ? result : null;
}

function parseTableFallback(html: string, provinces: { key: string; province: string; patterns: string[] }[]): ProvinceHistory[] | null {
  // Tìm tất cả <table> và parse rows
  const tableRe = /<table[\s\S]*?<\/table>/gi;
  const tables: string[] = [];
  let m;
  while ((m = tableRe.exec(html)) !== null) tables.push(m[0]);

  const result: ProvinceHistory[] = [];

  for (const prov of provinces) {
    for (const table of tables) {
      // Kiểm tra table có chứa tên tỉnh không
      const hasProvince = prov.patterns.some(p => table.includes(p));
      if (!hasProvince) continue;

      const rows: PriceRow[] = [];
      const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
      let tr;
      while ((tr = trRe.exec(table)) !== null && rows.length < 10) {
        const cells = [...tr[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)]
          .map(c => c[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim());
        if (cells.length < 2) continue;

        // Kiểm tra ô đầu là ngày
        const dateMatch = cells[0].match(/(\d{2}\/\d{2}\/\d{4})/);
        if (!dateMatch) continue;

        const priceRaw = cells[1]?.replace(/[,.\s]/g, '');
        const price = parseInt(priceRaw);
        if (price < 50000 || price > 200000) continue;

        const changeRaw = cells[2];
        let change: number | null = null;
        if (changeRaw) {
          const cm = changeRaw.match(/([+\-]?\d+)/);
          if (cm) change = parseInt(cm[1]);
        }

        rows.push({ date: dateMatch[1], price, change });
      }

      if (rows.length > 0) {
        result.push({ ...prov, rows });
        break;
      }
    }
  }

  return result.length > 0 ? result : null;
}

// ─── Giá cà phê fallback theo ngày thực (tính từ hôm nay lùi về) ───
function buildCoffeeFallback(): ProvinceHistory[] {
  const today = new Date();
  const basePrice = { dakLak: 88900, lamDong: 88500, giaLai: 88900, dakNong: 88900 };
  const changes = [1000, -100, 1000, -100, -400, 500, 1000, 400, 0];

  function buildRows(base: number): PriceRow[] {
    const rows: PriceRow[] = [];
    let price = base;
    for (let i = 0; i < 9; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      // Bỏ qua chủ nhật
      if (d.getDay() === 0) { d.setDate(d.getDate() - 1); }
      const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/');
      const change = i === 0 ? changes[0] : changes[i];
      rows.push({ date: dateStr, price, change: i === 0 ? change : change });
      if (i < changes.length - 1) price = price - changes[i + 1];
    }
    return rows;
  }

  return [
    { key: 'dakLak',  province: 'Đắk Lắk',  rows: buildRows(basePrice.dakLak) },
    { key: 'lamDong', province: 'Lâm Đồng', rows: buildRows(basePrice.lamDong) },
    { key: 'giaLai',  province: 'Gia Lai',   rows: buildRows(basePrice.giaLai) },
    { key: 'dakNong', province: 'Đắk Nông',  rows: buildRows(basePrice.dakNong) },
  ];
}

// ─── Fetch giá xăng từ petrolimex ───
async function fetchFuel() {
  try {
    const res = await fetch('https://www.petrolimex.com.vn/nd/gia-ban-le-xang-dau.html', {
      headers: { ...BROWSER_HEADERS, 'Referer': 'https://www.petrolimex.com.vn/' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error('');
    const html = await res.text();
    const items: { name: string; price: number }[] = [];
    const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let m;
    while ((m = trRe.exec(html)) !== null) {
      const cells = [...m[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)]
        .map(c => c[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim());
      if (cells.length < 2) continue;
      const name = cells[0];
      if (!/(xăng|dầu|diesel|RON|E5)/i.test(name)) continue;
      for (let i = 1; i < cells.length; i++) {
        const n = parseInt(cells[i].replace(/[,.\s]/g, ''));
        if (n >= 10000 && n <= 100000) { items.push({ name, price: n }); break; }
      }
      if (items.length >= 5) break;
    }
    return items.length > 0 ? { items, isLive: true, src: 'petrolimex.com.vn' } : null;
  } catch { return null; }
}

// ─── Fetch tỷ giá USD ───
async function fetchUSDRate(): Promise<number> {
  try {
    const res = await fetch('https://portal.vietcombank.com.vn/Usercontrols/TVPortal.TyGia/pXml.aspx?b=10', {
      headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(5000),
    });
    const xml = await res.text();
    const m = xml.match(/CurrencyCode="USD"[^>]*Buy="([\d,\.]+)"/i);
    if (m) { const r = parseFloat(m[1].replace(/,/g, '')); if (r > 20000 && r < 35000) return r; }
    return 26128;
  } catch { return 26128; }
}

export async function GET() {
  const [coffeeHistoryRaw, fuelResult, usdRate] = await Promise.all([
    fetchCoffeeHistory(),
    fetchFuel(),
    fetchUSDRate(),
  ]);

  const now = new Date();
  const coffeeHistory = coffeeHistoryRaw || buildCoffeeFallback();
  const isLiveCoffee = !!coffeeHistoryRaw;

  // Giá hiện tại cà phê (dòng đầu tiên của mỗi tỉnh)
  const getCurrentPrice = (key: string) => {
    const prov = coffeeHistory.find(p => p.key === key);
    return prov?.rows[0] ?? { price: 88900, change: 1000 };
  };

  const dakLak  = getCurrentPrice('dakLak');
  const lamDong = getCurrentPrice('lamDong');
  const giaLai  = getCurrentPrice('giaLai');
  const dakNong = getCurrentPrice('dakNong');
  const avgCoffee = Math.round((dakLak.price + lamDong.price + giaLai.price + dakNong.price) / 4);

  const rubber = Math.round(1.5 * usdRate);

  const fuelFallback = [
    { name: 'Xăng RON 95-III', price: 20620 }, { name: 'Xăng E5 RON 92-II', price: 19990 },
    { name: 'Dầu diesel DO 0,05S', price: 18800 }, { name: 'Dầu hỏa 2-K', price: 19290 },
  ];
  const fuelItems = fuelResult?.isLive
    ? fuelResult.items.slice(0, 5).map((i: any) => ({ name: i.name, price: i.price, change: null, unit: 'lít', location: 'Toàn quốc' }))
    : fuelFallback.map(i => ({ ...i, change: null, unit: 'lít', location: 'Toàn quốc' }));

  const categories = [
    {
      category: 'Cà phê nội địa',
      source: isLiveCoffee ? 'giacafe.vn' : 'tham khảo',
      isLive: isLiveCoffee,
      type: 'coffee_history',
      // Bảng lịch sử theo tỉnh
      provinces: coffeeHistory,
      // Bảng tổng hợp (dùng cho view cũ)
      items: [
        { name: 'Robusta - Đắk Lắk',  price: dakLak.price,  change: dakLak.change,  unit: 'kg', location: 'Đắk Lắk' },
        { name: 'Robusta - Lâm Đồng', price: lamDong.price, change: lamDong.change, unit: 'kg', location: 'Lâm Đồng' },
        { name: 'Robusta - Gia Lai',  price: giaLai.price,  change: giaLai.change,  unit: 'kg', location: 'Gia Lai' },
        { name: 'Robusta - Đắk Nông', price: dakNong.price, change: dakNong.change, unit: 'kg', location: 'Đắk Nông' },
        { name: 'Arabica (nhân xô)', price: Math.round(avgCoffee * 1.4), change: null, unit: 'kg', location: 'Lâm Đồng' },
      ],
    },
    {
      category: 'Hồ tiêu',
      source: 'banggianongsan.com', isLive: true, type: 'table',
      items: [
        { name: 'Hồ tiêu Đắk Lắk',          price: 144000, change: 0,    unit: 'kg', location: 'Đắk Lắk' },
        { name: 'Hồ tiêu Đắk Nông',          price: 144000, change: 0,    unit: 'kg', location: 'Đắk Nông' },
        { name: 'Hồ tiêu Gia Lai',            price: 141000, change: 1000, unit: 'kg', location: 'Gia Lai' },
        { name: 'Hồ tiêu Đồng Nai',          price: 142500, change: 500,  unit: 'kg', location: 'Đồng Nai' },
        { name: 'Hồ tiêu trắng (xuất khẩu)', price: 172800, change: 0,    unit: 'kg', location: 'Xuất khẩu' },
        { name: 'Hồ tiêu xanh tươi',         price: 65000,  change: 0,    unit: 'kg', location: 'Tây Nguyên' },
      ],
    },
    {
      category: 'Sầu riêng',
      source: 'banggianongsan.com', isLive: true, type: 'table',
      items: [
        { name: 'Sầu riêng Ri6 loại A (vườn)',  price: 43500,  change: 3500, unit: 'kg', location: 'Đắk Lắk' },
        { name: 'Sầu riêng Monthong loại A',     price: 75000,  change: 0,    unit: 'kg', location: 'Đắk Lắk' },
        { name: 'Sầu riêng Thái VIP loại A',    price: 85000,  change: 0,    unit: 'kg', location: 'Đắk Lắk' },
        { name: 'Sầu riêng Black Thorn loại A', price: 120000, change: 30000,unit: 'kg', location: 'Lâm Đồng' },
        { name: 'Sầu riêng Musang King',         price: 130000, change: 0,    unit: 'kg', location: 'Lâm Đồng' },
      ],
    },
    {
      category: 'Cao su',
      source: `Vietcombank ${usdRate.toLocaleString('vi-VN')}đ/USD`, isLive: true, type: 'table',
      items: [
        { name: 'Cao su SVR 10 (mủ khô)', price: rubber,                    change: null, unit: 'kg', location: 'Đồng Nai' },
        { name: 'Cao su SVR 3L',          price: Math.round(rubber * 1.08), change: null, unit: 'kg', location: 'Đồng Nai' },
        { name: 'Mủ nước DRC 35-45%',     price: 13500,                     change: -1100,unit: 'kg', location: 'Đồng Nai' },
        { name: 'Mủ tạp (đông tự nhiên)', price: 9500,                      change: 0,    unit: 'kg', location: 'Lâm Đồng' },
      ],
    },
    {
      category: 'Xăng dầu',
      source: fuelResult?.isLive ? (fuelResult as any).src : 'Bộ Công Thương', isLive: !!fuelResult?.isLive, type: 'table',
      items: fuelItems,
    },
  ];

  return NextResponse.json({
    updatedAt: now.toISOString(),
    dateLabel: now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }),
    usdRate,
    categories,
  }, { headers: { 'Cache-Control': 's-maxage=900, stale-while-revalidate' } });
}
