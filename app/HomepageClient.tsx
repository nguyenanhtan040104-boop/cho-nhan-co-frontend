'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const SEARCH_ROUTES: { keywords: string[]; route: string }[] = [
  { keywords: ['bất động sản', 'bat dong san', 'bds', 'nhà đất', 'nha dat', 'phòng trọ', 'phong tro', 'căn hộ', 'can ho', 'mặt bằng', 'nhà ở', 'đất nền'], route: '/real-estate' },
  { keywords: ['việc làm', 'viec lam', 'tuyển dụng', 'tuyen dung', 'xin việc', 'xin viec', 'nhân công', 'nhan cong', 'tìm việc', 'tim viec', 'tuyển'], route: '/jobs' },
  { keywords: ['dịch vụ', 'dich vu', 'sửa chữa', 'sua chua', 'vận chuyển', 'van chuyen', 'tư vấn', 'tu van', 'xây dựng', 'xay dung'], route: '/dich-vu' },
  { keywords: ['vật nuôi', 'vat nuoi', 'thú cưng', 'thu cung', 'chó', 'mèo', 'gà', 'heo', 'bò', 'trâu', 'dê', 'thỏ', 'chim'], route: '/vat-nuoi' },
  { keywords: ['diễn đàn', 'dien dan', 'forum', 'hỏi đáp', 'hoi dap'], route: '/forum' },
  { keywords: ['cảnh báo', 'canh bao', 'lừa đảo', 'lua dao', 'tố cáo', 'giả mạo'], route: '/canh-bao' },
  { keywords: ['quảng cáo', 'quang cao', 'khai trương', 'khai truong', 'khuyến mãi', 'khuyen mai'], route: '/advertisements' },
  { keywords: ['nông sản', 'nong san', 'thực phẩm', 'thuc pham', 'rau củ', 'rau cu', 'trái cây', 'trai cay', 'lúa', 'gạo', 'cà phê', 'tiêu', 'điều'], route: '/products?category=NONG_SAN' },
];

function smartSearch(q: string): string {
  const lower = q.toLowerCase().trim().normalize('NFC');
  for (const { keywords, route } of SEARCH_ROUTES) {
    if (keywords.some(k => lower.includes(k.normalize('NFC')))) {
      return route + (route.includes('?') ? '&' : '?') + `search=${encodeURIComponent(q)}`;
    }
  }
  // Fallback: tìm trong tất cả sản phẩm (không lọc danh mục)
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
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setHistory(getHistory()); }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function doSearch(q: string) {
    if (!q.trim()) return;
    saveHistory(q.trim());
    setHistory(getHistory());
    setShowDropdown(false);
    router.push(smartSearch(q.trim()));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    doSearch(query);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center bg-white rounded-full shadow-xl overflow-hidden border border-gray-100" style={{ height: 52 }}>
          <i className="ri-search-line text-gray-400 pl-4 text-lg flex-shrink-0"></i>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            placeholder="Tìm sản phẩm, việc làm, bất động sản..."
            className="flex-1 px-3 text-sm focus:outline-none text-gray-800 placeholder-gray-400 h-full"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="text-gray-300 hover:text-gray-500 px-2 flex-shrink-0">
              <i className="ri-close-line text-lg"></i>
            </button>
          )}
          <button type="submit"
            className="h-[44px] px-6 mr-1 text-sm font-bold text-gray-900 rounded-full transition hover:opacity-90 flex-shrink-0 whitespace-nowrap"
            style={{ backgroundColor: '#ffd400' }}>
            Tìm kiếm
          </button>
        </div>
      </form>

      {/* Dropdown lịch sử — xuất hiện khi focus */}
      {showDropdown && history.length > 0 && (
        <div className="absolute left-0 right-0 top-[56px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-800">Tìm kiếm gần đây</span>
            <button onClick={() => { localStorage.setItem(HISTORY_KEY, '[]'); setHistory([]); setShowDropdown(false); }}
              className="text-xs text-gray-400 hover:text-red-500 transition">
              Xóa lịch sử
            </button>
          </div>
          <div className="py-1">
            {history.map((h, i) => (
              <div key={i}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer group"
                onMouseDown={() => doSearch(h)}>
                <i className="ri-time-line text-gray-400 text-base flex-shrink-0"></i>
                <span className="flex-1 text-sm text-gray-700 truncate">{h}</span>
                <button
                  onMouseDown={e => { e.stopPropagation(); deleteHistory(h); setHistory(getHistory()); }}
                  className="text-gray-300 hover:text-gray-500 w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <i className="ri-close-line text-sm"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
