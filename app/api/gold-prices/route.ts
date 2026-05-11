import { NextResponse } from 'next/server';

// ─── Module-level cache để tính thay đổi giá theo ngày ───
const cache: {
  date: string;
  prices: Record<string, number>;
  prevPrices: Record<string, number>;
} = { date: '', prices: {}, prevPrices: {} };

function trackChange(key: string, current: number): number | null {
  const today = new Date().toISOString().slice(0, 10);
  if (cache.date !== today) {
    cache.prevPrices = { ...cache.prices };
    cache.date = today;
    cache.prices = {};
  }
  cache.prices[key] = current;
  const prev = cache.prevPrices[key];
  if (!prev || prev === current) return null;
  return current - prev;
}

// ─── Fetch giá vàng từ webgia.com ───
async function fetchWebGia() {
  try {
    const res = await fetch('https://webgia.com/gia-vang/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9',
        'Referer': 'https://webgia.com/',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    // webgia dùng dấu . là phân cách nghìn: "16.220.000" → 16220000
    function parseWebGiaPrice(s: string): number | null {
      const n = parseInt(s.replace(/\./g, '').replace(/,/g, '').trim());
      return (!isNaN(n) && n > 1_000_000) ? n : null;
    }

    type GoldRow = { system: string; buy: number; sell: number };
    const rows: GoldRow[] = [];

    const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let m;
    while ((m = trRe.exec(html)) !== null) {
      const cells = [...m[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)]
        .map(c => c[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim());
      if (cells.length < 3) continue;

      // Tìm row có giá mua/bán hợp lệ
      // Thử các vị trí khác nhau vì có thể có cột khu vực
      let buy: number | null = null, sell: number | null = null, system = '';

      for (let i = 0; i < cells.length - 1; i++) {
        const b = parseWebGiaPrice(cells[i]);
        const s = parseWebGiaPrice(cells[i + 1]);
        if (b && s && s >= b) {
          buy = b; sell = s;
          system = cells.slice(0, i).find(c => c.length > 1 && !/^\d/.test(c)) || cells[0];
          break;
        }
      }
      if (!buy || !sell || !system) continue;
      if (rows.find(r => r.system === system)) continue; // bỏ duplicate
      rows.push({ system: system.trim(), buy, sell });
    }

    // Giá thế giới (USD/oz)
    const worldMatch = html.match(/\$?\s*([\d,\.]+)\s*(?:USD)?[^%\d]*?([+-][\d,\.]+)\s*([+-][\d,\.]+%)/i)
      || html.match(/([\d,]{5,}(?:\.\d+)?)\s*([+-][\d\.]+)\s*([+-][\d\.]+%)/);
    let worldPrice: number | null = null, worldChange: number | null = null;
    if (worldMatch) {
      worldPrice = parseFloat(worldMatch[1].replace(/,/g, ''));
      worldChange = parseFloat(worldMatch[2].replace(/,/g, ''));
      if (worldPrice < 1000 || worldPrice > 10000) { worldPrice = null; worldChange = null; }
    }

    return rows.length > 0 ? { rows, worldPrice, worldChange, isLive: true } : null;
  } catch {
    return null;
  }
}

// ─── Fetch giá vàng SJC (backup) ───
async function fetchSJC() {
  try {
    const res = await fetch('https://sjc.com.vn/GoldPrice/Services/PriceService.ashx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://sjc.com.vn/',
      },
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error('SJC error');
    const xml = await res.text();

    const items: { name: string; buy: number; sell: number }[] = [];
    const groupRegex = /<NhomGia>([\s\S]*?)<\/NhomGia>/g;
    let m;
    while ((m = groupRegex.exec(xml)) !== null) {
      const block = m[1];
      const nameMatch = block.match(/<Ten>(.*?)<\/Ten>/);
      const buyMatch = block.match(/<GiaMua>(.*?)<\/GiaMua>/);
      const sellMatch = block.match(/<GiaBan>(.*?)<\/GiaBan>/);
      if (nameMatch && buyMatch && sellMatch) {
        const buy = parseFloat(buyMatch[1].replace(/,/g, '')) * 10000;
        const sell = parseFloat(sellMatch[1].replace(/,/g, '')) * 10000;
        if (buy > 0 || sell > 0) items.push({ name: nameMatch[1].trim(), buy, sell });
      }
    }
    return items.length > 0 ? items : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const [webGia, sjcItems] = await Promise.all([fetchWebGia(), fetchSJC()]);

  const now = new Date();

  // ─── Ưu tiên webgia, fallback sang SJC, cuối cùng dùng giá mẫu ───
  let data: {
    name: string; buy: number; sell: number;
    buyPerChi: number; sellPerChi: number;
    change: number | null; source: string;
  }[] = [];

  if (webGia?.rows && webGia.rows.length > 0) {
    // webgia trả về per chỉ → lượng = chỉ × 10
    const mainRows = webGia.rows.slice(0, 6);
    data = mainRows.map(r => {
      const buy  = r.buy  * 10; // per lượng
      const sell = r.sell * 10;
      return {
        name: r.system,
        buy, sell,
        buyPerChi:  r.buy,
        sellPerChi: r.sell,
        change: trackChange(r.system + '_sell', sell),
        source: 'webgia.com',
      };
    });
  } else if (sjcItems) {
    data = sjcItems.map(item => ({
      name: item.name,
      buy:  item.buy,
      sell: item.sell,
      buyPerChi:  Math.round(item.buy  / 10),
      sellPerChi: Math.round(item.sell / 10),
      change: trackChange(item.name + '_sell', item.sell),
      source: 'sjc.com.vn',
    }));
  } else {
    // Fallback cứng
    const fallback = [
      { name: 'Vàng SJC 1L, 10L, 1KG',           buy: 1195000000, sell: 1215000000 },
      { name: 'Vàng nhẫn SJC 99,99 (1-2-5 chỉ)', buy: 1185000000, sell: 1195000000 },
    ];
    data = fallback.map(item => ({
      ...item,
      buyPerChi:  Math.round(item.buy  / 10),
      sellPerChi: Math.round(item.sell / 10),
      change: trackChange(item.name + '_sell', item.sell),
      source: 'fallback',
    }));
  }

  return NextResponse.json({
    source: data[0]?.source ?? 'fallback',
    updatedAt: now.toISOString(),
    worldPrice: webGia?.worldPrice ?? null,
    worldChange: webGia?.worldChange ?? null,
    data,
  }, {
    headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate' },
  });
}
