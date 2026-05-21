'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { jobs, messages as messagesApi, auth } from '../../../lib/api';
import CommentSection from '../../../components/CommentSection';

const typeLabel: any = {
  EMPLOYER: 'Tuyển dụng', JOB_SEEKER: 'Tìm việc',
};

export default function JobDetail({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImg, setSelectedImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    jobs.getOne(jobId)
      .then(data => setJob(data))
      .catch(() => setError('Khong tim thay tin tuyen dung'))
      .finally(() => setLoading(false));
  }, [jobId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-blue-700 text-sm font-medium">Đang tải tin tuyển dụng...</p>
      </div>
    </div>
  );

  if (error || !job) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-blue-50">
      <i className="ri-briefcase-line text-6xl text-blue-200"></i>
      <p className="text-gray-500">{error || 'Không tìm thấy'}</p>
      <Link href="/jobs" className="text-blue-600 underline font-medium">← Quay lại</Link>
    </div>
  );

  const isEmployer = job.type === 'EMPLOYER';

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        {/* Breadcrumb */}
        <div className="bg-white shadow-sm border-b border-blue-50">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/jobs" className="flex items-center justify-center w-9 h-9 rounded-lg border border-blue-200 hover:bg-blue-50 text-blue-600 transition-colors">
              <i className="ri-arrow-left-line"></i>
            </Link>
            <div className="text-sm text-gray-500 flex-1 min-w-0 flex items-center gap-1">
              <Link href="/" className="hover:text-blue-600 flex-shrink-0">Trang chủ</Link>
              <i className="ri-arrow-right-s-line text-gray-400"></i>
              <Link href="/jobs" className="hover:text-blue-600 flex-shrink-0">Việc làm</Link>
              <i className="ri-arrow-right-s-line text-gray-400"></i>
              <span className="text-gray-900 truncate">{job.title}</span>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-4 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT: 2/3 */}
            <div className="lg:col-span-2 space-y-5">
              {/* Header card */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-50">
                {/* Job type badge */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${isEmployer ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    <i className={isEmployer ? 'ri-user-add-line' : 'ri-search-eye-line'}></i>
                    {isEmployer ? 'Tuyển dụng' : 'Tìm việc'}
                  </span>
                  {job.isUrgent && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-orange-100 text-orange-700">
                      <i className="ri-alarm-line"></i> Khẩn cấp
                    </span>
                  )}
                  {job.isVip && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200">
                      <i className="ri-vip-crown-fill text-yellow-500"></i> VIP
                    </span>
                  )}
                  {job.category && (
                    <span className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">{job.category}</span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">{job.title}</h1>

                {/* Key info pills */}
                <div className="flex flex-wrap gap-2">
                  {job.salary && (
                    <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-2 rounded-xl text-sm font-semibold">
                      <i className="ri-money-dollar-circle-line"></i>
                      {job.salary}
                    </div>
                  )}
                  {job.location && (
                    <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-xl text-sm font-medium">
                      <i className="ri-map-pin-2-line"></i>
                      {job.location}
                    </div>
                  )}
                  {job.experience && (
                    <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-sm font-medium">
                      <i className="ri-medal-line"></i>
                      {job.experience}
                    </div>
                  )}
                  {job.deadline && (
                    <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-2 rounded-xl text-sm font-medium">
                      <i className="ri-calendar-close-line"></i>
                      Hạn: {new Date(job.deadline).toLocaleDateString('vi-VN')}
                    </div>
                  )}
                </div>
              </div>

              {/* Image carousel */}
              {job.images?.length > 0 && (() => {
                const images = job.images;
                const cur = images[selectedImg];
                const imgUrl = typeof cur === 'string' ? cur : cur?.url;
                return (
                  <div className="space-y-3">
                    {lightbox && imgUrl && (
                      <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center" onClick={() => { setLightbox(false); setZoom(1); }}>
                        <div className="absolute top-4 right-4 flex gap-2 z-10">
                          <button onClick={e => { e.stopPropagation(); setZoom(z => Math.min(z + 0.5, 4)); }} className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white"><i className="ri-zoom-in-line text-lg"></i></button>
                          <button onClick={e => { e.stopPropagation(); setZoom(z => Math.max(z - 0.5, 0.5)); }} className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white"><i className="ri-zoom-out-line text-lg"></i></button>
                          <button onClick={() => { setLightbox(false); setZoom(1); }} className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white"><i className="ri-close-line text-lg"></i></button>
                        </div>
                        {images.length > 1 && (<>
                          <button onClick={e => { e.stopPropagation(); setSelectedImg(i => (i - 1 + images.length) % images.length); }} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white z-10"><i className="ri-arrow-left-s-line text-2xl"></i></button>
                          <button onClick={e => { e.stopPropagation(); setSelectedImg(i => (i + 1) % images.length); }} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white z-10"><i className="ri-arrow-right-s-line text-2xl"></i></button>
                          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">{selectedImg + 1} / {images.length}</span>
                        </>)}
                        <div className="overflow-auto flex items-center justify-center" onClick={e => e.stopPropagation()}>
                          <img src={imgUrl} alt="" style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s', maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', cursor: zoom > 1 ? 'zoom-out' : 'zoom-in' }} onClick={() => setZoom(z => z > 1 ? 1 : 2)} />
                        </div>
                      </div>
                    )}
                    <div className="relative bg-gray-100 rounded-2xl overflow-hidden border border-blue-100" style={{ height: 300 }}>
                      <img src={imgUrl} alt={job.title} className="w-full h-full object-contain cursor-zoom-in" onClick={() => { setLightbox(true); setZoom(1); }} />
                      {images.length > 1 && (<>
                        <button onClick={() => setSelectedImg(i => (i - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow hover:bg-white z-10"><i className="ri-arrow-left-s-line text-xl text-gray-700"></i></button>
                        <button onClick={() => setSelectedImg(i => (i + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow hover:bg-white z-10"><i className="ri-arrow-right-s-line text-xl text-gray-700"></i></button>
                        <span className="absolute bottom-2.5 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">{selectedImg + 1}/{images.length}</span>
                      </>)}
                    </div>
                    {images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {images.map((img: any, i: number) => {
                          const url = typeof img === 'string' ? img : img?.url;
                          return (
                            <button key={i} onClick={() => setSelectedImg(i)} className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${selectedImg === i ? 'border-blue-400 shadow-md' : 'border-transparent hover:border-gray-300'}`}>
                              <img src={url} alt="" className="w-full h-full object-cover" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Description card */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-50">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-base">
                  <i className={`${isEmployer ? 'ri-file-list-3-line' : 'ri-user-heart-line'} text-blue-600`}></i>
                  {isEmployer ? 'Mô tả công việc' : 'Giới thiệu bản thân'}
                </h2>
                <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{job.description}</div>

                {job.benefits && (
                  <div className="mt-5 pt-5 border-t border-blue-50">
                    <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <i className="ri-gift-line text-blue-600"></i>
                      Quyền lợi
                    </h2>
                    <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{job.benefits}</div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: 1/3 sticky */}
            <div>
              <div className="bg-white rounded-2xl shadow-md border border-blue-100 sticky top-4 overflow-hidden">
                {/* Blue top accent */}
                <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                <div className="p-5 space-y-4">
                  {/* CTA Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={async () => {
                        if (!auth.isLoggedIn()) { window.location.href = '/profile'; return; }
                        if (job.user?.phone) {
                          window.location.href = `tel:${job.user.phone}`;
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition-colors shadow-sm text-base">
                      <i className={isEmployer ? 'ri-send-plane-fill' : 'ri-phone-fill'}></i>
                      {isEmployer ? 'Ứng tuyển ngay' : 'Liên hệ tuyển dụng'}
                    </button>
                    <button
                      onClick={async () => {
                        if (!auth.isLoggedIn()) { window.location.href = '/profile'; return; }
                        try {
                          const conv = await messagesApi.getOrCreate(job.user?.id) as any;
                          window.location.href = `/messages/${conv.id}`;
                        } catch { alert('Không thể mở chat'); }
                      }}
                      className="w-full flex items-center justify-center gap-2 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 py-3 rounded-xl font-semibold transition-colors">
                      <i className="ri-message-3-line"></i>
                      Nhắn tin
                    </button>
                  </div>

                  {/* Job meta card */}
                  <div className="bg-blue-50/60 rounded-xl p-4 space-y-3 border border-blue-100">
                    <p className="text-xs text-blue-600 uppercase tracking-wide font-bold">Thông tin tin đăng</p>
                    {job.salary && (
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="ri-money-dollar-circle-line text-blue-600 text-sm"></i>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase">Mức lương</p>
                          <p className="text-sm font-semibold text-blue-700">{job.salary}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="ri-briefcase-line text-indigo-600 text-sm"></i>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase">Loại tin</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isEmployer ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          {typeLabel[job.type] || job.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="ri-calendar-line text-slate-600 text-sm"></i>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase">Ngày đăng</p>
                        <p className="text-sm font-medium text-gray-700">{new Date(job.createdAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="ri-eye-line text-slate-600 text-sm"></i>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase">Lượt xem</p>
                        <p className="text-sm font-medium text-gray-700">{job.viewCount || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Poster info */}
                  <div className="border-t border-blue-50 pt-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-bold mb-3">
                      {isEmployer ? 'Nhà tuyển dụng' : 'Người tìm việc'}
                    </p>
                    <div className="flex items-center gap-3">
                      {job.user?.avatarUrl ? (
                        <img src={job.user.avatarUrl} alt="" className="w-11 h-11 rounded-full object-cover border-2 border-blue-200" />
                      ) : (
                        <div className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-base border-2 border-blue-200">
                          {job.user?.fullName?.[0] || 'U'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{job.user?.fullName}</p>
                        <p className="text-xs text-gray-400">@{job.user?.username}</p>
                      </div>
                      <Link href={`/profile/${job.user?.id}`} className="text-blue-500 hover:text-blue-600 text-xs font-medium flex-shrink-0">
                        Xem
                      </Link>
                    </div>
                    {job.user?.phone && (
                      <a href={`tel:${job.user.phone}`}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium mt-3">
                        <i className="ri-phone-line"></i> {job.user.phone}
                      </a>
                    )}
                    <Link href={`/profile/${job.user?.id}`}
                      className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm mt-2">
                      Xem trang người đăng
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 pb-6">
        <CommentSection targetType="JOB" targetId={jobId} />
      </div>
    </>
  );
}