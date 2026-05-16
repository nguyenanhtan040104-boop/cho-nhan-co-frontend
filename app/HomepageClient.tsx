'use client';
import { useState, useEffect, useRef } from 'react';
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
function addHistory(q: string) {
  const prev = getHistory().filter(h => h !== q);
  localStorage.setItem(HISTORY_KEY, JSON.stringify([q, ...prev].slice(0, MAX_HISTORY)));
}
function removeHistory(q: string) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(getHistory().filter(h => h !== q)));
}
function clearHistory() {
  localStorage.setItem(HISTORY_KEY, '[]');
}

export default function HomepageClient() {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  function doSearch(q: string) {
    if (!q.trim()) return;
    addHistory(q.trim());
    setHistory(getHistory());
    router.push(smartSearch(q.trim()));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    doSearch(query);
  }

  function handleRemove(e: React.MouseEvent, q: string) {
    e.stopPropagation();
    removeHistory(q);
    setHistory(getHistory());
  }

  function handleClear() {
    clearHistory();
    setHistory([]);
  }

  return (
    <div className="w-full">
      {/* Search bar */}
      <form onSubmit={handleSubmit}>
        <div className="flex items-center bg-white rounded-full shadow-lg overflow-hidden border border-transparent focus-within:border-yellow-300 transition-all" style={{ height: 48 }}>
          <i className="ri-search-line text-gray-400 pl-5 text-lg flex-shrink-0"></i>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Tìm sản phẩm, việc làm, bất động sản..."
            className="flex-1 px-3 text-sm focus:outline-none text-gray-800 placeholder-gray-400 h-full"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600 px-2 flex-shrink-0">
              <i className="ri-close-line text-lg"></i>
            </button>
          )}
          <button type="submit"
            className="h-10 px-5 mr-1 text-sm font-bold text-gray-900 rounded-full transition hover:opacity-90 flex-shrink-0"
            style={{ backgroundColor: '#ffd400' }}>
            Tìm kiếm
          </button>
        </div>
      </form>

      {/* Lịch sử tìm kiếm — chips bên dưới, kiểu Chợ Tốt */}
      {history.length > 0 && (
        <div className="flex items-center gap-2 mt-2.5 flex-wrap px-1">
          {history.map((h, i) => (
            <button key={i} onClick={() => doSearch(h)}
              className="flex items-center gap-1.5 bg-white/80 hover:bg-white text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm transition border border-white/50 hover:border-gray-200 group">
              <i className="ri-time-line text-gray-400 text-xs"></i>
              <span>{h}</span>
              <span onClick={(e) => handleRemove(e, h)}
                className="text-gray-400 hover:text-red-500 ml-0.5 transition leading-none">
                ×
              </span>
            </button>
          ))}
          <button onClick={handleClear}
            className="text-xs text-white/70 hover:text-white transition ml-1 underline underline-offset-2">
            Xóa lịch sử
          </button>
        </div>
      )}
    </div>
  );
}
