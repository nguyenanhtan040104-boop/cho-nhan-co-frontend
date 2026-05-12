'use client';

import { useState, useEffect } from 'react';

export default function MarketPricesPage() {
  // GiÃ¡ vÃ ng
  const [goldPrices, setGoldPrices] = useState<any[]>([]);
  const [goldUpdatedAt, setGoldUpdatedAt] = useState('');
  const [goldSource, setGoldSource] = useState('');
  const [goldLoading, setGoldLoading] = useState(true);
  const [goldData, setGoldData] = useState<any>(null);

  // GiÃ¡ hÃ ng hÃ³a
  const [agriCategories, setAgriCategories] = useState<any[]>([]);
  const [agriLoading, setAgriLoading] = useState(true);
  const [agriUpdatedAt, setAgriUpdatedAt] = useState('');
  const [agriDateLabel, setAgriDateLabel] = useState('');
  const [openCat, setOpenCat] = useState<string>('');

  useEffect(() => {
    fetch('/api/gold-prices')
      .then(r => r.json())
      .then(d => {
        setGoldPrices(d.data || []);
        setGoldUpdatedAt(d.updatedAt || '');
        setGoldSource(d.source || '');
        setGoldData(d);
      })
      .catch(() => {})
      .finally(() => setGoldLoading(false));

    fetch('/api/agri-prices')
      .then(r => r.json())
      .then(d => {
        setAgriCategories(d.categories || []);
        setAgriUpdatedAt(d.updatedAt || '');
        setAgriDateLabel(d.dateLabel || '');
        if (d.categories?.length > 0) setOpenCat(d.categories[0].category);
      })
      .catch(() => {})
      .finally(() => setAgriLoading(false));
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-5">
          <h1 className="text-2xl font-bold text-gray-900">GiÃ¡ thá»‹ trÆ°á»ng</h1>
          <p className="text-gray-500 text-sm mt-1">
            {agriDateLabel || new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* â”€â”€ GiÃ¡ VÃ ng SJC â”€â”€ */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow">
                <span className="text-lg font-bold text-white">Au</span>
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">GiÃ¡ VÃ ng SJC HÃ´m Nay</h2>
                <p className="text-xs text-gray-500">
                  {goldSource === 'webgia.com' || goldSource === 'sjc.com.vn' ? 'ðŸŸ¢ Dá»¯ liá»‡u thá»±c' : 'ðŸŸ¡ Dá»¯ liá»‡u tham kháº£o'}
                  {goldUpdatedAt && ` â€¢ ${new Date(goldUpdatedAt).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })} ${new Date(goldUpdatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`}
                </p>
              </div>
            </div>
            <button onClick={refreshGold} className="text-yellow-600 hover:text-yellow-700 p-2 rounded-lg hover:bg-yellow-100 transition-colors">
              <i className={`ri-refresh-line text-lg ${goldLoading ? 'animate-spin' : ''}`}></i>
            </button>
          </div>

          {goldLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-3 animate-pulse h-14"></div>
              ))}
            </div>
          ) : (
            <>
              {/* GiÃ¡ vÃ ng tháº¿ giá»›i */}
              {goldData?.worldPrice && (
                <div className="bg-yellow-100/60 rounded-xl px-4 py-2.5 mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">ðŸŒ VÃ ng tháº¿ giá»›i (XAU/USD)</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">${goldData.worldPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}/oz</span>
                    {goldData.worldChange != null && (
                      <span className={`text-sm font-semibold ${goldData.worldChange >= 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {goldData.worldChange >= 0 ? 'â–²' : 'â–¼'} {Math.abs(goldData.worldChange).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Báº£ng giÃ¡ vÃ ng trong nÆ°á»›c */}
              <div className="overflow-x-auto rounded-xl border border-yellow-100">
                <table className="w-full">
                  <thead className="bg-yellow-50 border-b border-yellow-100">
                    <tr>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">ThÆ°Æ¡ng hiá»‡u</th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Mua vÃ o</th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">BÃ¡n ra</th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Per chá»‰</th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Thay Ä‘á»•i</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-yellow-50">
                    {goldPrices.map((item: any, i: number) => {
                      const ch = item.change;
                      return (
                        <tr key={i} className="hover:bg-yellow-50/40 transition-colors bg-white">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-bold text-blue-600 text-sm">
                              {item.buy > 0 ? (item.buy / 1_000_000).toFixed(2) + ' tr' : 'â€”'}
                            </span>
                            <span className="text-xs text-gray-400 block">/{item.unit ?? 'lÆ°á»£ng'}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-bold text-red-500 text-sm">
                              {item.sell > 0 ? (item.sell / 1_000_000).toFixed(2) + ' tr' : 'â€”'}
                            </span>
                            <span className="text-xs text-gray-400 block">/{item.unit ?? 'lÆ°á»£ng'}</span>
                          </td>
                          <td className="px-4 py-3 text-right hidden sm:table-cell">
                            {item.sellPerChi > 0 && (
                              <span className="text-sm text-gray-600">
                                {(item.sellPerChi / 1_000_000).toFixed(2)} tr<span className="text-xs text-gray-400">/chá»‰</span>
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium">
                            {ch == null || ch === 0
                              ? <span className="text-gray-300">â€”</span>
                              : ch > 0
                                ? <span className="text-red-500">â–² {(Math.abs(ch) / 1000).toFixed(0)}k</span>
                                : <span className="text-green-600">â–¼ {(Math.abs(ch) / 1000).toFixed(0)}k</span>
                            }
                          </td>
                        </tr>
                      );
                    })}
                    {goldPrices.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400 text-sm">KhÃ´ng thá»ƒ táº£i giÃ¡ vÃ ng</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <p className="text-xs text-gray-400 mt-3 text-center">Nguá»“n: webgia.com â€¢ sjc.com.vn â€¢ 1 lÆ°á»£ng = 10 chá»‰ = 37.5g â€¢ Chá»‰ mang tÃ­nh tham kháº£o</p>
        </div>

        {/* â”€â”€ Báº£ng GiÃ¡ HÃ ng HÃ³a â”€â”€ */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-green-50 to-emerald-50">
            <div>
              <h2 className="font-bold text-gray-900 text-lg">Báº£ng GiÃ¡ HÃ ng HÃ³a HÃ´m Nay</h2>
              <p className="text-xs text-gray-500">
                {agriDateLabel || ''}
                {agriUpdatedAt && ` â€¢ ${new Date(agriUpdatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`}
              </p>
            </div>
            <button onClick={refreshAgri} className="text-green-600 hover:text-green-700 p-2 rounded-lg hover:bg-green-100 transition-colors">
              <i className={`ri-refresh-line text-lg ${agriLoading ? 'animate-spin' : ''}`}></i>
            </button>
          </div>

          {agriLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>)}
            </div>
          ) : (
            <>
              {/* Tab chá»n danh má»¥c */}
              <div className="flex flex-wrap gap-1.5 px-5 py-3 border-b bg-gray-50">
                {agriCategories.map(cat => (
                  <button key={cat.category}
                    onClick={() => setOpenCat(cat.category)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${openCat === cat.category ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                    {cat.category}
                    {cat.isLive && (
                      <span className={`w-1.5 h-1.5 rounded-full ${openCat === cat.category ? 'bg-green-200' : 'bg-green-500'}`}></span>
                    )}
                  </button>
                ))}
              </div>

              {/* Báº£ng giÃ¡ */}
              {agriCategories.filter(cat => cat.category === openCat).map(cat => (
                <div key={cat.category}>
                  <div className="px-5 py-2.5 bg-gray-50 border-b flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700">{cat.category}</span>
                    {cat.isLive
                      ? <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">ðŸŸ¢ {cat.source}</span>
                      : <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{cat.source}</span>
                    }
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase">Sáº£n pháº©m</th>
                          <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500 uppercase">GiÃ¡</th>
                          <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500 uppercase">Thay Ä‘á»•i</th>
                          <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Khu vá»±c</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {cat.items.map((item: any, i: number) => {
                          const ch = item.change;
                          return (
                            <tr key={i} className="hover:bg-green-50/30 transition-colors">
                              <td className="px-5 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                              <td className="px-5 py-3 text-right">
                                <span className="font-bold text-green-600">{item.price.toLocaleString('vi-VN')}Ä‘</span>
                                <span className="text-xs text-gray-400">/{item.unit}</span>
                              </td>
                              <td className="px-5 py-3 text-right text-sm font-medium">
                                {ch == null || ch === 0
                                  ? <span className="text-gray-300">â€”</span>
                                  : ch > 0
                                    ? <span className="text-red-500">â–² {Math.abs(ch).toLocaleString('vi-VN')}</span>
                                    : <span className="text-green-600">â–¼ {Math.abs(ch).toLocaleString('vi-VN')}</span>
                                }
                              </td>
                              <td className="px-5 py-3 text-sm text-gray-500 hidden sm:table-cell">{item.location}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {!openCat && (
                <div className="px-5 py-8 text-center text-gray-400 text-sm">Chá»n danh má»¥c Ä‘á»ƒ xem báº£ng giÃ¡</div>
              )}
            </>
          )}

          <p className="text-xs text-gray-400 px-5 py-3 border-t text-center">
            Nguá»“n: giacafe.vn â€¢ webgia.com â€¢ banggianongsan.com â€¢ Vietcombank â€¢ Chá»‰ mang tÃ­nh tham kháº£o
          </p>
        </div>

      </div>
    </div>
  );
}
