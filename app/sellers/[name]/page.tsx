import SellerProfile from './SellerProfile';

export default async function SellerPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return <SellerProfile sellerName={decodeURIComponent(name)} />;
}
