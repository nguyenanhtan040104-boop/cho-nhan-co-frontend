'use client';
import { useState } from 'react';

export default function ShareButton({ title, url }: { title: string; url?: string }) {
  const [copied, setCopied] = useState(false);
  const [show, setShow] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => { setCopied(false); setShow(false); }, 2000);
    });
  }

  function shareFacebook() {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
    setShow(false);
  }

  function shareZalo() {
    window.open(`https://zalo.me/share/url?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`, '_blank');
    setShow(false);
  }

  return (
    <div className="relative">
      <button onClick={() => setShow(v => !v)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition px-3 py-2 rounded-lg hover:bg-gray-100">
        <i className="ri-share-line text-base"></i>
        <span>Chia sẻ</span>
      </button>
      {show && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShow(false)} />
          <div className="absolute left-0 top-10 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
            <p className="text-xs font-bold text-gray-400 px-4 py-1 uppercase tracking-wide">Chia sẻ qua</p>
            <button onClick={copyLink}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-left">
              <i className={`${copied ? 'ri-check-line text-green-500' : 'ri-link text-gray-500'} text-base w-5`}></i>
              <span className="text-sm text-gray-700">{copied ? 'Đã sao chép!' : 'Sao chép link'}</span>
            </button>
            <button onClick={shareFacebook}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition text-left">
              <i className="ri-facebook-fill text-blue-600 text-base w-5"></i>
              <span className="text-sm text-gray-700">Facebook</span>
            </button>
            <button onClick={shareZalo}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition text-left">
              <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-white font-black text-[9px]">Z</span>
              </div>
              <span className="text-sm text-gray-700">Zalo</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
