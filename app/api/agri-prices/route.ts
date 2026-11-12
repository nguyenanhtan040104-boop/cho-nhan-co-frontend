import { NextResponse } from 'next/server';

// Every number returned here comes from a live page. When a source cannot be read the
// category comes back empty with isLive:false, never with placeholder prices.

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8',
};

type PriceRow = { date: string; price: number; change: number | null };
type ProvinceHistory = { province: string; key: string; rows: PriceRow[] };
type Item = {
  name: string;
  price: number;
  priceMax?: number;
  price2?: number | null;
  change: number | null;
  unit: string;
  location: string;
};
type SourceStatus = Record<string, string>;

// ─── Helpers ───
function clean(s: string): string {
  return s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&#8211;|&ndash;/g, '–')
    .replace(/\s+/g, ' ')
    .trim();
}

function tableRows(tableHtml: string): string[][] {
  return [...tableHtml.matchAll(/<tr[\s\S]*?<\/tr>/gi)].map(tr =>
    [...tr[0].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(c => clean(c[1])),
  );
}

// "60.000 - 65.000" -> {min:60000,max:65000}; "463" -> {min:463,max:463}. VND only (dot = thousands).
function parseVnd(s: string): { min: number; max: number } | null {
  const nums = (s.match(/\d[\d.]*/g) || [])
    .map(x => parseInt(x.replace(/\./g, ''), 10))
    .filter(n => !isNaN(n));
  if (nums.length === 0) return null;
  const a = nums[0];
  const b = nums[1] ?? nums[0];
  return { min: Math.min(a, b), max: Math.max(a, b) };
}

const LOCATIONS = ['Đắk Nông', 'Đắk Lắk', 'Lâm Đồng', 'Gia Lai', 'Kon Tum', 'Tây Nguyên', 'Đồng Nai', 'Bình Phước', 'Bình Định', 'Vũng Tàu', 'Bà Rịa', 'TP. Hồ Chí Minh', 'ĐBSCL', 'Mang Yang', 'Phú Riềng'];
function detectLocation(name: string): string {
  return LOCATIONS.find(l => name.includes(l)) ?? '';
}

// Tây Nguyên first, with Đắk Nông (Nhân Cơ) on top
const LOCATION_ORDER: Record<string, number> = { 'Đắk Nông': 0, 'Đắk Lắk': 1, 'Lâm Đồng': 2, 'Gia Lai': 3, 'Kon Tum': 4, 'Tây Nguyên': 5 };
function sortByRegion(items: Item[]): Item[] {
  return items
    .map((it, i) => ({ it, i }))
    .sort((a, b) => ((LOCATION_ORDER[a.it.location] ?? 9) - (LOCATION_ORDER[b.it.location] ?? 9)) || a.i - b.i)
    .map(x => x.it);
}

// One table row of banggianongsan.com: [name (unit), old price, new price, change text]
function parseBgnsRow(cells: string[]): Item | null {
  if (cells.length < 3) return null;
  const unitMatch = cells[0].match(/\(([^()]*)\)\s*$/);
  if (!unitMatch) return null;
  const unitRaw = unitMatch[1];
  if (/usd|cent|\$/i.test(unitRaw) || !/(đ|đồng|vnđ|vnd)/i.test(unitRaw)) return null; // VND rows only
  const name = cells[0].slice(0, unitMatch.index).trim();
  const unit = unitRaw.replace(/^(đồng|đ|vnđ)\s*\/\s*/i, '').trim() || 'kg';
  const oldP = parseVnd(cells[1]);
  const newP = parseVnd(cells[2]);
  if (!newP || newP.min <= 0) return null;
  const mid = (p: { min: number; max: number }) => (p.min + p.max) / 2;
  return {
    name,
    price: newP.min,
    priceMax: newP.max > newP.min ? newP.max : undefined,
    change: oldP ? Math.round(mid(newP) - mid(oldP)) : null,
    unit,
    location: detectLocation(name),
  };
}

const BGNS_CATEGORIES: { id: string; category: string; test: RegExp }[] = [
  { id: 'coffee', category: 'Cà phê nội địa', test: /Cà phê/i },
  { id: 'pepper', category: 'Hồ tiêu', test: /Hồ Tiêu|Tiêu Đen/i },
  { id: 'durian', category: 'Sầu riêng', test: /Sầu/i },
  { id: 'rubber', category: 'Cao su', test: /Cao Su/i },
  { id: 'cashew', category: 'Điều', test: /Điều/i },
  { id: 'macca', category: 'Macca', test: /Macca/i },
  { id: 'cacao', category: 'Cacao', test: /Cacao/i },
];

// ─── banggianongsan.com: coffee, pepper, durian, rubber, cashew, macca, cacao ───
async function fetchBgns(status: SourceStatus): Promise<{ priceDate: string | null; byId: Record<string, Item[]> } | null> {
  try {
    const res = await fetch('https://banggianongsan.com/', {
      headers: BROWSER_HEADERS,
      cache: 'no-store',
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const dateMatch = html.match(/Ngày\s+(\d{2}\/\d{2}\/\d{4})/);
    const byId: Record<string, Item[]> = {};
    for (const t of html.match(/<table[\s\S]*?<\/table>/gi) || []) {
      const rows = tableRows(t);
      const firstName = rows[1]?.[0] ?? '';
      const cat = BGNS_CATEGORIES.find(c => c.test.test(firstName));
      if (!cat || byId[cat.id]) continue;
      const items = rows.slice(1).map(parseBgnsRow).filter((x): x is Item => !!x);
      if (items.length > 0) byId[cat.id] = sortByRegion(items);
    }
    if (Object.keys(byId).length === 0) throw new Error('no price tables found (page layout changed?)');
    status.banggianongsan = 'ok';
    return { priceDate: dateMatch ? dateMatch[1] : null, byId };
  } catch (e: any) {
    status.banggianongsan = String(e?.message || e).slice(0, 80);
    return null;
  }
}

// ─── giacafe.vn: daily coffee history for four provinces (AJAX table) ───
async function fetchCoffeeHistory(status: SourceStatus): Promise<ProvinceHistory[] | null> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const atts = Buffer.from('json:' + JSON.stringify({ date: today, ajax: true, type: 'table' }) + 'devvn_cafe_2025').toString('base64');
    const res = await fetch('https://giacafe.vn/wp-admin/admin-ajax.php', {
      method: 'POST',
      headers: {
        ...BROWSER_HEADERS,
        'Referer': 'https://giacafe.vn/',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: new URLSearchParams({ action: 'devvn_get_cafe_price', atts, id: 'devvn_cafe_2025' }).toString(),
      cache: 'no-store',
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data?.html) throw new Error('empty response');
    const parsed = parseCoffeeAjaxHtml(json.data.html);
    if (!parsed) throw new Error('could not parse price tables');
    status.giacafe = 'ok';
    return parsed;
  } catch (e: any) {
    status.giacafe = String(e?.message || e).slice(0, 80);
    return null;
  }
}

function parseCoffeeAjaxHtml(html: string): ProvinceHistory[] | null {
  const provinces = [
    { key: 'dakNong', province: 'Đắk Nông', tabId: 'tab-dak-nong' },
    { key: 'dakLak', province: 'Đắk Lắk', tabId: 'tab-dak-lak' },
    { key: 'lamDong', province: 'Lâm Đồng', tabId: 'tab-lam-dong' },
    { key: 'giaLai', province: 'Gia Lai', tabId: 'tab-gia-lai' },
  ];
  const result: ProvinceHistory[] = [];
  for (const prov of provinces) {
    const start = html.indexOf(`data-id="#${prov.tabId}"`);
    if (start === -1) continue;
    const next = html.indexOf('data-id="#', start + 10);
    const section = html.slice(start, next === -1 ? undefined : next);
    const rows: PriceRow[] = [];
    for (const cells of tableRows(section)) {
      if (cells.length < 2) continue;
      const dateMatch = cells[0].match(/(\d{2}\/\d{2}\/\d{4})/);
      if (!dateMatch) continue;
      const price = parseInt(cells[1].replace(/[,.\s]/g, ''), 10);
      if (isNaN(price) || price < 30000 || price > 300000) continue;
      let change: number | null = null;
      const cm = (cells[2] || '').match(/([+\-]?\d[\d,]*)/);
      if (cm) {
        const c = parseInt(cm[1].replace(/,/g, ''), 10);
        change = isNaN(c) ? null : c;
      }
      rows.push({ date: dateMatch[1], price, change });
      if (rows.length >= 10) break;
    }
    if (rows.length > 0) result.push({ ...prov, rows });
  }
  return result.length > 0 ? result : null;
}

// dd/mm/yyyy -> days between that date and now (Vietnam time)
function ageInDays(dmy: string | null | undefined): number | null {
  if (!dmy) return null;
  const [d, m, y] = dmy.split('/').map(Number);
  if (!d || !m || !y) return null;
  const then = Date.UTC(y, m - 1, d);
  const vnNow = new Date(Date.now() + 7 * 3600_000);
  const now = Date.UTC(vnNow.getUTCFullYear(), vnNow.getUTCMonth(), vnNow.getUTCDate());
  return Math.round((now - then) / 86400_000);
}

// ─── webgia.com: fuel (Petrolimex) ───
async function fetchFuel(status: SourceStatus) {
  try {
    const res = await fetch('https://webgia.com/gia-xang-dau/', {
      headers: { ...BROWSER_HEADERS, 'Referer': 'https://webgia.com/' },
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const items: { name: string; price: number; price2?: number }[] = [];
    for (const cells of tableRows(html)) {
      if (cells.length < 2) continue;
      const name = cells[0];
      if (!/(xăng|dầu|DO|RON|E5|E10|hỏa)/i.test(name)) continue;
      const price1 = parseInt((cells[1] || '').replace(/[^\d]/g, ''), 10);
      const price2 = parseInt((cells[2] || '').replace(/[^\d]/g, ''), 10);
      if (price1 >= 10000 && price1 <= 50000) {
        items.push({ name, price: price1, price2: price2 >= 10000 ? price2 : undefined });
      }
      if (items.length >= 7) break;
    }
    if (items.length === 0) throw new Error('no fuel rows found');
    status.webgia = 'ok';
    return items;
  } catch (e: any) {
    status.webgia = String(e?.message || e).slice(0, 80);
    return null;
  }
}

export async function GET() {
  const status: SourceStatus = {};
  const [bgns, coffeeHistory, fuel] = await Promise.all([
    fetchBgns(status),
    fetchCoffeeHistory(status),
    fetchFuel(status),
  ]);

  const now = new Date();
  const bgnsAge = ageInDays(bgns?.priceDate);
  const bgnsFresh = !!bgns && (bgnsAge === null || bgnsAge <= 3);
  const bgnsSource = bgns?.priceDate ? `banggianongsan.com · ${bgns.priceDate}` : 'banggianongsan.com';

  const categories: any[] = [];

  // Coffee: giacafe.vn gives a daily history per province; otherwise use banggianongsan.com rows
  const coffeeFresh = coffeeHistory
    ? (ageInDays(coffeeHistory[0]?.rows[0]?.date) ?? 99) <= 7
    : false;
  if (coffeeHistory && coffeeFresh) {
    categories.push({
      category: 'Cà phê nội địa',
      source: 'giacafe.vn',
      isLive: true,
      type: 'coffee_history',
      provinces: coffeeHistory,
      items: coffeeHistory.map(p => ({
        name: `Robusta - ${p.province}`,
        price: p.rows[0].price,
        change: p.rows[0].change,
        unit: 'kg',
        location: p.province,
      })),
    });
  } else {
    categories.push({
      category: 'Cà phê nội địa',
      source: bgnsFresh && bgns?.byId.coffee ? bgnsSource : 'Chưa lấy được dữ liệu',
      isLive: bgnsFresh && !!bgns?.byId.coffee,
      type: 'table',
      items: bgnsFresh ? (bgns?.byId.coffee ?? []) : [],
    });
  }

  for (const c of BGNS_CATEGORIES.filter(c => c.id !== 'coffee')) {
    const items = bgnsFresh ? (bgns?.byId[c.id] ?? []) : [];
    // A category the source does not publish at all is left out instead of shown empty
    if (items.length === 0 && bgns && !bgns.byId[c.id]) continue;
    categories.push({
      category: c.category,
      source: items.length > 0 ? bgnsSource : 'Chưa lấy được dữ liệu',
      isLive: items.length > 0,
      type: 'table',
      note: c.id === 'rubber'
        ? 'Nhà máy niêm yết theo đồng cho mỗi 1% hàm lượng (TSC/DRC). Ví dụ 463 đ/TSC x 30% = khoảng 13.900 đ/kg mủ nước.'
        : undefined,
      items,
    });
  }

  categories.push({
    category: 'Xăng dầu',
    source: fuel ? 'webgia.com (Petrolimex)' : 'Chưa lấy được dữ liệu',
    isLive: !!fuel,
    type: 'fuel_table',
    items: (fuel ?? []).map(i => ({
      name: i.name,
      price: i.price,
      price2: i.price2 ?? null,
      change: null,
      unit: 'lít',
      location: `Vùng 1: ${i.price.toLocaleString('vi-VN')}đ`,
    })),
  });

  return NextResponse.json(
    {
      updatedAt: now.toISOString(),
      dateLabel: now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' }),
      priceDate: bgns?.priceDate ?? coffeeHistory?.[0]?.rows[0]?.date ?? null,
      sources: status,
      categories,
    },
    { headers: { 'Cache-Control': 's-maxage=900, stale-while-revalidate' } },
  );
}
