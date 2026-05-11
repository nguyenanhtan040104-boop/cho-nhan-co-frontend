import { NextResponse } from 'next/server';

// Fetch giá vàng SJC thực tế từ API chính thức
export async function GET() {
  try {
    const res = await fetch('https://sjc.com.vn/GoldPrice/Services/PriceService.ashx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://sjc.com.vn/',
      },
      next: { revalidate: 300 }, // cache 5 phút
    });

    if (!res.ok) throw new Error('SJC API error');
    const xml = await res.text();

    // Parse XML
    const items: { name: string; buy: number; sell: number; unit: string }[] = [];
    const groupRegex = /<NhomGia>([\s\S]*?)<\/NhomGia>/g;
    let match;

    while ((match = groupRegex.exec(xml)) !== null) {
      const block = match[1];
      const nameMatch = block.match(/<Ten>(.*?)<\/Ten>/);
      const buyMatch = block.match(/<GiaMua>(.*?)<\/GiaMua>/);
      const sellMatch = block.match(/<GiaBan>(.*?)<\/GiaBan>/);

      if (nameMatch && buyMatch && sellMatch) {
        const buy = parseFloat(buyMatch[1].replace(/,/g, '')) * 10000;
        const sell = parseFloat(sellMatch[1].replace(/,/g, '')) * 10000;
        if (buy > 0 || sell > 0) {
          items.push({
            name: nameMatch[1].trim(),
            buy,
            sell,
            unit: 'lượng',
          });
        }
      }
    }

    return NextResponse.json({
      source: 'SJC',
      updatedAt: new Date().toISOString(),
      data: items,
    });
  } catch (e) {
    // Fallback: trả về giá mẫu nếu SJC không phản hồi
    return NextResponse.json({
      source: 'fallback',
      updatedAt: new Date().toISOString(),
      data: [
        { name: 'Vàng SJC 1L, 10L, 1KG', buy: 119500000, sell: 121500000, unit: 'lượng' },
        { name: 'Vàng nhẫn SJC 99,99 (1-2-5 chỉ)', buy: 118500000, sell: 119500000, unit: 'lượng' },
      ],
    });
  }
}
