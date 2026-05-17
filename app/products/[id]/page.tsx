import { Metadata } from 'next';
import ProductDetail from './ProductDetail';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.chonhanco.com/api';

async function getProduct(id: string) {
  try {
    const res = await fetch(`${API}/products/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: 'Sản phẩm không tồn tại' };

  const price = Number(product.price).toLocaleString('vi-VN');
  const title = product.title;
  const description = `${product.title} — Giá ${price}đ/${product.unit || 'cái'}. ${product.description?.slice(0, 120) || ''} Tại ${product.location || 'Đắk Nông'}.`;
  const image = product.images?.[0]?.url;

  return {
    title,
    description,
    keywords: [product.title, product.category, 'mua bán', 'đắk nông', 'nhân cơ', product.location].filter(Boolean),
    openGraph: {
      title: `${title} — ${price}đ | Chợ Nhân Cơ`,
      description,
      images: image ? [{ url: image, width: 800, height: 600, alt: title }] : [],
      type: 'article',
    },
    alternates: {
      canonical: `https://cho-nhan-co-frontend-bxj2-18271g0zq.vercel.app/products/${id}`,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  return (
    <>
      {/* Structured data - Product */}
      {product && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: product.title,
              description: product.description,
              image: product.images?.map((img: any) => img.url) || [],
              offers: {
                '@type': 'Offer',
                price: product.price,
                priceCurrency: 'VND',
                availability: 'https://schema.org/InStock',
                seller: {
                  '@type': 'Person',
                  name: product.user?.fullName || 'Người bán',
                },
              },
              brand: { '@type': 'Brand', name: 'Chợ Nhân Cơ' },
            }),
          }}
        />
      )}
      <ProductDetail productId={id} />
    </>
  );
}
