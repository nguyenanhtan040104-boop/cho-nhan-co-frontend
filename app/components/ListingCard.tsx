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

// One card for every kind of listing: photo first, price second, place and age last.
export default function ListingCard({ item, type, distanceLabel }: { item: any; type: ListingType; distanceLabel?: string }) {
  const img = listingImage(item);
  const price = listingPrice(item, type);
  const place = item.location || item.address || '';
  const age = timeAgo(item.createdAt);

  return (
    <Link
      href={listingHref(item, type)}
      className="group block overflow-hidden rounded-card border border-line bg-surface transition-colors hover:border-forest-500"
    >
      <div className="relative aspect-[4/3] bg-paper">
        {img ? (
          <img
            src={img}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-ink-faint/50">
            <i className={`${PLACEHOLDER_ICON[type]} text-4xl`} />
          </div>
        )}
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {item.isUrgent && <span className="rounded bg-brand-500 px-1.5 py-0.5 text-[11px] font-bold text-white">Gấp</span>}
          {item.isVip && <span className="rounded bg-gold-500 px-1.5 py-0.5 text-[11px] font-bold text-ink">Nổi bật</span>}
        </div>
        <LikeButton itemId={String(item.id)} targetType={type === 'real-estate' ? 'REAL_ESTATE' : type === 'job' ? 'JOB' : 'PRODUCT'} className="!right-2 !top-2" />
      </div>
      <div className="p-3">
        <p className="line-clamp-2 min-h-[2.5rem] text-[14px] font-medium leading-snug text-ink">{item.title}</p>
        {price && <p className="mt-1.5 text-[17px] font-extrabold tabular-nums text-forest-700">{price}</p>}
        {(place || age) && (
          <p className="mt-1.5 flex items-center gap-1 text-[12px] text-ink-faint">
            {place && <i className="ri-map-pin-line" aria-hidden="true" />}
            <span className="truncate">{place}</span>
            {distanceLabel && <span className="shrink-0 font-semibold text-forest-700">· {distanceLabel}</span>}
            {place && age && <span aria-hidden="true">·</span>}
            <span className="shrink-0">{age}</span>
          </p>
        )}
      </div>
    </Link>
  );
}
