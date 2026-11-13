import Link from 'next/link';
import { digits } from '../ContactBar';

// Pieces every listing page shares. Plain, bordered, no decoration.

export function Breadcrumb({ trail }: { trail: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Đường dẫn" className="no-scrollbar flex items-center gap-1 overflow-x-auto py-3 text-[13px] text-ink-faint">
      {trail.map((t, i) => (
        <span key={i} className="flex shrink-0 items-center gap-1 last:min-w-0 last:shrink">
          {t.href ? <Link href={t.href} className="hover:text-forest-700">{t.label}</Link> : <span className="truncate text-ink-soft">{t.label}</span>}
          {i < trail.length - 1 && <i className="ri-arrow-right-s-line" aria-hidden="true" />}
        </span>
      ))}
    </nav>
  );
}

export function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-content px-4 py-6 sm:px-6">
      <div className="grid animate-pulse gap-6 lg:grid-cols-[1.25fr_1fr]">
        <div className="aspect-[4/3] rounded-card bg-line" />
        <div className="space-y-3">
          <div className="h-5 w-1/3 rounded bg-line" />
          <div className="h-9 w-4/5 rounded bg-line" />
          <div className="h-10 w-1/2 rounded bg-line" />
          <div className="h-32 rounded-card bg-line" />
        </div>
      </div>
    </div>
  );
}

export function NotFound({ what, href, label }: { what: string; href: string; label: string }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-ink">Không tìm thấy {what}</h1>
      <p className="mt-1 text-sm text-ink-soft">Tin có thể đã bị xóa hoặc người đăng đã gỡ xuống.</p>
      <Link href={href} className="btn-forest mt-5">{label}</Link>
    </div>
  );
}

// Call / Zalo / chat row for desktop. Phones get the bar fixed at the bottom (ContactBar).
export function ContactButtons({ phone, onChat, chatLabel = 'Nhắn tin' }: { phone?: string | null; onChat: () => void; chatLabel?: string }) {
  const num = phone ? digits(phone) : '';
  return (
    <div className="mt-4 hidden gap-2 md:flex">
      {num && <a href={`tel:${num}`} className="btn-forest flex-1 py-3"><i className="ri-phone-fill" aria-hidden="true" /> Gọi {phone}</a>}
      {num && <a href={`https://zalo.me/${num}`} target="_blank" rel="noopener noreferrer" className="btn-ghost flex-1 py-3"><i className="ri-chat-smile-3-line" aria-hidden="true" /> Zalo</a>}
      <button onClick={onChat} className={`${num ? 'btn-ghost' : 'btn-forest'} flex-1 py-3`}><i className="ri-message-3-line" aria-hidden="true" /> {chatLabel}</button>
    </div>
  );
}

export function Facts({ title = 'Thông tin nhanh', items }: { title?: string; items: { label: string; value: string }[] }) {
  const rows = items.filter(i => i.value);
  if (rows.length === 0) return null;
  return (
    <div className="card p-4 sm:p-6">
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <dl className="mt-3 divide-y divide-line text-[14px]">
        {rows.map(f => (
          <div key={f.label} className="flex justify-between gap-4 py-2.5">
            <dt className="text-ink-faint">{f.label}</dt>
            <dd className="text-right font-semibold text-ink">{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function SellerCard({ user, label = 'Người đăng' }: { user: any; label?: string }) {
  if (!user) return null;
  const name = user.fullName || user.username || 'Người dùng';
  const avatar = user.avatar || user.avatarUrl;
  return (
    <div className="card flex items-center gap-3 p-4">
      {avatar ? (
        <img src={avatar} alt="" className="h-12 w-12 shrink-0 rounded-full border border-line object-cover" />
      ) : (
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-forest-700 text-lg font-bold uppercase text-white" aria-hidden="true">{name.charAt(0)}</span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[12px] text-ink-faint">{label}</p>
        <Link href={`/profile/${user.id}`} className="block truncate text-[15px] font-bold text-ink hover:text-forest-700">{name}</Link>
        <p className="truncate text-[12px] text-ink-faint">{user.location || 'Nhân Cơ, Đắk Nông'}</p>
      </div>
      <Link href={`/profile/${user.id}`} className="btn-ghost shrink-0 px-3.5 py-2 text-[13px]">Xem trang</Link>
    </div>
  );
}

export function SafetyNote({ tips }: { tips?: string[] }) {
  const list = tips || [
    'Gặp trực tiếp và xem hàng trước khi trả tiền.',
    'Không chuyển tiền đặt cọc cho người chưa gặp mặt.',
    'Không đọc mã OTP hay gửi ảnh thẻ ngân hàng cho bất kỳ ai.',
  ];
  return (
    <div className="rounded-card border border-gold-200 bg-gold-50 p-4">
      <p className="text-[14px] font-bold text-gold-800">Lưu ý an toàn</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] leading-snug text-gold-900/80">
        {list.map(t => <li key={t}>{t}</li>)}
      </ul>
      <Link href="/canh-bao" className="mt-2 inline-block text-[13px] font-semibold text-brand-600 underline underline-offset-2">Báo cáo tin có dấu hiệu lừa đảo</Link>
    </div>
  );
}
