'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { forum, auth } from '../../../lib/api';

export default function DraftsPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.replace('/profile'); return; }
    loadDrafts();
  }, []);

  async function loadDrafts() {
    setLoading(true);
    try {
      const data = await forum.getMyDrafts();
      setDrafts(data || []);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish(id: string) {
    setPublishing(id);
    try {
      await forum.publishDraft(id);
      setDrafts(prev => prev.filter(d => d.id !== id));
      router.push('/forum');
    } catch (e: any) {
      alert(e.message || 'Đăng bài thất bại');
    } finally {
      setPublishing(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa bản nháp này?')) return;
    setDeleting(id);
    try {
      await forum.delete(id);
      setDrafts(prev => prev.filter(d => d.id !== id));
    } catch (e: any) {
      alert(e.message || 'Xóa thất bại');
    } finally {
      setDeleting(null);
    }
  }

  const categoryLabel: Record<string, string> = {
    NONG_NGHIEP: 'Nông nghiệp', CHAN_NUOI: 'Chăn nuôi', THI_TRUONG: 'Thị trường',
    KY_THUAT: 'Kỹ thuật', KINH_NGHIEM: 'Kinh nghiệm', KHAC: 'Khác',
  };

  return (
    <div className="min-h-screen bg-paper">
      <div className="bg-surface border-b">
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center gap-4">
          <Link href="/forum" className="w-10 h-10 border border-line rounded-lg flex items-center justify-center hover:bg-paper">
            <i className="ri-arrow-left-line text-lg"></i>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-ink">Bản nháp của tôi</h1>
            <p className="text-ink-soft text-sm">{drafts.length} bản nháp</p>
          </div>
          <div className="ml-auto">
            <Link href="/forum/create" className="bg-forest-600 text-white px-4 py-2 rounded-lg hover:bg-forest-700 text-sm">
              + Viết bài mới
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-forest-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : drafts.length === 0 ? (
          <div className="bg-surface rounded-lg p-16 text-center">
            <i className="ri-draft-line text-6xl text-ink-faint block mb-3"></i>
            <p className="text-ink-soft mb-4">Bạn chưa có bản nháp nào</p>
            <Link href="/forum/create" className="bg-forest-600 text-white px-6 py-2 rounded-lg hover:bg-forest-700 text-sm">
              Viết bài mới
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {drafts.map(draft => (
              <div key={draft.id} className="bg-surface rounded-lg p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-paper text-ink-soft px-2 py-0.5 rounded">Nháp</span>
                      {draft.scheduledAt && (
                        <span className="text-xs bg-paper text-ink-soft px-2 py-0.5 rounded flex items-center gap-1">
                          <i className="ri-calendar-line"></i>
                          Lên lịch: {new Date(draft.scheduledAt).toLocaleString('vi-VN')}
                        </span>
                      )}
                      <span className="text-xs bg-forest-50 text-forest-600 px-2 py-0.5 rounded">
                        {categoryLabel[draft.category] || draft.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-ink">{draft.title || '(Chưa có tiêu đề)'}</h3>
                    <p className="text-xs text-ink-faint mt-1">
                      Cập nhật: {new Date(draft.updatedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/forum/${draft.id}/edit`}
                      className="px-3 py-1.5 border border-line text-ink-soft rounded-lg hover:bg-paper text-xs">
                      Sửa
                    </Link>
                    <button
                      onClick={() => handlePublish(draft.id)}
                      disabled={publishing === draft.id}
                      className="px-3 py-1.5 bg-forest-600 text-white rounded-lg hover:bg-forest-700 disabled:opacity-50 text-xs"
                    >
                      {publishing === draft.id ? '...' : 'Đăng ngay'}
                    </button>
                    <button
                      onClick={() => handleDelete(draft.id)}
                      disabled={deleting === draft.id}
                      className="px-3 py-1.5 border border-brand-200 text-brand-600 rounded-lg hover:bg-brand-50 disabled:opacity-50 text-xs"
                    >
                      {deleting === draft.id ? '...' : 'Xóa'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
