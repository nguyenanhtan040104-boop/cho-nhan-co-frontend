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
        className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink transition px-3 py-2 rounded-lg hover:bg-paper">
        <i className="ri-share-line text-base"></i>
        <span>Chia sẻ</span>
      </button>
      {show && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShow(false)} />
          <div className="absolute left-0 top-10 w-52 bg-surface rounded-card border border-line py-2 z-50">
            <p className="text-xs font-bold text-ink-faint px-4 py-1 uppercase tracking-wide">Chia sẻ qua</p>
            <button onClick={copyLink}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-paper transition text-left">
              <i className={`${copied ? 'ri-check-line text-forest-500' : 'ri-link text-ink-soft'} text-base w-5`}></i>
              <span className="text-sm text-ink">{copied ? 'Đã sao chép!' : 'Sao chép link'}</span>
            </button>
            <button onClick={shareFacebook}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-paper transition text-left">
              <i className="ri-facebook-fill text-ink-soft text-base w-5"></i>
              <span className="text-sm text-ink">Facebook</span>
            </button>
            <button onClick={shareZalo}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-paper transition text-left">
              <div className="w-5 h-5 bg-paper0 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-[11px]">Z</span>
              </div>
              <span className="text-sm text-ink">Zalo</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
