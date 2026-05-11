import { NextResponse } from 'next/server';

// Fetch giá cà phê từ giacaphe.com/gia-ca-phe-noi-dia/
async function fetchCoffeePrices(): Promise<{ dak_lak: number | null; lam_dong: number | null; gia_lai: number | null; dak_nong: number | null; ho_tieu: number | null }> {
  try {
    const res = await fetch('https://giacaphe.com/gia-ca-phe-noi-dia/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(7000),
    });
    const html = await res.text();

    function extractPrice(pattern: RegExp): number | null {
      const m = html.match(pattern);
      if (!m) return null;
      const raw = m[1].replace(/[,\.\s]/g, '');
      const n = parseInt(raw.length > 6 ? raw.slice(0, 6) : raw);
      return (n > 30000 && n < 250000) ? n : null;
    }

    // Tìm giá theo từng tỉnh trong bảng HTML
    const dakLak = extractPrice(/Đắk\s*Lắk[\s\S]{0,200}?(\d{2,3}[,\.]?\d{3})/i)
      || extractPrice(/(\d{2,3}[,\.]?\d{3})[\s\S]{0,50}?Đắk\s*Lắk/i);
    const lamDong = extractPrice(/Lâm\s*Đồng[\s\S]{0,200}?(\d{2,3}[,\.]?\d{3})/i)
      || extractPrice(/(\d{2,3}[,\.]?\d{3})[\s\S]{0,50}?Lâm\s*Đồng/i);
    const giaLai = extractPrice(/Gia\s*Lai[\s\S]{0,200}?(\d{2,3}[,\.]?\d{3})/i)
      || extractPrice(/(\d{2,3}[,\.]?\d{3})[\s\S]{0,50}?Gia\s*Lai/i);
    const dakNong = extractPrice(/Đắk\s*Nông[\s\S]{0,200}?(\d{2,3}[,\.]?\d{3})/i)
      || extractPrice(/(\d{2,3}[,\.]?\d{3})[\s\S]{0,50}?Đắk\s*Nông/i);
    const hoTieu = extractPrice(/[Hh]ồ\s*[Tt]iêu[\s\S]{0,200}?(\d{3}[,\.]?\d{3})/i)
      || extractPrice(/(\d{3}[,\.]?\d{3})[\s\S]{0,50}?[Hh]ồ\s*[Tt]iêu/i);

    return { dak_lak: dakLak, lam_dong: lamDong, gia_lai: giaLai, dak_nong: dakNong, ho_tieu: hoTieu };
  } catch {
    return { dak_lak: null, lam_dong: null, gia_lai: null, dak_nong: null, ho_tieu: null };
  }
}

// Fetch tỷ giá USD từ Vietcombank
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

