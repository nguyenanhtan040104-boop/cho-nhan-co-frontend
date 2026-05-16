'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const SEARCH_ROUTES: { keywords: string[]; route: string }[] = [
  { keywords: ['bất động sản', 'bds', 'nhà', 'đất', 'phòng trọ', 'căn hộ'], route: '/real-estate' },
  { keywords: ['việc làm', 'tuyển dụng', 'tuyển', 'xin việc', 'nhân công'], route: '/jobs' },
  { keywords: ['diễn đàn', 'forum', 'hỏi đáp'], route: '/forum' },
  { keywords: ['cảnh báo', 'lừa đảo', 'mất đồ'], route: '/canh-bao' },
  { keywords: ['quảng cáo', 'khai trương', 'khuyến mãi'], route: '/advertisements' },
  { keywords: ['nông sản', 'rau', 'củ', 'thực phẩm'], route: '/products?category=NONG_SAN' },
  { keywords: ['vật nuôi', 'chó', 'mèo', 'gà', 'heo', 'bò'], route: '/products?category=VAT_NUOI' },
];

function smartSearch(q: string): string {
  const lower = q.toLowerCase().trim();
  for (const { keywords, route } of SEARCH_ROUTES) {
    if (keywords.some(k => lower.includes(k))) {
      return route + (route.includes('?') ? '&' : '?') + `search=${encodeURIComponent(q)}`;
    }
  }
  return `/products?search=${encodeURIComponent(q)}`;
}

const HISTORY_KEY = 'search_history';
const SAVED_KEY = 'search_saved';
const MAX_HISTORY = 10;

function getHistory(): string[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}
function getSaved(): string[] {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]'); } catch { return []; }
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
function toggleSaved(q: string) {
  const saved = getSaved();
  if (saved.includes(q)) {
    localStorage.setItem(SAVED_KEY, JSON.stringify(saved.filter(s => s !== q)));
  } else {
    localStorage.setItem(SAVED_KEY, JSON.stringify([q, ...saved]));
  }
}
function removeSaved(q: string) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(getSaved().filter(s => s !== q)));
}

export default function HomepageClient() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<'recent' | 'saved'>('recent');
  const [history, setHistory] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    setHistory(getHistory());
    setSaved(getSaved());
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  function doSearch(q: string) {
    if (!q.trim()) return;
    addHistory(q.trim());
    setHistory(getHistory());
    setFocused(false);
    router.push(smartSearch(q.trim()));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    doSearch(query);
  }

  function handleRemoveHistory(e: React.MouseEvent, q: string) {
    e.stopPropagation();
    removeHistory(q);
    setHistory(getHistory());
  }

  function handleClearHistory() {
    clearHistory();
    setHistory([]);
  }

  function handleRemoveSaved(e: React.MouseEvent, q: string) {
    e.stopPropagation();
    removeSaved(q);
    setSaved(getSaved());
  }

  function handleSaveToggle(e: React.MouseEvent, q: string) {
    e.stopPropagation();
    toggleSaved(q);
    setSaved(getSaved());
  }

  const showDropdown = focused && (history.length > 0 || saved.length > 0);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div
          className={`flex items-center bg-white overflow-hidden border transition-all ${focused ? 'border-yellow-400 shadow-xl rounded-t-2xl rounded-b-none border-b-0' : 'border-gray-100 shadow-lg rounded-full'}`}
          style={{ height: 52 }}
        >
          <i className="ri-search-line text-gray-400 pl-5 text-lg flex-shrink-0"></i>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => { setFocused(true); setHistory(getHistory()); setSaved(getSaved()); }}
            placeholder="Tìm sản phẩm, việc làm, bất động sản..."
            className="flex-1 px-3 text-sm focus:outline-none text-gray-800 placeholder-gray-400 h-full"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')}
              className="text-gray-400 hover:text-gray-600 px-2 flex-shrink-0">
              <i className="ri-close-line text-lg"></i>
            </button>
          )}
          <button
            type="submit"
            className="px-6 h-full text-sm font-bold text-gray-900 transition hover:opacity-90 flex-shrink-0 rounded-full m-1"
            style={{ backgroundColor: '#ffd400' }}
          >
            Tìm kiếm
          </button>
        </div>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute left-0 right-0 bg-white border border-yellow-400 border-t-0 rounded-b-2xl shadow-xl z-50 overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center border-b border-gray-100 px-4 pt-2">
            <button onClick={() => setActiveTab('recent')}
              className={`text-sm font-semibold pb-2 mr-4 border-b-2 transition ${activeTab === 'recent' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              Gần đây
            </button>
            <button onClick={() => setActiveTab('saved')}
              className={`text-sm font-semibold pb-2 border-b-2 transition ${activeTab === 'saved' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              Đã lưu
            </button>
            {activeTab === 'recent' && history.length > 0 && (
              <button onClick={handleClearHistory}
                className="ml-auto text-xs text-gray-400 hover:text-red-500 pb-2 transition">
                Xóa lịch sử
              </button>
            )}
          </div>

          {/* Content */}
          <div className="max-h-64 overflow-y-auto">
            {activeTab === 'recent' && (
              history.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Chưa có lịch sử tìm kiếm</p>
              ) : (
                history.map((h, i) => (
                  <div key={i} onClick={() => { setQuery(h); doSearch(h); }}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer group">
                    <i className="ri-time-line text-gray-400 text-base flex-shrink-0"></i>
                    <span className="flex-1 text-sm text-gray-700 truncate">{h}</span>
                    <button onClick={(e) => handleSaveToggle(e, h)}
                      title={saved.includes(h) ? 'Bỏ lưu' : 'Lưu'}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-yellow-500 transition p-1 flex-shrink-0">
                      <i className={saved.includes(h) ? 'ri-bookmark-fill text-yellow-500' : 'ri-bookmark-line'}></i>
                    </button>
                    <button onClick={(e) => handleRemoveHistory(e, h)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition p-1 flex-shrink-0">
                      <i className="ri-close-line text-base"></i>
                    </button>
                  </div>
                ))
              )
            )}

            {activeTab === 'saved' && (
              saved.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Chưa có tìm kiếm nào được lưu</p>
              ) : (
                saved.map((s, i) => (
                  <div key={i} onClick={() => { setQuery(s); doSearch(s); }}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer group">
                    <i className="ri-bookmark-fill text-yellow-500 text-base flex-shrink-0"></i>
                    <span className="flex-1 text-sm text-gray-700 truncate">{s}</span>
                    <button onClick={(e) => handleRemoveSaved(e, s)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition p-1 flex-shrink-0">
                      <i className="ri-close-line text-base"></i>
                    </button>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
