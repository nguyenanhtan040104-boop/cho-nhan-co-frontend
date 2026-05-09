import RealEstateDetail from './RealEstateDetail';

export default async function RealEstateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RealEstateDetail propertyId={id} />;
}
