import RealEstateDetail from './RealEstateDetail';

export default function RealEstateDetailPage({ params }: { params: { id: string } }) {
  return <RealEstateDetail propertyId={params.id} />;
}
