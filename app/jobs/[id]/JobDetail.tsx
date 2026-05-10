'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { jobs, messages as messagesApi, auth } from '../../../lib/api';

const typeLabel: any = {
  EMPLOYER: 'Tuyển dụng', JOB_SEEKER: 'Tìm việc',
};

export default function JobDetail({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    jobs.getOne(jobId)
      .then(data => setJob(data))
      .catch(() => setError('Không tìm thấy tin tuyển dụng'))
      .finally(() => setLoading(false));
  }, [jobId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error || !job) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <p className="text-gray-500">{error || 'Không tìm thấy'}</p>
      <Link href="/jobs" className="text-indigo-600 underline">Quay lại</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/jobs" className="w-9 h-9 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50">
            <i className="ri-arrow-left-line"></i>
          </Link>
          <div className="text-sm text-gray-500 flex-1 min-w-0">
            <Link href="/jobs" className="hover:text-indigo-600 flex-shrink-0">Tuyển dụng</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 truncate">{job.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className="ri-briefcase-line text-indigo-600 text-2xl"></i>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {job.isUrgent && <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium">Khẩn cấp</span>}
                    {job.isVip && <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">VIP</span>}
                    <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded">{typeLabel[job.type] || job.type}</span>
                    {job.category && <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">{job.category}</span>}
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">{job.title}</h1>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y mb-4">
                {job.salary && (
                  <div>
                    <span className="text-xs text-gray-500 block">Mức lương</span>
                    <span className="font-semibold text-green-600">{job.salary}</span>
                  </div>
                )}
                <div>
                  <span className="text-xs text-gray-500 block">Địa điểm</span>
                  <span className="font-semibold text-gray-900">{job.location}</span>
                </div>
                {job.experience && (
                  <div>
                    <span className="text-xs text-gray-500 block">Kinh nghiệm</span>
                    <span className="font-semibold text-gray-900">{job.experience}</span>
                  </div>
                )}
                {job.deadline && (
                  <div>
                    <span className="text-xs text-gray-500 block">Hạn nộp hồ sơ</span>
                    <span className="font-semibold text-gray-900">{new Date(job.deadline).toLocaleDateString('vi-VN')}</span>
                  </div>
                )}
              </div>

              <div>
                <h2 className="font-semibold text-gray-900 mb-3">Mô tả công việc</h2>
                <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{job.description}</div>
              </div>

              {job.benefits && (
                <div className="mt-4">
                  <h2 className="font-semibold text-gray-900 mb-3">Quyền lợi</h2>
                  <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{job.benefits}</div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl p-5 shadow-sm sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">Nhà tuyển dụng</h3>
              <div className="flex items-center gap-3 mb-4">
                {job.user?.avatarUrl ? (
                  <img src={job.user.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg">
                    {job.user?.fullName?.[0] || 'U'}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{job.user?.fullName}</p>
                  <p className="text-sm text-gray-500">@{job.user?.username}</p>
                </div>
              </div>

              {job.user?.phone && (
                <a href={`tel:${job.user.phone}`}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 mb-2">
                  <i className="ri-phone-line"></i> {job.user.phone}
                </a>
              )}
              <button
                onClick={async () => {
                  if (!auth.isLoggedIn()) { window.location.href = '/profile'; return; }
                  try {
                    const conv = await messagesApi.getOrCreate(job.user?.id) as any;
                    window.location.href = `/messages/${conv.id}`;
                  } catch { alert('Không thể mở chat'); }
                }}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 mb-2">
                <i className="ri-message-3-line"></i> Nhắn tin
              </button>
              <Link href={`/profile/${job.user?.id}`}
                className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 text-sm">
                Xem trang người đăng
              </Link>

              <p className="text-xs text-gray-400 text-center mt-3">
                Đăng ngày {new Date(job.createdAt).toLocaleDateString('vi-VN')} • {job.viewCount} lượt xem
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
