import Link from 'next/link';
import Logo from './Logo';
import { CATEGORIES } from './nav-data';

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-12 border-t border-line bg-surface pb-24 pt-10 md:pb-10">
      <div className="mx-auto grid max-w-content gap-8 px-4 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo size={34} />
            <span className="text-lg font-extrabold text-ink">Chợ Nhân Cơ</span>
          </div>
          <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-ink-soft">
            Chợ trực tuyến của bà con xã Nhân Cơ, Đắk Nông. Đăng tin miễn phí, gặp người bán ngay trong vùng, giao dịch tại chỗ.
          </p>
        </div>

        <nav aria-label="Danh mục">
          <p className="text-[13px] font-bold text-ink">Danh mục</p>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
            {CATEGORIES.map((c) => (
              <li key={c.href}>
                <Link href={c.href} className="text-ink-soft hover:text-forest-700">{c.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-[13px] font-bold text-ink">Cần hỗ trợ?</p>
          <ul className="mt-3 space-y-2 text-[13px] text-ink-soft">
            <li>
              <a href="tel:0888317289" className="inline-flex items-center gap-2 hover:text-forest-700">
                <i className="ri-phone-line" aria-hidden="true" /> 0888.317.289
              </a>
            </li>
            <li>
              <a href="https://zalo.me/0888317289" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-forest-700">
                <i className="ri-chat-smile-3-line" aria-hidden="true" /> Nhắn Zalo
              </a>
            </li>
            <li>
              <Link href="/canh-bao" className="inline-flex items-center gap-2 hover:text-forest-700">
                <i className="ri-shield-flash-line" aria-hidden="true" /> Báo cáo lừa đảo
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-content px-4 text-[12px] text-ink-faint sm:px-6">© {year} Chợ Nhân Cơ. Giá thị trường chỉ mang tính tham khảo.</p>
    </footer>
  );
}
