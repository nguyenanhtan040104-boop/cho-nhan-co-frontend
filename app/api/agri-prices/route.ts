import { NextResponse } from 'next/server';

// Fetch giá cà phê từ giacaphe.com
async function fetchCoffeePrice() {
  try {
    const res = await fetch('https://giacaphe.com/bang-gia-ca-phe/', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(5000),
    });
    const html = await res.text();
    // Tìm giá Robusta trong HTML
    const robustaMatch = html.match(/Robusta.*?(\d[\d,\.]+)\s*đ?\/kg/i) ||
      html.match(/(\d{2,3}[,\.]?\d{3})\s*(?:đ|VNĐ|vnd)?.*?[Rr]obusta/i);
    if (robustaMatch) {
      const price = parseInt(robustaMatch[1].replace(/[,\.]/g, '').slice(0, 6));
      if (price > 30000 && price < 200000) {
        return price;
      }
    }
    return null;
  } catch {
    return null;
  }
}

// Fetch tỷ giá USD từ Vietcombank
async function fetchUSDRate() {
  try {
    const res = await fetch('https://portal.vietcombank.com.vn/Usercontrols/TVPortal.TyGia/pXml.aspx?b=10', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(5000),
    });
    const xml = await res.text();
    const usdMatch = xml.match(/CurrencyCode="USD"[^>]*Buy="([\d,\.]+)"/i) ||
      xml.match(/<CurrencyCode>USD<\/CurrencyCode>[\s\S]*?<Sell>([\d,\.]+)<\/Sell>/i);
    if (usdMatch) {
      const rate = parseFloat(usdMatch[1].replace(/,/g, ''));
      if (rate > 20000 && rate < 35000) return rate;
    }
    return 25800; // fallback tỷ giá
  } catch {
    return 25800;
  }
}

export async function GET() {
  // Fetch song song
  const [coffeePrice, usdRate] = await Promise.all([
    fetchCoffeePrice(),
    fetchUSDRate(),
  ]);

  // Giá cà phê Robusta (VND/kg)
  const robusta = coffeePrice || 120000;
  const arabica = Math.round(robusta * 1.4);

  // Giá hồ tiêu (ước theo tỷ lệ thị trường)
  const pepper = Math.round(robusta * 0.72);

  // Giá cao su (RSS3 ~1.5 USD/kg)
  const rubberUsd = 1.5;
  const rubber = Math.round(rubberUsd * usdRate);

  const now = new Date().toISOString();

  const categories = [
    {
      category: 'Cà phê',
      icon: '☕',
      color: 'brown',
      source: coffeePrice ? 'giacaphe.com' : 'tham khảo',
      isLive: !!coffeePrice,
      items: [
        { name: 'Cà phê Robusta (nhân xô)', price: robusta, unit: 'kg', location: 'Tây Nguyên' },
        { name: 'Cà phê Arabica', price: arabica, unit: 'kg', location: 'Lâm Đồng' },
        { name: 'Cà phê nhân Robusta loại 1', price: Math.round(robusta * 1.05), unit: 'kg', location: 'Đắk Lắk' },
      ],
    },
    {
      category: 'Hồ tiêu',
      icon: '🌶',
      color: 'red',
      source: 'tham khảo',
      isLive: false,
      items: [
        { name: 'Hồ tiêu đen (tiêu sọ)', price: 150000, unit: 'kg', location: 'Bình Phước' },
        { name: 'Hồ tiêu trắng', price: 180000, unit: 'kg', location: 'Bà Rịa - Vũng Tàu' },
        { name: 'Hồ tiêu xanh tươi', price: 65000, unit: 'kg', location: 'Tây Nguyên' },
      ],
    },
    {
      category: 'Cao su',
      icon: '🌿',
      color: 'green',
      source: `tỷ giá ${usdRate.toLocaleString('vi-VN')}đ/USD`,
      isLive: true,
      items: [
        { name: 'Cao su SVR 10 (mủ khô)', price: rubber, unit: 'kg', location: 'Bình Dương' },
        { name: 'Cao su RSS3', price: Math.round(rubber * 1.05), unit: 'kg', location: 'Đồng Nai' },
        { name: 'Mủ cao su nước', price: Math.round(rubber * 0.4), unit: 'kg', location: 'Bình Phước' },
      ],
    },
    {
      category: 'Lúa gạo',
      icon: '🌾',
      color: 'yellow',
      source: 'tham khảo',
      isLive: false,
      items: [
        { name: 'Lúa tươi IR50404', price: 7200, unit: 'kg', location: 'An Giang' },
        { name: 'Gạo trắng thường (5% tấm)', price: 13500, unit: 'kg', location: 'Cần Thơ' },
        { name: 'Gạo thơm Jasmine', price: 16000, unit: 'kg', location: 'Kiên Giang' },
        { name: 'Nếp thơm', price: 18000, unit: 'kg', location: 'Đồng bằng SCL' },
      ],
    },
    {
      category: 'Trái cây',
      icon: '🍌',
      color: 'orange',
      source: 'tham khảo',
      isLive: false,
      items: [
        { name: 'Chuối già hương (xuất khẩu)', price: 8500, unit: 'kg', location: 'Đồng Nai' },
        { name: 'Sầu riêng Ri6', price: 65000, unit: 'kg', location: 'Tiền Giang' },
        { name: 'Xoài cát Hòa Lộc', price: 35000, unit: 'kg', location: 'Đồng Tháp' },
        { name: 'Thanh long ruột đỏ', price: 20000, unit: 'kg', location: 'Bình Thuận' },
      ],
    },
    {
      category: 'Rau củ',
      icon: '🥬',
      color: 'green',
      source: 'tham khảo',
      isLive: false,
      items: [
        { name: 'Rau muống', price: 8000, unit: 'kg', location: 'TP.HCM' },
        { name: 'Cải thảo', price: 12000, unit: 'kg', location: 'Lâm Đồng' },
        { name: 'Khoai lang tím', price: 18000, unit: 'kg', location: 'Vĩnh Long' },
        { name: 'Cà chua bi', price: 22000, unit: 'kg', location: 'Lâm Đồng' },
      ],
    },
    {
      category: 'Vật nuôi',
      icon: '🐷',
      color: 'pink',
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
      icon: '🐟',
      color: 'blue',
      source: 'tham khảo',
      isLive: false,
      items: [
        { name: 'Tôm sú (loại 20 con/kg)', price: 190000, unit: 'kg', location: 'Cà Mau' },
        { name: 'Cá tra (nguyên liệu)', price: 30000, unit: 'kg', location: 'An Giang' },
        { name: 'Tôm thẻ (loại 100 con/kg)', price: 95000, unit: 'kg', location: 'Bạc Liêu' },
        { name: 'Cua biển (loại 1)', price: 350000, unit: 'kg', location: 'Cà Mau' },
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
