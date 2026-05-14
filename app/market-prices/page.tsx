'use client';

import { useState, useEffect } from 'react';

export default function MarketPricesPage() {
  const [goldPrices, setGoldPrices] = useState<any[]>([]);
  const [goldUpdatedAt, setGoldUpdatedAt] = useState('');
  const [goldSource, setGoldSource] = useState('');
  const [goldLoading, setGoldLoading] = useState(true);
  const [goldData, setGoldData] = useState<any>(null);

  const [agriCategories, setAgriCategories] = useState<any[]>([]);
  const [agriLoading, setAgriLoading] = useState(true);
  const [agriUpdatedAt, setAgriUpdatedAt] = useState('');
  const [agriDateLabel, setAgriDateLabel] = useState('');
  const [openCat, setOpenCat] = useState<string>('');
  const [openProvince, setOpenProvince] = useState<string>('dakLak');

  useEffect(() => {
    fetch('/api/gold-prices').then(r => r.json()).then(d => {
      setGoldPrices(d.data || []); setGoldUpdatedAt(d.updatedAt || ''); setGoldSource(d.source || ''); setGoldData(d);
    }).catch(() => {}).finally(() => setGoldLoading(false));

    fetch('/api/agri-prices').then(r => r.json()).then(d => {
      setAgriCategories(d.categories || []);
      setAgriUpdatedAt(d.updatedAt || '');
      setAgriDateLabel(d.dateLabel || '');
      if (d.categories?.length > 0) setOpenCat(d.categories[0].category);
    }).catch(() => {}).finally(() => setAgriLoading(false));
  }, []);

  function refreshGold() {
    setGoldLoading(true);
    fetch('/api/gold-prices').then(r => r.json()).then(d => {
      setGoldPrices(d.data || []); setGoldUpdatedAt(d.updatedAt || ''); setGoldSource(d.source || ''); setGoldData(d);
    }).finally(() => setGoldLoading(false));
  }

  function refreshAgri() {
    setAgriLoading(true);
    fetch('/api/agri-prices').then(r => r.json()).then(d => {
      setAgriCategories(d.categories || []);
      setAgriUpdatedAt(d.updatedAt || '');
      setAgriDateLabel(d.dateLabel || '');
    }).finally(() => setAgriLoading(false));
  }

  const currentCat = agriCategories.find(c => c.category === openCat);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f5f0' }}>
      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #713f12 0%, #ca8a04 100%)' }} className="py-8">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-yellow-300 text-xs uppercase tracking-wider mb-1">Chợ Nhân Cơ</p>
          <h1 className="text-2xl font-bold text-white">Giá thị trường</h1>
          <p className="text-yellow-200 text-sm mt-1">
            {agriDateLabel || new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* ── Giá Vàng SJC ── */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow">
                <span className="text-base font-bold text-white">Au</span>
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Giá Vàng SJC Hôm Nay</h2>
                <p className="text-xs text-gray-500">
                  {goldSource === 'webgia.com' || goldSource === 'sjc.com.vn' ? 'Dữ liệu thực' : 'Dữ liệu tham khảo'}
                  {goldUpdatedAt && ` · ${new Date(goldUpdatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`}
                </p>
              </div>
            </div>
            <button onClick={refreshGold} className="text-yellow-600 hover:text-yellow-700 p-2 rounded-lg hover:bg-yellow-100 transition-colors">
              <i className={`ri-refresh-line text-lg ${goldLoading ? 'animate-spin' : ''}`}></i>
            </button>
          </div>

          {goldLoading ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-xl p-3 animate-pulse h-14"></div>)}</div>
          ) : (
            <>
              {goldData?.worldPrice && (
                <div className="bg-yellow-100/60 rounded-xl px-4 py-2.5 mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Vàng thế giới (XAU/USD)</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">${goldData.worldPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}/oz</span>
                    {goldData.worldChange != null && (
                      <span className={`text-sm font-semibold ${goldData.worldChange >= 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {goldData.worldChange >= 0 ? '▲' : '▼'} {Math.abs(goldData.worldChange).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div className="overflow-x-auto rounded-xl border border-yellow-100">
                <table className="w-full">
                  <thead className="bg-yellow-50 border-b border-yellow-100">
                    <tr>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Thương hiệu</th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Mua vào</th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Bán ra</th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Thay đổi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-yellow-50">
                    {goldPrices.map((item: any, i: number) => {
                      const ch = item.change;
                      return (
                        <tr key={i} className="hover:bg-yellow-50/40 transition-colors bg-white">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-bold text-blue-600 text-sm">{item.buy > 0 ? (item.buy / 1_000_000).toFixed(2) + ' tr' : '—'}</span>
                            <span className="text-xs text-gray-400 block">/{item.unit ?? 'lượng'}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-bold text-red-500 text-sm">{item.sell > 0 ? (item.sell / 1_000_000).toFixed(2) + ' tr' : '—'}</span>
                            <span className="text-xs text-gray-400 block">/{item.unit ?? 'lượng'}</span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium">
                            {ch == null || ch === 0 ? <span className="text-gray-300">—</span>
                              : ch > 0 ? <span className="text-red-500">▲ {(Math.abs(ch) / 1000).toFixed(0)}k</span>
                              : <span className="text-green-600">▼ {(Math.abs(ch) / 1000).toFixed(0)}k</span>}
                          </td>
                        </tr>
                      );
                    })}
                    {goldPrices.length === 0 && (
                      <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400 text-sm">Không thể tải giá vàng</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <p className="text-xs text-gray-400 mt-3 text-center">Nguồn: webgia.com · sjc.com.vn · 1 lượng = 10 chỉ = 37.5g · Chỉ mang tính tham khảo</p>
        </div>

        {/* ── Bảng Giá Hàng Hóa ── */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-green-50 to-emerald-50">
            <div>
              <h2 className="font-bold text-gray-900 text-lg">Bảng Giá Hàng Hóa Hôm Nay</h2>
              <p className="text-xs text-gray-500">
                {agriDateLabel}
                {agriUpdatedAt && ` · ${new Date(agriUpdatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`}
              </p>
            </div>
            <button onClick={refreshAgri} className="text-green-600 hover:text-green-700 p-2 rounded-lg hover:bg-green-100 transition-colors">
              <i className={`ri-refresh-line text-lg ${agriLoading ? 'animate-spin' : ''}`}></i>
            </button>
          </div>

          {agriLoading ? (
            <div className="p-6 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>)}</div>
          ) : (
            <>
              {/* Tab danh mục */}
              <div className="flex flex-wrap gap-1.5 px-5 py-3 border-b bg-gray-50">
                {agriCategories.map(cat => (
                  <button key={cat.category} onClick={() => setOpenCat(cat.category)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${openCat === cat.category ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                    {cat.category}
                    {cat.isLive && <span className={`w-1.5 h-1.5 rounded-full ${openCat === cat.category ? 'bg-green-200' : 'bg-green-500'}`}></span>}
                  </button>
                ))}
              </div>

              {/* Nội dung theo danh mục */}
              {currentCat && (
                <div>
                  <div className="px-5 py-2.5 bg-gray-50 border-b flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700">{currentCat.category}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${currentCat.isLive ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-100'}`}>
                      {currentCat.source}
                    </span>
                  </div>

                  {/* Cà phê nội địa — hiển thị bảng lịch sử theo tỉnh */}
                  {currentCat.type === 'coffee_history' && currentCat.provinces?.length > 0 ? (
                    <CoffeeHistoryTable provinces={currentCat.provinces} openProvince={openProvince} setOpenProvince={setOpenProvince} />
                  ) : (
                    /* Bảng thông thường cho các loại khác */
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                            <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500 uppercase">Giá</th>
                            <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500 uppercase">Thay đổi</th>
                            <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Khu vực</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {currentCat.items?.map((item: any, i: number) => {
                            const ch = item.change;
                            return (
                              <tr key={i} className="hover:bg-green-50/30 transition-colors">
                                <td className="px-5 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                                <td className="px-5 py-3 text-right">
                                  <span className="font-bold text-green-600">{item.price.toLocaleString('vi-VN')}đ</span>
                                  <span className="text-xs text-gray-400">/{item.unit}</span>
                                </td>
                                <td className="px-5 py-3 text-right text-sm font-medium">
                                  {ch == null || ch === 0 ? <span className="text-gray-300">—</span>
                                    : ch > 0 ? <span className="text-red-500">▲ {Math.abs(ch).toLocaleString('vi-VN')}</span>
                                    : <span className="text-green-600">▼ {Math.abs(ch).toLocaleString('vi-VN')}</span>}
                                </td>
                                <td className="px-5 py-3 text-sm text-gray-500 hidden sm:table-cell">{item.location}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <p className="text-xs text-gray-400 px-5 py-3 border-t text-center">
            Nguồn: giacafe.vn · banggianongsan.com · Vietcombank · Chỉ mang tính tham khảo
          </p>
        </div>

      </div>
    </div>
  );
}

function CoffeeHistoryTable({ provinces, openProvince, setOpenProvince }: {
  provinces: { key: string; province: string; rows: { date: string; price: number; change: number | null }[] }[];
  openProvince: string;
  setOpenProvince: (k: string) => void;
}) {
  const current = provinces.find(p => p.key === openProvince) || provinces[0];

  return (
    <div>
      {/* Tab tỉnh */}
      <div className="flex border-b border-gray-100 bg-blue-50/40 px-5 pt-3 gap-1 overflow-x-auto">
        {provinces.map(p => (
          <button key={p.key} onClick={() => setOpenProvince(p.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
              openProvince === p.key
                ? 'bg-white border border-b-0 border-blue-200 text-blue-700 -mb-px'
                : 'text-gray-500 hover:text-gray-700'
            }`}>
            {p.province}
          </button>
        ))}
      </div>

      {/* Bảng lịch sử */}
      {current && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase">Ngày</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-600 uppercase">Giá (VNĐ/kg)</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-600 uppercase">Thay đổi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {current.rows.map((row, i) => {
                const ch = row.change;
                return (
                  <tr key={i} className={`transition-colors ${i === 0 ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                    <td className="px-5 py-3 text-sm text-gray-700 font-medium">{row.date}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`font-bold text-sm ${i === 0 ? 'text-blue-700 text-base' : 'text-gray-800'}`}>
                        {row.price.toLocaleString('vi-VN')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-sm font-semibold">
                      {ch == null || ch === 0 ? <span className="text-gray-300 font-normal">—</span>
                        : ch > 0 ? <span className="text-red-500">+{Math.abs(ch).toLocaleString('vi-VN')}</span>
                        : <span className="text-green-600">-{Math.abs(ch).toLocaleString('vi-VN')}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-gray-400 px-5 py-2 border-t border-gray-50 bg-gray-50/50">
        Đơn vị tính: VNĐ/kg · Nguồn: giacafe.vn · Chỉ mang tính tham khảo
      </p>
    </div>
  );
}
