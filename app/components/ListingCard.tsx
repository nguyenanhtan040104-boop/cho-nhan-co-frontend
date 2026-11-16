import Link from 'next/link';
import LikeButton from './LikeButton';
import { listingHref, listingImage, listingPrice, timeAgo, type ListingType } from '../../lib/format';

const PLACEHOLDER_ICON: Record<ListingType, string> = {
  product: 'ri-plant-line',
  'real-estate': 'ri-home-4-line',
  job: 'ri-briefcase-4-line',
  ad: 'ri-megaphone-line',
  forum: 'ri-chat-3-line',
};

// What a buyer needs, in the order they need it: what it is, what it costs, whether it is still there,
// who sells it and where. Only fields the API really returned are shown.
export default function ListingCard({ item, type, distanceLabel }: { item: any; type: ListingType; distanceLabel?: string }) {
  const img = listingImage(item);
  const price = listingPrice(item, type);
  const place = item.location || item.address || '';
  const age = timeAgo(item.createdAt);
  const seller = item.user?.fullName || item.user?.username || '';

  const qty = Number(item.quantity);
  const soldOut = type === 'product' && (item.status === 'SOLD_OUT' || (item.quantity != null && qty <= 0));
  // quantity defaults to 1 when the seller leaves it blank, so only a real stock figure is worth showing
  const stock = type === 'product' && !soldOut && qty > 1 ? `Còn ${qty.toLocaleString('vi-VN')}${item.unit ? ' ' + item.unit : ''}` : '';
  const where = [place, distanceLabel, age].filter(Boolean).join(' · ');

  return (
    <article className="group">
      <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-paper">
        <Link href={listingHref(item, type)} className="block h-full w-full" aria-label={item.title}>
          {img ? (
            <img src={img} alt="" loading="lazy" decoding="async" className={`h-full w-full object-cover ${soldOut ? 'opacity-60' : ''}`} />
          ) : (
            <span className="grid h-full w-full place-items-center text-ink-faint/60"><i className={`${PLACEHOLDER_ICON[type]} text-4xl`} /></span>
          )}
        </Link>
        <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1">
          {soldOut && <span className="rounded bg-ink px-2 py-0.5 text-[12px] font-bold text-white">Hết hàng</span>}
          {item.isUrgent && <span className="rounded bg-brand-50 px-2 py-0.5 text-[12px] font-bold text-brand-700">Gấp</span>}
          {item.isVip && <span className="rounded bg-gold-100 px-2 py-0.5 text-[12px] font-bold text-gold-800">Nổi bật</span>}
        </div>
        <LikeButton itemId={String(item.id)} targetType={type === 'real-estate' ? 'REAL_ESTATE' : type === 'job' ? 'JOB' : 'PRODUCT'} className="!right-2 !top-2" />
      </div>

      <Link href={listingHref(item, type)} className="mt-2.5 block">
        <h3 className="line-clamp-2 min-h-[2.6rem] text-[15px] font-medium leading-snug text-ink group-hover:underline">{item.title}</h3>
        {price && <p className={`mt-1 text-[17px] font-bold tabular-nums ${soldOut ? 'text-ink-faint line-through' : 'text-forest-700'}`}>{price}</p>}
        {stock && <p className="text-[13px] font-medium text-ink">{stock}</p>}
        {seller && <p className="mt-0.5 truncate text-[13px] text-ink-soft">{seller}</p>}
        {where && <p className="truncate text-[13px] text-ink-faint">{where}</p>}
      </Link>
    </article>
  );
}
