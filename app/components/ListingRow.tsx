import Link from 'next/link';
import LikeButton from './LikeButton';
import { listingFacts, listingHref, listingImage, listingPrice, timeAgo, type ListingType } from '../../lib/format';

const PLACEHOLDER_ICON: Record<ListingType, string> = {
  product: 'ri-plant-line',
  'real-estate': 'ri-home-4-line',
  job: 'ri-briefcase-4-line',
  ad: 'ri-megaphone-line',
  forum: 'ri-chat-3-line',
};

// One listing as a row: small photo on the left, the facts on the right, a hairline between rows.
// Dense on purpose, so a phone screen shows three or four listings with their full titles.
export default function ListingRow({ item, type, distanceLabel }: { item: any; type: ListingType; distanceLabel?: string }) {
  const img = listingImage(item);
  const price = listingPrice(item, type);
  const facts = listingFacts(item, type);
  const place = item.location || item.address || '';
  const age = timeAgo(item.createdAt);
  const seller = item.user?.fullName || item.user?.username || '';
  const photos = Array.isArray(item.images) ? item.images.length : 0;
  const soldOut = type === 'product' && (item.status === 'SOLD_OUT' || (item.quantity != null && Number(item.quantity) <= 0));
  const href = listingHref(item, type);

  return (
    <article className="relative flex gap-3 border-b border-line py-4 sm:gap-4">
      <Link href={href} className="relative block aspect-[4/3] w-[124px] shrink-0 overflow-hidden rounded-lg bg-paper sm:w-[200px]" aria-label={item.title} tabIndex={-1}>
        {img ? (
          <img src={img} alt="" loading="lazy" decoding="async" className={`h-full w-full object-cover ${soldOut ? 'opacity-60' : ''}`} />
        ) : (
          <span className="grid h-full w-full place-items-center text-ink-faint/60"><i className={`${PLACEHOLDER_ICON[type]} text-3xl`} /></span>
        )}
        <span className="pointer-events-none absolute left-1.5 top-1.5 flex flex-col items-start gap-1">
          {soldOut && <span className="rounded bg-ink px-1.5 py-0.5 text-[11px] font-bold text-white">Hết hàng</span>}
          {item.isUrgent && <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[11px] font-bold text-brand-700">Gấp</span>}
          {item.isVip && <span className="rounded bg-gold-100 px-1.5 py-0.5 text-[11px] font-bold text-gold-800">Nổi bật</span>}
        </span>
        {photos > 1 && (
          <span className="pointer-events-none absolute bottom-1.5 right-1.5 inline-flex items-center gap-0.5 rounded bg-ink/70 px-1.5 py-0.5 text-[11px] font-medium text-white">
            <i className="ri-image-line" aria-hidden="true" />{photos}
          </span>
        )}
      </Link>

      <div className="min-w-0 flex-1 pr-8">
        <h3 className="text-[15px] font-semibold leading-snug text-ink sm:text-[17px]">
          <Link href={href} className="line-clamp-2 hover:underline">{item.title}</Link>
        </h3>
        {facts.length > 0 && <p className="mt-0.5 truncate text-[13px] text-ink-faint">{facts.join(' · ')}</p>}
        {price && <p className={`mt-1 text-[17px] font-bold tabular-nums sm:text-[19px] ${soldOut ? 'text-ink-faint line-through' : 'text-forest-700'}`}>{price}</p>}
        {(place || distanceLabel) && (
          <p className="mt-1 flex items-center gap-1 truncate text-[13px] text-ink-soft">
            <i className="ri-map-pin-line text-ink-faint" aria-hidden="true" />
            <span className="truncate">{[place, distanceLabel].filter(Boolean).join(' · ')}</span>
          </p>
        )}
        {(seller || age) && (
          <p className="mt-1 flex items-center gap-1.5 truncate text-[13px] text-ink-faint">
            {seller && (
              <>
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-paper text-[11px] font-bold text-ink-soft" aria-hidden="true">{seller.trim().charAt(0).toUpperCase()}</span>
                <span className="truncate text-ink-soft">{seller}</span>
              </>
            )}
            {seller && age && <span aria-hidden="true">·</span>}
            {age && <span className="shrink-0">{age}</span>}
          </p>
        )}
      </div>

      <div className="absolute bottom-4 right-0">
        <LikeButton itemId={String(item.id)} inline className="p-1" />
      </div>
    </article>
  );
}
