import ProfileDetail from './ProfileDetail';

export async function generateStaticParams() {
  return [
    { userId: 'user123' },
    { userId: 'user456' },
    { userId: 'user789' },
  ];
}

export default function ProfilePage({ params }: { params: { userId: string } }) {
  return <ProfileDetail userId={params.userId} />;
}