export async function GET() {
  const [coffeePrices, usdRate] = await Promise.all([
    fetchCoffeePrices(),
    fetchUSDRate(),
  ]);

  const isLiveCoffee = !!(coffeePrices.dak_lak || coffeePrices.lam_dong);

  // Fallback prices nếu không fetch được
  const dakLak = coffeePrices.dak_lak || 87000;
  const lamDong = coffeePrices.lam_dong || 86300;
  const giaLai = coffeePrices.gia_lai || 87000;
  const dakNong = coffeePrices.dak_nong || 87100;
  const hoTieu = coffeePrices.ho_tieu || 143000;
  const avgCoffee = Math.round((dakLak + lamDong + giaLai + dakNong) / 4);

  // Cao su: SVR10 ~1.5 USD/kg
  const rubberUsd = 1.5;
  const rubber = Math.round(rubberUsd * usdRate);

  const now = new Date().toISOString();

  const categories = [
    {
      category: 'Cà phê',
      source: isLiveCoffee ? 'giacaphe.com' : 'tham khảo',
      isLive: isLiveCoffee,
      items: [
        { name: 'Robusta - Đắk Lắk', price: dakLak, unit: 'kg', location: 'Đắk Lắk' },
        { name: 'Robusta - Lâm Đồng', price: lamDong, unit: 'kg', location: 'Lâm Đồng' },
        { name: 'Robusta - Gia Lai', price: giaLai, unit: 'kg', location: 'Gia Lai' },
        { name: 'Robusta - Đắk Nông', price: dakNong, unit: 'kg', location: 'Đắk Nông' },
        { name: 'Arabica (nhân xô)', price: Math.round(avgCoffee * 1.4), unit: 'kg', location: 'Lâm Đồng' },
      ],
    },
    {
      category: 'Hồ tiêu',
      source: isLiveCoffee ? 'giacaphe.com' : 'tham khảo',
      isLive: isLiveCoffee,
      items: [
        { name: 'Hồ tiêu đen (tiêu sọ)', price: hoTieu, unit: 'kg', location: 'Bình Phước' },
        { name: 'Hồ tiêu trắng', price: Math.round(hoTieu * 1.2), unit: 'kg', location: 'Bà Rịa - Vũng Tàu' },
        { name: 'Hồ tiêu xanh tươi', price: Math.round(hoTieu * 0.45), unit: 'kg', location: 'Tây Nguyên' },
      ],
    },
    {
      category: 'Cao su',
      source: `tỷ giá ${usdRate.toLocaleString('vi-VN')}đ/USD`,
      isLive: true,
      items: [
        { name: 'Cao su SVR 10 (mủ khô)', price: rubber, unit: 'kg', location: 'Bình Dương' },
        { name: 'Cao su RSS3', price: Math.round(rubber * 1.05), unit: 'kg', location: 'Đồng Nai' },
        { name: 'Mủ cao su nước', price: Math.round(rubber * 0.4), unit: 'kg', location: 'Bình Phước' },
      ],
    },
    {
      category: 'Sầu riêng',
      source: 'tham khảo',
      isLive: false,
      items: [
        { name: 'Sầu riêng Ri6 (tại vườn)', price: 65000, unit: 'kg', location: 'Tiền Giang' },
        { name: 'Sầu riêng Monthong (xuất khẩu)', price: 95000, unit: 'kg', location: 'Đắk Lắk' },
        { name: 'Sầu riêng Musang King', price: 120000, unit: 'kg', location: 'Lâm Đồng' },
        { name: 'Sầu riêng Dona (tại vườn)', price: 58000, unit: 'kg', location: 'Đồng Nai' },
      ],
    },
    {
      category: 'Lúa gạo',
      source: 'tham khảo',
      isLive: false,
      items: [
        { name: 'Lúa tươi IR50404', price: 7200, unit: 'kg', location: 'An Giang' },
        { name: 'Lúa OM5451', price: 7800, unit: 'kg', location: 'Kiên Giang' },
        { name: 'Gạo trắng thường (5% tấm)', price: 13500, unit: 'kg', location: 'Cần Thơ' },
        { name: 'Gạo thơm Jasmine', price: 16000, unit: 'kg', location: 'Kiên Giang' },
        { name: 'Nếp thơm', price: 18000, unit: 'kg', location: 'Đồng bằng SCL' },
      ],
    },
    {
      category: 'Trái cây',
      source: 'tham khảo',
      isLive: false,
      items: [
        { name: 'Chuối già hương (xuất khẩu)', price: 8500, unit: 'kg', location: 'Đồng Nai' },
        { name: 'Xoài cát Hòa Lộc', price: 35000, unit: 'kg', location: 'Đồng Tháp' },
        { name: 'Thanh long ruột đỏ', price: 20000, unit: 'kg', location: 'Bình Thuận' },
        { name: 'Bưởi da xanh', price: 28000, unit: 'kg', location: 'Bến Tre' },
        { name: 'Vải thiều', price: 25000, unit: 'kg', location: 'Bắc Giang' },
      ],
    },
    {
      category: 'Rau củ',
      source: 'tham khảo',
      isLive: false,
      items: [
        { name: 'Rau muống', price: 8000, unit: 'kg', location: 'TP.HCM' },
        { name: 'Cải thảo', price: 12000, unit: 'kg', location: 'Lâm Đồng' },
        { name: 'Khoai lang tím', price: 18000, unit: 'kg', location: 'Vĩnh Long' },
        { name: 'Cà chua bi', price: 22000, unit: 'kg', location: 'Lâm Đồng' },
        { name: 'Hành tím', price: 30000, unit: 'kg', location: 'Sóc Trăng' },
      ],
    },
    {
      category: 'Vật nuôi',
      source: 'tham khảo',
      isLive: false,
      items: [
        { name: 'Heo hơi (tại chuồng)', price: 62000, unit: 'kg', location: 'Đồng Nai' },
        { name: 'Bò hơi (loại 1)', price: 72000, unit: 'kg', location: 'Bình Định' },
        { name: 'Gà ta hơi', price: 85000, unit: 'kg', location: 'Bình Dương' },
        { name: 'Vịt hơi', price: 55000, unit: 'kg', location: 'Cần Thơ' },
      ],
    },
    {
      category: 'Thủy sản',
      source: 'tham khảo',
      isLive: false,
      items: [
        { name: 'Tôm sú (loại 20 con/kg)', price: 190000, unit: 'kg', location: 'Cà Mau' },
        { name: 'Cá tra (nguyên liệu)', price: 30000, unit: 'kg', location: 'An Giang' },
        { name: 'Tôm thẻ (loại 100 con/kg)', price: 95000, unit: 'kg', location: 'Bạc Liêu' },
        { name: 'Cua biển (loại 1)', price: 350000, unit: 'kg', location: 'Cà Mau' },
      ],
    },
    {
      category: 'Xăng dầu',
      source: 'tham khảo',
      isLive: false,
      items: [
        { name: 'Xăng RON 95-III', price: 21170, unit: 'lít', location: 'Toàn quốc' },
        { name: 'Xăng E5 RON 92', price: 20670, unit: 'lít', location: 'Toàn quốc' },
        { name: 'Dầu diesel 0.05S', price: 18950, unit: 'lít', location: 'Toàn quốc' },
        { name: 'Dầu hỏa', price: 19090, unit: 'lít', location: 'Toàn quốc' },
        { name: 'Dầu mazut 180CST 3.5S', price: 16120, unit: 'kg', location: 'Toàn quốc' },
      ],
    },
  ];

  return NextResponse.json({
    updatedAt: now,
    usdRate,
    categories,
  }, {
    headers: { 'Cache-Control': 's-maxage=600, stale-while-revalidate' },
  });
}
