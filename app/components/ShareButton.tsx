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

  const item = 'block w-full px-4 py-2.5 text-left text-sm text-ink hover:bg-paper';

  return (
    <div className="relative">
      <button onClick={() => setShow(v => !v)} aria-expanded={show}
        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-ink-soft hover:bg-paper hover:text-ink">
        <i className="ri-share-line text-base" aria-hidden="true" />
        <span>Chia sẻ</span>
      </button>
      {show && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShow(false)} />
          <div className="absolute left-0 top-10 z-50 w-48 rounded-card border border-line bg-surface py-1">
            <button onClick={copyLink} className={item}>{copied ? 'Đã sao chép' : 'Sao chép liên kết'}</button>
            <button onClick={shareFacebook} className={item}>Facebook</button>
            <button onClick={shareZalo} className={item}>Zalo</button>
          </div>
        </>
      )}
    </div>
  );
}
