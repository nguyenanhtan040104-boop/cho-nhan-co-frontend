'use client';

import Link from 'next/link';

interface EmptyStateProps {
  keyword?: string;           // search keyword, if any
  entityLabel?: string;       // "sản phẩm", "việc làm"...
  createHref?: string;
  createLabel?: string;
  onClearSearch?: () => void;
}

// Plain words and one action. No illustrations.
export default function EmptyState({ keyword, entityLabel = 'kết quả', createHref, createLabel, onClearSearch }: EmptyStateProps) {
  return (
    <div className="mx-auto max-w-md rounded-card bg-paper px-6 py-12 text-center">
      <i className="ri-search-line text-3xl text-ink-faint" aria-hidden="true" />
      {keyword ? (
        <>
          <h3 className="mt-2 text-lg font-bold text-ink">Không tìm thấy “{keyword}”</h3>
          <p className="mt-1 text-sm text-ink-soft">Thử từ khóa khác hoặc xóa bộ lọc.</p>
        </>
      ) : (
        <>
          <h3 className="mt-2 text-lg font-bold text-ink">Chưa có {entityLabel} nào</h3>
          <p className="mt-1 text-sm text-ink-soft">Hãy là người đầu tiên đăng lên chợ.</p>
        </>
      )}
      <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
        {keyword && onClearSearch && <button onClick={onClearSearch} className="btn-ghost">Xóa bộ lọc</button>}
        {createHref && createLabel && <Link href={createHref} className="btn-primary">{createLabel}</Link>}
      </div>
    </div>
  );
}
