import AdvertisementDetail from './AdvertisementDetail';

export default async function AdvertisementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdvertisementDetail adId={id} />;
}
