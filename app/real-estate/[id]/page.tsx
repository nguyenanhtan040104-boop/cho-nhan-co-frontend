import { Metadata } from 'next';
import RealEstateDetail from './RealEstateDetail';
import { shortMoney } from '../../../lib/format';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://cho-nhan-co-backend.onrender.com/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cho-nhan-co-frontend-txj2.vercel.app';

async function getItem(id: string) {
  try {
    const res = await fetch(`${API}/real-estates/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) return { title: 'Tin nhà đất không tồn tại' };
  const price = shortMoney(Number(item.price));
  const description = `${item.title}. Giá ${price}${item.area ? `, ${item.area} m²` : ''}. ${item.address || 'Đắk Nông'}. ${item.description?.slice(0, 100) || ''}`;
  const image = item.images?.[0]?.url;
  return {
    title: item.title,
    description,
    openGraph: { title: `${item.title} — ${price} | Chợ Nhân Cơ`, description, images: image ? [{ url: image }] : [], type: 'article' },
    alternates: { canonical: `${SITE_URL}/real-estate/${id}` },
  };
}

export default async function RealEstateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getItem(id);
  return (
    <>
      {item && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: item.title,
              description: item.description,
              image: item.images?.map((i: any) => i.url) || [],
              offers: { '@type': 'Offer', price: item.price, priceCurrency: 'VND', availability: 'https://schema.org/InStock' },
            }),
          }}
        />
      )}
      <RealEstateDetail propertyId={id} initialItem={item} />
    </>
  );
}
