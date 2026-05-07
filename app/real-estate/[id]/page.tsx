import RealEstateDetail from './RealEstateDetail';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
  ];
}

export default function RealEstateDetailPage({ params }: { params: { id: string } }) {
  return <RealEstateDetail propertyId={params.id} />;
}