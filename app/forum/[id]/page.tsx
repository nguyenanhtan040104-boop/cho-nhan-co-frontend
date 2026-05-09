import PostDetail from './PostDetail';

export default function PostDetailPage({ params }: { params: { id: string } }) {
  return <PostDetail postId={params.id} />;
}
