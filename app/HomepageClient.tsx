'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SEARCH_ROUTES: { keywords: string[]; route: string }[] = [
  { keywords: ['bất động sản', 'bat dong san', 'bds', 'nhà đất', 'nha dat', 'phòng trọ', 'phong tro', 'căn hộ', 'can ho', 'mặt bằng'], route: '/real-estate' },
  { keywords: ['việc làm', 'viec lam', 'tuyển dụng', 'tuyen dung', 'xin việc', 'xin viec', 'nhân công', 'nhan cong', 'tìm việc'], route: '/jobs' },
  { keywords: ['diễn đàn', 'dien dan', 'forum', 'hỏi đáp', 'hoi dap'], route: '/forum' },
  { keywords: ['cảnh báo', 'canh bao', 'lừa đảo', 'lua dao'], route: '/canh-bao' },
  { keywords: ['quảng cáo', 'quang cao', 'khai trương', 'khuyến mãi'], route: '/advertisements' },
  { keywords: ['nông sản', 'nong san', 'thực phẩm', 'thuc pham', 'rau củ', 'trái cây'], route: '/products?category=NONG_SAN' },
  { keywords: ['vật nuôi', 'vat nuoi', 'chó', 'mèo', 'gà', 'heo', 'bò', 'thú cưng'], route: '/products?category=VAT_NUOI' },
];

function smartSearch(q: string): string {
  const lower = q.toLowerCase().trim().normalize('NFC');
  for (const { keywords, route } of SEARCH_ROUTES) {
    if (keywords.some(k => lower.includes(k.normalize('NFC')))) {
      return route + (route.includes('?') ? '&' : '?') + `search=${encodeURIComponent(q)}`;
    }
  }
  return `/products?search=${encodeURIComponent(q)}`;
}

const HISTORY_KEY = 'search_history';
const MAX_HISTORY = 8;

function getHistory(): string[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}
function saveHistory(q: string) {
  const prev = getHistory().filter(h => h !== q);
  localStorage.setItem(HISTORY_KEY, JSON.stringify([q, ...prev].slice(0, MAX_HISTORY)));
}
function deleteHistory(q: string) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(getHistory().filter(h => h !== q)));
}

export default function HomepageClient() {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => { setHistory(getHistory()); }, []);

  function doSearch(q: string) {
    if (!q.trim()) return;
    saveHistory(q.trim());
    setHistory(getHistory());
    router.push(smartSearch(q.trim()));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    doSearch(query);
  }

  return (
    <>
      {/* Search bar — straddles vàng/xám */}
      <form onSubmit={handleSubmit}>
        <div className="flex items-center bg-white rounded-full shadow-xl overflow-hidden border border-gray-100" style={{ height: 52 }}>
          <i className="ri-search-line text-gray-400 pl-4 text-lg flex-shrink-0"></i>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Tìm sản phẩm, việc làm, bất động sản..."
            className="flex-1 px-3 text-sm focus:outline-none text-gray-800 placeholder-gray-400 h-full"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="text-gray-300 hover:text-gray-500 px-2 flex-shrink-0">
              <i className="ri-close-line text-lg"></i>
            </button>
          )}
          <div className="w-px h-6 bg-gray-200 flex-shrink-0 mx-1" />
          <button type="submit"
            className="h-[44px] px-6 mr-1 text-sm font-bold text-gray-900 rounded-full transition hover:opacity-90 flex-shrink-0 whitespace-nowrap"
            style={{ backgroundColor: '#ffd400' }}>
            Tìm kiếm
          </button>
        </div>
      </form>

      {/* Chips lịch sử — trên nền xám bên dưới search bar */}
      {history.length > 0 && (
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {history.map((h, i) => (
            <span key={i} onClick={() => doSearch(h)}
              className="flex items-center gap-1 bg-white text-gray-600 text-xs font-medium pl-2.5 pr-1 py-1.5 rounded-full cursor-pointer hover:shadow-sm transition shadow-sm border border-gray-100">
              <i className="ri-time-line text-gray-400 text-xs flex-shrink-0"></i>
              <span className="max-w-[100px] truncate">{h}</span>
              <button onClick={(e) => { e.stopPropagation(); deleteHistory(h); setHistory(getHistory()); }}
                className="ml-0.5 text-gray-400 hover:text-red-500 w-4 h-4 flex items-center justify-center rounded-full flex-shrink-0 text-sm">
                ×
              </button>
            </span>
          ))}
          <button onClick={() => { localStorage.setItem(HISTORY_KEY, '[]'); setHistory([]); }}
            className="text-xs text-gray-400 hover:text-red-500 transition">
            Xóa lịch sử
          </button>
        </div>
      )}
    </>
  );
}
