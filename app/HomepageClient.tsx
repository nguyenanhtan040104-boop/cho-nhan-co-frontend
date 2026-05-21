'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

// Quy tắc: cụ thể nhất → chung nhất (thứ tự quan trọng)
const SEARCH_ROUTES: { keywords: string[]; route: string }[] = [
  // ── BẤT ĐỘNG SẢN sub ──
  { keywords: ['phòng trọ', 'phong tro', 'cho thuê phòng', 'nhà trọ', 'nha tro'], route: '/real-estate?type=PHONG_TRO' },
  { keywords: ['đất nền', 'dat nen', 'mua đất', 'bán đất', 'lô đất'], route: '/real-estate?type=DAT_NEN' },
  { keywords: ['mặt bằng', 'mat bang', 'mặt bằng kinh doanh', 'thuê mặt bằng'], route: '/real-estate?type=MAT_BANG' },
  { keywords: ['nhà ở', 'nha o', 'mua nhà', 'bán nhà', 'nhà đất', 'nha dat', 'căn hộ', 'can ho'], route: '/real-estate?type=NHA_O' },
  { keywords: ['bất động sản', 'bat dong san', 'bds', 'nhà', 'đất'], route: '/real-estate' },

  // ── VIỆC LÀM sub ──
  { keywords: ['tuyển dụng', 'tuyen dung', 'tuyển nhân viên', 'đăng tuyển', 'cần tuyển'], route: '/jobs?type=EMPLOYER' },
  { keywords: ['tìm việc', 'tim viec', 'xin việc', 'xin viec', 'cần việc', 'nhân công', 'nhan cong'], route: '/jobs?type=JOB_SEEKER' },
  { keywords: ['việc làm', 'viec lam', 'tuyển', 'lương', 'luong'], route: '/jobs' },

  // ── DỊCH VỤ sub ──
  { keywords: ['sửa chữa', 'sua chua', 'bảo dưỡng', 'bao duong', 'sửa máy', 'sửa xe'], route: '/dich-vu?sub=s%E1%BB%ADa%20ch%E1%BB%AFa' },
  { keywords: ['vận chuyển', 'van chuyen', 'ship', 'giao hàng', 'giao hang', 'chuyển nhà', 'chuyen nha', 'vận tải'], route: '/dich-vu?sub=v%E1%BA%ADn%20chuy%E1%BB%83n' },
  { keywords: ['tư vấn', 'tu van', 'tư vấn nông nghiệp', 'tư vấn kỹ thuật'], route: '/dich-vu?sub=t%C6%B0%20v%E1%BA%A5n' },
  { keywords: ['xây dựng', 'xay dung', 'thi công', 'thi cong', 'xây nhà', 'sửa nhà'], route: '/dich-vu?sub=x%C3%A2y%20d%E1%BB%B1ng' },
  { keywords: ['dịch vụ', 'dich vu'], route: '/dich-vu' },

  // ── VẬT NUÔI sub ──
  { keywords: ['chó', 'cún', 'chó cảnh', 'mua chó', 'bán chó', 'cho canh'], route: '/vat-nuoi?sub=ch%C3%B3' },
  { keywords: ['mèo', 'meo canh', 'mèo cảnh', 'mua mèo', 'bán mèo'], route: '/vat-nuoi?sub=m%C3%A8o' },
  { keywords: ['gà', 'ga', 'gia cầm', 'gia cam', 'vịt', 'ngan', 'ngỗng', 'chim'], route: '/vat-nuoi?sub=gia%20c%E1%BA%A7m' },
  { keywords: ['heo', 'bò', 'trâu', 'dê', 'cừu', 'ngựa', 'gia súc', 'gia suc'], route: '/vat-nuoi?sub=gia%20s%C3%BAc' },
  { keywords: ['vật nuôi', 'vat nuoi', 'thú cưng', 'thu cung', 'thỏ'], route: '/vat-nuoi' },

  // ── DIỄN ĐÀN sub ──
  { keywords: ['kinh nghiệm trồng', 'kinh nghiem trong', 'chia sẻ kinh nghiệm'], route: '/forum?category=KINH_NGHIEM' },
  { keywords: ['hỏi đáp', 'hoi dap', 'thắc mắc', 'tư vấn kỹ thuật trồng'], route: '/forum?category=HOI_DAP' },
  { keywords: ['giá thị trường', 'gia thi truong', 'tin tức thị trường'], route: '/forum?category=THI_TRUONG' },
  { keywords: ['chăn nuôi', 'chan nuoi', 'kỹ thuật chăn'], route: '/forum?category=CHAN_NUOI' },
  { keywords: ['diễn đàn', 'dien dan', 'forum'], route: '/forum' },

  // ── CẢNH BÁO sub ──
  { keywords: ['lừa đảo mua bán', 'lua dao mua ban'], route: '/canh-bao?sub=L%E1%BB%ABa%20%C4%91%E1%BA%A3o%20mua%20b%C3%A1n' },
  { keywords: ['giả mạo danh tính', 'gia mao', 'giả danh', 'mạo danh'], route: '/canh-bao?sub=Gi%E1%BA%A3%20m%E1%BA%A1o%20danh%20t%C3%ADnh' },
  { keywords: ['lừa đảo đặt cọc', 'lua dao dat coc', 'lừa cọc', 'chiếm đoạt tiền cọc'], route: '/canh-bao?sub=L%E1%BB%ABa%20%C4%91%E1%BA%A3o%20%C4%91%E1%BA%B7t%20c%E1%BB%8Dc' },
  { keywords: ['cảnh báo', 'canh bao', 'lừa đảo', 'lua dao', 'tố cáo', 'hàng giả', 'hang gia'], route: '/canh-bao' },

  // ── QUẢNG CÁO sub ──
  { keywords: ['khai trương', 'khai truong', 'khai trương cửa hàng'], route: '/advertisements?category=KHAI_TRUONG' },
  { keywords: ['khuyến mãi', 'khuyen mai', 'giảm giá', 'giam gia', 'sale', 'ưu đãi'], route: '/advertisements?category=KHUYEN_MAI' },
  { keywords: ['sự kiện', 'su kien', 'hội chợ', 'hoi cho', 'triển lãm'], route: '/advertisements?category=SU_KIEN' },
  { keywords: ['quảng cáo', 'quang cao'], route: '/advertisements' },

  // ── NÔNG SẢN (products) ──
  { keywords: ['nông sản', 'nong san', 'thực phẩm', 'thuc pham', 'rau củ', 'rau cu', 'rau', 'trái cây', 'trai cay', 'lúa', 'gạo', 'cà phê', 'ca phe', 'tiêu', 'điều', 'sầu riêng'], route: '/products?category=NONG_SAN' },
];

function smartSearch(q: string): string {
  const lower = q.toLowerCase().trim().normalize('NFC');
  for (const { keywords, route } of SEARCH_ROUTES) {
    if (keywords.some(k => lower.includes(k.toLowerCase().normalize('NFC')))) {
      // Nếu route đã có ?sub= hoặc ?type= hoặc ?category= thì thêm &search=
      // Nếu không thì thêm ?search=
      const sep = route.includes('?') ? '&' : '?';
      return route + sep + `search=${encodeURIComponent(q)}`;
    }
  }
  // Fallback: tìm toàn bộ sản phẩm
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
