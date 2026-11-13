'use client';

import { useState, useEffect } from 'react';

const vnd = (n: number) => n.toLocaleString('vi-VN');

// Direction is shown by sign and arrow as well as colour. Colours follow the
// Vietnamese price-board habit: up is green, down is red.
function Change({ value, unit = '', digits }: { value: number | null | undefined; unit?: string; digits?: (n: number) => string }) {
  if (value == null || value === 0) return <span className="text-ink-faint">-</span>;
  const abs = Math.abs(value);
  const text = digits ? digits(abs) : vnd(abs);
  return value > 0
    ? <span className="font-semibold text-forest-700">▲ +{text}{unit}</span>
    : <span className="font-semibold text-brand-600">▼ -{text}{unit}</span>;
}

const th = 'px-4 py-2.5 text-[12px] font-semibold text-ink-soft sm:px-5';
const td = 'px-4 py-3 sm:px-5';

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
  const [agriPriceDate, setAgriPriceDate] = useState('');
  const [openCat, setOpenCat] = useState<string>('');
  const [openProvince, setOpenProvince] = useState<string>('dakLak');

  const loadGold = () => {
    setGoldLoading(true);
    return fetch('/api/gold-prices').then(r => r.json()).then(d => {
      setGoldPrices(d.data || []); setGoldUpdatedAt(d.updatedAt || ''); setGoldSource(d.source || ''); setGoldData(d);
    }).catch(() => {}).finally(() => setGoldLoading(false));
  };

  const loadAgri = (first = false) => {
    setAgriLoading(true);
    return fetch('/api/agri-prices').then(r => r.json()).then(d => {
      setAgriCategories(d.categories || []);
      setAgriUpdatedAt(d.updatedAt || '');
      setAgriDateLabel(d.dateLabel || ''); setAgriPriceDate(d.priceDate || '');
      if (first && d.categories?.length > 0) setOpenCat(d.categories[0].category);
    }).catch(() => {}).finally(() => setAgriLoading(false));
  };

  useEffect(() => { loadGold(); loadAgri(true); }, []);

  const currentCat = agriCategories.find(c => c.category === openCat);
  const time = (iso: string) => new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const goldReal = goldSource === 'webgia.com' || goldSource === 'sjc.com.vn';

  return (
    <div className="min-h-screen bg-paper pb-10">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto max-w-content px-4 py-5 sm:px-6">
          <h1 className="text-[1.5rem] font-bold leading-tight text-ink sm:text-3xl">Giá thị trường hôm nay</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {agriDateLabel || new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-content space-y-6 px-4 pt-5 sm:px-6">
        {/* ── Nông sản, hàng hóa ── */}
        <section className="card overflow-hidden" aria-labelledby="hh">
          <div className="flex items-start justify-between gap-3 px-4 py-4 sm:px-5">
            <div>
              <h2 id="hh" className="text-lg font-bold text-ink">Nông sản và hàng hóa</h2>
              <p className="mt-0.5 text-[12px] text-ink-faint">
                {agriPriceDate && `Giá ngày ${agriPriceDate}`}
                {agriUpdatedAt && `${agriPriceDate ? ' · ' : ''}cập nhật lúc ${time(agriUpdatedAt)}`}
              </p>
            </div>
            <button onClick={() => loadAgri()} disabled={agriLoading} className="btn-ghost shrink-0 !px-3 !py-1.5 text-[13px] disabled:opacity-50">
              <i className={`ri-refresh-line ${agriLoading ? 'animate-spin' : ''}`} aria-hidden="true" /> Làm mới
            </button>
          </div>

          {agriLoading && agriCategories.length === 0 ? (
            <div className="space-y-2 px-4 pb-5 sm:px-5">{[...Array(4)].map((_, i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-paper" />)}</div>
          ) : (
            <>
              <div className="no-scrollbar flex gap-2 overflow-x-auto border-y border-line px-4 py-3 sm:px-5">
                {agriCategories.map(cat => (
                  <button key={cat.category} onClick={() => setOpenCat(cat.category)} className={`chip shrink-0 ${openCat === cat.category ? 'chip-active' : ''}`}>{cat.category}</button>
                ))}
              </div>

              {currentCat && (
                <div>
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-[12px] text-ink-faint sm:px-5">
                    <span>Nguồn: {currentCat.source}</span>
                    {!currentCat.isLive && <span className="font-semibold text-gold-700">Dữ liệu tham khảo, chưa phải giá trực tiếp</span>}
                  </p>
                  {currentCat.note && <p className="mx-4 mb-2 rounded-lg border border-gold-200 bg-gold-50 px-3 py-2 text-[13px] text-gold-800 sm:mx-5">{currentCat.note}</p>}

                  {currentCat.type === 'coffee_history' && currentCat.provinces?.length > 0 ? (
                    <CoffeeHistoryTable provinces={currentCat.provinces} openProvince={openProvince} setOpenProvince={setOpenProvince} />
                  ) : currentCat.type === 'fuel_table' ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <caption className="sr-only">Giá xăng dầu theo vùng</caption>
                        <thead className="border-y border-line bg-paper">
                          <tr><th scope="col" className={`${th} text-left`}>Sản phẩm</th><th scope="col" className={`${th} text-right`}>Vùng 1</th><th scope="col" className={`${th} text-right`}>Vùng 2</th></tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                          {currentCat.items?.map((item: any, i: number) => (
                            <tr key={i}>
                              <th scope="row" className={`${td} text-left text-sm font-medium text-ink`}>{item.name}</th>
                              <td className={`${td} text-right`}><b className="tabular-nums text-ink">{vnd(item.price)}đ</b><span className="text-[12px] text-ink-faint">/{item.unit}</span></td>
                              <td className={`${td} text-right tabular-nums text-ink-soft`}>{item.price2 ? <>{vnd(item.price2)}đ<span className="text-[12px] text-ink-faint">/{item.unit}</span></> : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <p className="border-t border-line px-4 py-2.5 text-[12px] text-ink-faint sm:px-5">Vùng 1: đồng bằng. Vùng 2: miền núi, hải đảo. Nguồn: Petrolimex, Bộ Công Thương.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <caption className="sr-only">Giá {currentCat.category}</caption>
                        <thead className="border-y border-line bg-paper">
                          <tr>
                            <th scope="col" className={`${th} text-left`}>Sản phẩm</th>
                            <th scope="col" className={`${th} text-right`}>Giá</th>
                            <th scope="col" className={`${th} text-right`}>Thay đổi</th>
                            <th scope="col" className={`${th} hidden text-left sm:table-cell`}>Khu vực</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                          {(!currentCat.items || currentCat.items.length === 0) && (
                            <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-ink-faint">Chưa lấy được giá từ nguồn này. Thử làm mới sau ít phút.</td></tr>
                          )}
                          {currentCat.items?.map((item: any, i: number) => (
                            <tr key={i}>
                              <th scope="row" className={`${td} text-left text-sm font-medium text-ink`}>{item.name}</th>
                              <td className={`${td} text-right`}>
                                <b className="tabular-nums text-forest-700">{vnd(item.price)}{item.priceMax ? ` - ${vnd(item.priceMax)}` : ''}đ</b>
                                <span className="text-[12px] text-ink-faint">/{item.unit}</span>
                              </td>
                              <td className={`${td} text-right text-sm tabular-nums`}><Change value={item.change} /></td>
                              <td className={`${td} hidden text-sm text-ink-soft sm:table-cell`}>{item.location}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <p className="border-t border-line px-4 py-3 text-[12px] text-ink-faint sm:px-5">
            Nguồn: giacafe.vn, banggianongsan.com, webgia.com. Chỉ để tham khảo, giá thực tế tùy nơi thu mua.
          </p>
        </section>

        {/* ── Vàng ── */}
        <section className="card overflow-hidden" aria-labelledby="vang">
          <div className="flex items-start justify-between gap-3 px-4 py-4 sm:px-5">
            <div>
              <h2 id="vang" className="text-lg font-bold text-ink">Giá vàng SJC</h2>
              <p className="mt-0.5 text-[12px] text-ink-faint">
                {goldReal ? 'Dữ liệu thực' : 'Dữ liệu tham khảo'}
                {goldData?.sourceUpdatedAt ? ` · cập nhật ${goldData.sourceUpdatedAt}` : goldUpdatedAt ? ` · cập nhật lúc ${time(goldUpdatedAt)}` : ''}
              </p>
            </div>
            <button onClick={() => loadGold()} disabled={goldLoading} className="btn-ghost shrink-0 !px-3 !py-1.5 text-[13px] disabled:opacity-50">
              <i className={`ri-refresh-line ${goldLoading ? 'animate-spin' : ''}`} aria-hidden="true" /> Làm mới
            </button>
          </div>

          {goldLoading && goldPrices.length === 0 ? (
            <div className="space-y-2 px-4 pb-5 sm:px-5">{[...Array(3)].map((_, i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-paper" />)}</div>
          ) : (
            <>
              {goldData?.worldPrice && (
                <p className="flex flex-wrap items-center justify-between gap-x-4 border-t border-line px-4 py-2.5 text-sm sm:px-5">
                  <span className="text-ink-soft">Vàng thế giới (XAU/USD)</span>
                  <span>
                    <b className="tabular-nums text-ink">${goldData.worldPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}/oz</b>
                    {goldData.worldChange != null && goldData.worldChange !== 0 && (
                      <span className="ml-3 tabular-nums"><Change value={goldData.worldChange} digits={n => n.toFixed(2)} /></span>
                    )}
                  </span>
                </p>
              )}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <caption className="sr-only">Giá vàng miếng SJC</caption>
                  <thead className="border-y border-line bg-paper">
                    <tr>
                      <th scope="col" className={`${th} text-left`}>Hệ thống</th>
                      <th scope="col" className={`${th} text-right`}>Mua vào</th>
                      <th scope="col" className={`${th} text-right`}>Bán ra</th>
                      <th scope="col" className={`${th} text-right`}>Thay đổi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {goldPrices.map((item: any, i: number) => (
                      <tr key={i}>
                        <th scope="row" className={`${td} text-left text-sm font-medium text-ink`}>{item.name}</th>
                        <td className={`${td} text-right tabular-nums text-ink-soft`}>
                          {item.buy > 0 ? (item.buy / 1_000_000).toFixed(2) + ' tr' : '-'}
                          <span className="block text-[11px] text-ink-faint">/{item.unit ?? 'lượng'}</span>
                        </td>
                        <td className={`${td} text-right tabular-nums`}>
                          <b className="text-ink">{item.sell > 0 ? (item.sell / 1_000_000).toFixed(2) + ' tr' : '-'}</b>
                          <span className="block text-[11px] text-ink-faint">/{item.unit ?? 'lượng'}</span>
                        </td>
                        <td className={`${td} text-right text-sm tabular-nums`}><Change value={item.change} unit="k" digits={n => (n / 1000).toFixed(0)} /></td>
                      </tr>
                    ))}
                    {goldPrices.length === 0 && (
                      <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-ink-faint">Không tải được giá vàng. Thử làm mới sau ít phút.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <p className="border-t border-line px-4 py-3 text-[12px] leading-relaxed text-ink-faint sm:px-5">
            Nguồn: webgia.com. Giá vàng miếng SJC tại TP.HCM; vàng nhẫn và trang sức có giá riêng. 1 lượng = 10 chỉ = 37,5 g. Chỉ để tham khảo.
          </p>
        </section>
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
      <div className="no-scrollbar flex gap-5 overflow-x-auto border-b border-line px-4 sm:px-5" role="tablist" aria-label="Chọn tỉnh">
        {provinces.map(p => (
          <button key={p.key} role="tab" aria-selected={current?.key === p.key} onClick={() => setOpenProvince(p.key)}
            className={`shrink-0 border-b-2 py-2.5 text-sm font-semibold ${current?.key === p.key ? 'border-forest-600 text-forest-700' : 'border-transparent text-ink-soft hover:text-ink'}`}>
            {p.province}
          </button>
        ))}
      </div>

      {current && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <caption className="sr-only">Giá cà phê {current.province} theo ngày</caption>
            <thead className="border-b border-line bg-paper">
              <tr>
                <th scope="col" className={`${th} text-left`}>Ngày</th>
                <th scope="col" className={`${th} text-right`}>Giá (đồng/kg)</th>
                <th scope="col" className={`${th} text-right`}>Thay đổi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {current.rows.map((row, i) => (
                <tr key={i} className={i === 0 ? 'bg-forest-50/60' : ''}>
                  <th scope="row" className={`${td} text-left text-sm font-medium text-ink`}>{row.date}{i === 0 && <span className="ml-2 text-[11px] font-semibold text-forest-700">Mới nhất</span>}</th>
                  <td className={`${td} text-right tabular-nums ${i === 0 ? 'text-base font-bold text-forest-700' : 'text-sm font-semibold text-ink'}`}>{vnd(row.price)}</td>
                  <td className={`${td} text-right text-sm tabular-nums`}><Change value={row.change} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="border-t border-line px-4 py-2.5 text-[12px] text-ink-faint sm:px-5">Đơn vị: đồng/kg. Nguồn: giacafe.vn. Chỉ để tham khảo.</p>
    </div>
  );
}
