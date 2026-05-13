import { Metadata } from 'next';
import PostDetail from './PostDetail';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_URL}/forum/posts/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return { title: 'Bài viết | Chợ Nhân Cơ' };
    const post = await res.json();
    const description = post.content?.replace(/<[^>]+>/g, '').slice(0, 160) || 'Đọc bài viết trên Chợ Nhân Cơ';
    return {
      title: post.title,
      description,
      openGraph: {
        title: post.title,
        description,
        images: post.images?.[0] ? [{ url: post.images[0] }] : [],
      },
    };
  } catch {
    return { title: 'Bài viết | Chợ Nhân Cơ' };
  }
}

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PostDetail postId={id} />;
}
