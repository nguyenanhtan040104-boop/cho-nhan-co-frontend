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

// Photo first, no frame. The picture carries the card; text sits underneath.
export default function ListingCard({ item, type, distanceLabel }: { item: any; type: ListingType; distanceLabel?: string }) {
  const img = listingImage(item);
  const price = listingPrice(item, type);
  const place = item.location || item.address || '';
  const age = timeAgo(item.createdAt);
  const meta = [place, distanceLabel, age].filter(Boolean).join(' · ');

  return (
    <article className="group">
      <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-paper">
        <Link href={listingHref(item, type)} className="block h-full w-full" aria-label={item.title}>
          {img ? (
            <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <span className="grid h-full w-full place-items-center text-ink-faint/50"><i className={`${PLACEHOLDER_ICON[type]} text-4xl`} /></span>
          )}
        </Link>
        {(item.isUrgent || item.isVip) && (
          <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col items-start gap-1">
            {item.isUrgent && <span className="rounded-full bg-white px-2.5 py-1 text-[12px] font-bold text-brand-600">Gấp</span>}
            {item.isVip && <span className="rounded-full bg-white px-2.5 py-1 text-[12px] font-bold text-ink">Nổi bật</span>}
          </div>
        )}
        <LikeButton itemId={String(item.id)} targetType={type === 'real-estate' ? 'REAL_ESTATE' : type === 'job' ? 'JOB' : 'PRODUCT'} className="!right-2.5 !top-2.5" />
      </div>

      <Link href={listingHref(item, type)} className="mt-2.5 block">
        <h3 className="line-clamp-2 min-h-[2.6rem] text-[15px] font-medium leading-snug text-ink group-hover:underline">{item.title}</h3>
        {meta && <p className="mt-0.5 truncate text-[13px] text-ink-faint">{meta}</p>}
        {price && <p className="mt-1 text-[16px] font-bold tabular-nums text-forest-700">{price}</p>}
      </Link>
    </article>
  );
}
