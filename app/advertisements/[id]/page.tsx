
import AdvertisementDetail from './AdvertisementDetail';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
  ];
}

export default function AdvertisementPage({ params }: { params: { id: string } }) {
  return <AdvertisementDetail adId={params.id} />;
}
