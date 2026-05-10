import SearchPeopleDetail from './SearchPeopleDetail';

export default async function SearchPeopleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SearchPeopleDetail postId={id} />;
}
