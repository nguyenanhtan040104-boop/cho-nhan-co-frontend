'use client';

import Link from 'next/link';

interface EmptyStateProps {
  keyword?: string;           // từ khóa tìm kiếm (nếu có)
  entityLabel?: string;       // "sản phẩm", "bất động sản", "việc làm"...
  createHref?: string;        // link đăng tin mới
  createLabel?: string;       // label nút đăng tin
  onClearSearch?: () => void; // callback xóa bộ lọc
}

export default function EmptyState({
  keyword,
  entityLabel = 'kết quả',
  createHref,
  createLabel,
  onClearSearch,
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl py-16 px-8 text-center shadow-sm border border-gray-100 max-w-lg mx-auto">
      {/* Illustration */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          {/* Magnifying glass + question mark — SVG inline */}
          <svg width="120" height="110" viewBox="0 0 120 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Paper / card */}
            <rect x="50" y="20" width="60" height="72" rx="6" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="1.5"/>
            <rect x="60" y="36" width="40" height="5" rx="2.5" fill="#d1d5db"/>
            <rect x="60" y="48" width="30" height="5" rx="2.5" fill="#e5e7eb"/>
            <rect x="60" y="60" width="35" height="5" rx="2.5" fill="#e5e7eb"/>
            {/* Question mark */}
            <text x="80" y="95" fontSize="28" fontWeight="bold" fill="#9ca3af" textAnchor="middle">?</text>
            {/* Magnifying glass handle */}
            <line x1="28" y1="70" x2="10" y2="90" stroke="#f59e0b" strokeWidth="7" strokeLinecap="round"/>
            {/* Magnifying glass circle */}
            <circle cx="42" cy="55" r="26" fill="white" stroke="#f59e0b" strokeWidth="6"/>
            {/* Face */}
            <circle cx="36" cy="52" r="3" fill="#374151"/>
            <circle cx="50" cy="52" r="3" fill="#374151"/>
            <path d="M36 62 Q43 68 50 62" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          </svg>
        </div>
      </div>

      {/* Message */}
      {keyword ? (
        <>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Không tìm thấy &ldquo;{keyword}&rdquo;
          </h3>
          <p className="text-gray-500 text-sm mb-8">
            Hãy thử từ khóa khác hoặc xóa bộ lọc để xem thêm kết quả
          </p>
        </>
      ) : (
        <>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Chưa có {entityLabel} nào
          </h3>
          <p className="text-gray-500 text-sm mb-8">
            Hãy là người đầu tiên đăng {entityLabel} lên chợ!
          </p>
        </>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {keyword && onClearSearch && (
          <button
            onClick={onClearSearch}
            className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-full font-medium text-sm hover:border-gray-400 hover:bg-gray-50 transition-colors"
          >
            Xóa bộ lọc
          </button>
        )}
        {createHref && createLabel && (
          <Link
            href={createHref}
            className="px-6 py-2.5 bg-green-600 text-white rounded-full font-medium text-sm hover:bg-green-700 transition-colors"
          >
            {createLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
