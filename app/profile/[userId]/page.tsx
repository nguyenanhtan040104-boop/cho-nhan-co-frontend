import ProfileDetail from './ProfileDetail';

export default async function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  return <ProfileDetail userId={userId} />;
}
