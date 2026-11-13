'use client';

import { useState } from 'react';
import Link from 'next/link';

// Page frame shared by every create/edit form.
export function FormShell({ title, hint, backHref, children, wide }: { title: string; hint?: string; backHref: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="min-h-screen bg-paper pb-10">
      <div className={`mx-auto px-4 sm:px-6 ${wide ? 'max-w-3xl' : 'max-w-2xl'}`}>
        <div className="flex items-center gap-3 py-4">
          <Link href={backHref} aria-label="Quay lại" className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-line bg-surface hover:border-forest-500">
            <i className="ri-arrow-left-line text-lg" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">{title}</h1>
            {hint && <p className="text-[13px] text-ink-faint">{hint}</p>}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export function FormCard({ children, onSubmit }: { children: React.ReactNode; onSubmit: (e: React.FormEvent) => void }) {
  return <form onSubmit={onSubmit} className="card space-y-5 p-4 sm:p-6">{children}</form>;
}

export function Field({ label, required, hint, children, className = '' }: { label: string; required?: boolean; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-semibold text-ink">
        {label}{required && <span className="text-brand-600"> *</span>}
        {hint && <span className="ml-1.5 font-normal text-ink-faint">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

export function FormError({ message, children }: { message: string; children?: React.ReactNode }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-lg border border-brand-200 bg-brand-50 p-3 text-sm text-brand-700">
      {message}
      {children}
    </div>
  );
}

export function SubmitBar({ backHref, loading, label, busy = 'Đang lưu...' }: { backHref: string; loading: boolean; label: string; busy?: string }) {
  return (
    <div className="sticky bottom-[4.5rem] z-20 -mx-4 -mb-4 flex gap-3 border-t border-line bg-surface/95 px-4 py-3 sm:static sm:m-0 sm:border-0 sm:bg-transparent sm:p-0 sm:pt-2">
      <Link href={backHref} className="btn-ghost flex-1 sm:flex-none sm:px-8">Hủy</Link>
      <button type="submit" disabled={loading} className="btn-primary flex-[2] disabled:opacity-50">
        {loading ? <><i className="ri-loader-4-line animate-spin" aria-hidden="true" /> {busy}</> : label}
      </button>
    </div>
  );
}

export function SavedOverlay({ title = 'Đăng thành công', note = 'Đang chuyển trang...' }: { title?: string; note?: string }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 px-4" role="status">
      <div className="w-full max-w-xs rounded-sheet bg-surface p-7 text-center shadow-xl">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-forest-100 text-forest-700"><i className="ri-check-line text-3xl" /></div>
        <h2 className="mt-3 text-lg font-bold text-ink">{title}</h2>
        <p className="mt-1 text-sm text-ink-soft">{note}</p>
      </div>
    </div>
  );
}

// ---------- Images ----------
export function useImages(max = 10) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // returns an error message, or '' when the files were accepted
  const add = (list: FileList | null, alreadyHave = 0): string => {
    const picked = Array.from(list || []);
    if (picked.length === 0) return '';
    if (picked.length + files.length + alreadyHave > max) return `Tối đa ${max} ảnh`;
    setFiles(prev => [...prev, ...picked]);
    picked.forEach(f => {
      const r = new FileReader();
      r.onload = ev => setPreviews(prev => [...prev, ev.target?.result as string]);
      r.readAsDataURL(f);
    });
    return '';
  };
  const remove = (i: number) => {
    setFiles(prev => prev.filter((_, x) => x !== i));
    setPreviews(prev => prev.filter((_, x) => x !== i));
  };
  const clear = () => { setFiles([]); setPreviews([]); };
  return { files, previews, add, remove, clear, max };
}

export function ImageField({ images, existing = [], onRemoveExisting, onError, required, label = 'Hình ảnh' }: {
  images: ReturnType<typeof useImages>;
  existing?: string[];
  onRemoveExisting?: (i: number) => void;
  onError: (msg: string) => void;
  required?: boolean;
  label?: string;
}) {
  const total = existing.length + images.previews.length;
  const thumb = 'relative h-24 w-24 overflow-hidden rounded-lg border border-line bg-paper';
  const x = 'absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink/70 text-white hover:bg-brand-600';
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold text-ink">
        {label}{required && <span className="text-brand-600"> *</span>}
        <span className="ml-1.5 font-normal text-ink-faint">tối đa {images.max} ảnh, ảnh đầu tiên là ảnh bìa</span>
      </p>
      <div className="flex flex-wrap gap-3">
        {existing.map((src, i) => (
          <div key={`e${i}`} className={thumb}>
            <img src={src} alt="" className="h-full w-full object-cover" />
            {i === 0 && <span className="absolute inset-x-0 bottom-0 bg-ink/70 py-0.5 text-center text-[11px] font-semibold text-white">Ảnh bìa</span>}
            {onRemoveExisting && <button type="button" onClick={() => onRemoveExisting(i)} aria-label="Xóa ảnh" className={x}><i className="ri-close-line text-sm" /></button>}
          </div>
        ))}
        {images.previews.map((src, i) => (
          <div key={`n${i}`} className={`${thumb} !border-forest-400`}>
            <img src={src} alt="" className="h-full w-full object-cover" />
            {existing.length === 0 && i === 0
              ? <span className="absolute inset-x-0 bottom-0 bg-ink/70 py-0.5 text-center text-[11px] font-semibold text-white">Ảnh bìa</span>
              : <span className="absolute inset-x-0 bottom-0 bg-forest-600 py-0.5 text-center text-[11px] font-semibold text-white">Mới</span>}
            <button type="button" onClick={() => images.remove(i)} aria-label="Xóa ảnh" className={x}><i className="ri-close-line text-sm" /></button>
          </div>
        ))}
        {total < images.max && (
          <label className="grid h-24 w-24 cursor-pointer place-items-center rounded-lg border-2 border-dashed border-line text-center text-ink-faint hover:border-forest-500 hover:text-forest-700">
            <span><i className="ri-image-add-line block text-2xl" /><span className="text-[12px]">Thêm ảnh</span></span>
            <input type="file" multiple accept="image/*" className="sr-only" onChange={e => { onError(images.add(e.target.files, existing.length)); e.target.value = ''; }} />
          </label>
        )}
      </div>
    </div>
  );
}
