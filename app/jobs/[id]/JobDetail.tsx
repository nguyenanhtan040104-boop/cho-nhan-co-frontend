'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { jobs } from '../../../lib/api';
import CommentSection from '../../../components/CommentSection';
import ContactBar from '../../components/ContactBar';
import Gallery from '../../components/detail/Gallery';
import { Breadcrumb, ContactButtons, DetailSkeleton, Facts, NotFound, SafetyNote, SellerCard } from '../../components/detail/Blocks';
import { useCurrentUserId, useStartChat, useToast } from '../../components/detail/hooks';
import { timeAgo } from '../../../lib/format';

export default function JobDetail({ jobId, initialJob }: { jobId: string; initialJob?: any }) {
  const [job, setJob] = useState<any>(initialJob || null);
  const [loading, setLoading] = useState(!initialJob);
  const [liked, setLiked] = useState(false);
  const currentUserId = useCurrentUserId();
  const { notify, toast } = useToast();
  const chat = useStartChat(job?.user?.id, notify);

  useEffect(() => {
    if (!initialJob) {
      jobs.getOne(jobId)
        .then(data => setJob(data))
        .catch(() => setJob(null))
        .finally(() => setLoading(false));
    }
    try { setLiked((JSON.parse(localStorage.getItem('liked_items') || '[]') as string[]).includes(jobId)); } catch {}
  }, [jobId, initialJob]);

  if (loading) return <DetailSkeleton />;
  if (!job) return <NotFound what="tin tuyển dụng" href="/jobs" label="Xem các tin khác" />;

  const isEmployer = job.type === 'EMPLOYER';
  const isOwner = !!currentUserId && job.user?.id === currentUserId;
  const phone = job.contactPhone || job.user?.phone || '';
  const images: any[] = job.images || [];
  const deadline = job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : '';

  const handleLike = () => {
    try {
      const ids: string[] = JSON.parse(localStorage.getItem('liked_items') || '[]');
      const now = !ids.includes(jobId);
      localStorage.setItem('liked_items', JSON.stringify(now ? [...ids, jobId] : ids.filter(x => x !== jobId)));
      setLiked(now);
    } catch {}
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) { try { await navigator.share({ title: job.title, url }); } catch {} }
    else { try { await navigator.clipboard.writeText(url); notify('Đã sao chép liên kết'); } catch { notify('Không sao chép được liên kết'); } }
  };

  return (
    <div className="pb-6">
      {toast}
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <Breadcrumb trail={[{ label: 'Trang chủ', href: '/' }, { label: 'Việc làm', href: '/jobs' }, { label: job.title }]} />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-8">
          <div className="space-y-5">
            <div className="card p-4 sm:p-6">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-semibold">
                <span className={isEmployer ? 'text-forest-700' : 'text-ink-soft'}>{isEmployer ? 'Tuyển dụng' : 'Tìm việc'}</span>
                {job.category && <span className="text-ink-faint">{job.category}</span>}
                {job.isUrgent && <span className="rounded bg-brand-500 px-1.5 py-0.5 text-[11px] text-white">Gấp</span>}
                {job.isVip && <span className="rounded bg-gold-500 px-1.5 py-0.5 text-[11px] text-ink">Nổi bật</span>}
              </p>
              <h1 className="mt-1.5 break-words text-[1.5rem] font-bold leading-snug text-ink sm:text-3xl">{job.title}</h1>
              <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-faint">
                {job.location && <span><i className="ri-map-pin-line" aria-hidden="true" /> {job.location}</span>}
                {job.createdAt && <span>{timeAgo(job.createdAt)}</span>}
                {job.viewCount !== undefined && <span>{job.viewCount} lượt xem</span>}
              </p>
              <p className="mt-4 text-[1.75rem] font-bold leading-none text-forest-700">{job.salary || 'Lương thỏa thuận'}</p>
            </div>

            {images.length > 0 && (
              <Gallery images={images} title={job.title} icon="ri-briefcase-4-line" liked={liked} onLike={handleLike} onShare={handleShare} />
            )}

            <div className="card p-4 sm:p-6">
              <h2 className="text-lg font-bold text-ink">{isEmployer ? 'Mô tả công việc' : 'Giới thiệu bản thân'}</h2>
              {job.description
                ? <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">{job.description}</p>
                : <p className="mt-3 text-sm text-ink-faint">Chưa có mô tả.</p>}
              {job.benefits && (
                <>
                  <h2 className="mt-6 border-t border-line pt-5 text-lg font-bold text-ink">Quyền lợi</h2>
                  <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">{job.benefits}</p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4 lg:sticky lg:top-36 lg:self-start">
            <div className="card p-4 sm:p-5">
              {!isOwner ? (
                <>
                  <button onClick={chat} className="btn-primary hidden w-full py-3 text-base md:inline-flex">{isEmployer ? 'Ứng tuyển ngay' : 'Liên hệ'}</button>
                  <ContactButtons phone={phone} onChat={chat} chatLabel="Nhắn tin" />
                </>
              ) : (
                <div className="space-y-2">
                  <p className="rounded-lg bg-forest-50 px-4 py-3 text-sm font-semibold text-forest-800">Đây là tin của bạn</p>
                  <Link href={`/jobs/${jobId}/edit`} className="btn-ghost w-full"><i className="ri-edit-line" aria-hidden="true" /> Chỉnh sửa tin</Link>
                </div>
              )}
              <p className="mt-3 text-[12px] leading-snug text-ink-faint">Liên hệ qua điện thoại, Zalo hoặc nhắn tin trên Chợ Nhân Cơ.</p>
            </div>

            <Facts title="Thông tin tuyển dụng" items={[
              { label: 'Mức lương', value: job.salary || '' },
              { label: 'Địa điểm', value: job.location || '' },
              { label: 'Kinh nghiệm', value: job.experience || '' },
              { label: 'Hạn nộp', value: deadline },
              { label: 'Ngày đăng', value: job.createdAt ? new Date(job.createdAt).toLocaleDateString('vi-VN') : '' },
            ]} />

            <SellerCard user={job.user} label={isEmployer ? 'Nhà tuyển dụng' : 'Người tìm việc'} />
            <SafetyNote tips={[
              'Không đóng phí hay tiền cọc để được nhận việc.',
              'Hỏi rõ công việc, nơi làm và tiền công trước khi đi.',
              'Nên gặp nơi đông người và báo cho người thân biết.',
            ]} />
          </div>
        </div>

        <div className="mt-8"><CommentSection targetType="JOB" targetId={jobId} /></div>
      </div>

      {!isOwner && job.user && <ContactBar phone={phone} onChat={chat} />}
    </div>
  );
}
