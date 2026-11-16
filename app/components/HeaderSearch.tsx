'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CATEGORIES, isActivePath } from './nav-data';
import { smartSearch } from './search-routes';
import { search as searchApi } from '../../lib/api';

// The one search box on the site. It knows which section you are in, keeps your keyword in the box
// after you search, and only jumps to another section when you name one ("việc làm", "nhà đất").
const SEARCHABLE = ['/products', '/vat-nuoi', '/dich-vu', '/real-estate', '/jobs', '/forum', '/canh-bao', '/advertisements'];

const KIND: Record<string, string> = { '/products': 'products', '/vat-nuoi': 'products', '/dich-vu': 'products', '/real-estate': 'real-estate', '/jobs': 'jobs', '/forum': 'forum' };

export default function HeaderSearch() {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState('');

  const section = CATEGORIES.find(c => SEARCHABLE.includes(c.href) && isActivePath(pathname, c.href));

  // Show the active keyword (from the URL) so people can see and edit what they searched
  useEffect(() => { setQ(section ? params.get('search') || '' : ''); }, [params, section]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = q.trim();
    if (!v) return;
    try { searchApi.log(v, KIND[section?.href || ''] || 'products'); } catch {}
    router.push(smartSearch(v, section?.href));
  }

  return (
    <form onSubmit={submit} className="min-w-0 flex-1 md:mx-4 md:max-w-2xl" role="search">
      <div className="flex h-11 items-center gap-2 rounded-lg border border-[#B0B0B0] bg-surface pl-4 pr-1 transition-colors focus-within:border-ink hover:border-ink">
        <input
          name="q"
          type="search"
          value={q}
          onChange={e => setQ(e.target.value)}
          aria-label={section ? `Tìm trong ${section.label}` : 'Tìm kiếm trên Chợ Nhân Cơ'}
          placeholder={section ? `Tìm trong ${section.label.toLowerCase()}` : 'Tìm cà phê, tiêu, đất rẫy, việc làm'}
          className="min-w-0 flex-1 bg-transparent text-[15px] text-ink placeholder-ink-faint focus:outline-none"
        />
        <button type="submit" aria-label="Tìm" className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-forest-600 text-white transition hover:bg-forest-700">
          <i className="ri-search-line text-lg" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
