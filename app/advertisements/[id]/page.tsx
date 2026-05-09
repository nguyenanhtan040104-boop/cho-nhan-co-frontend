import AdvertisementDetail from './AdvertisementDetail';

export default function AdvertisementDetailPage({ params }: { params: { id: string } }) {
  return <AdvertisementDetail adId={params.id} />;
}
