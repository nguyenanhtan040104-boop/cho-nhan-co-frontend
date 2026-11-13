'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { messages as messagesApi, auth } from '../../../lib/api';

// Small toast instead of alert(): call notify("..."), render {toast} once in the page.
export function useToast() {
  const [text, setText] = useState('');
  const notify = useCallback((msg: string) => {
    setText(msg);
    setTimeout(() => setText(''), 3000);
  }, []);
  const toast = text ? (
    <div role="status" className="fixed left-1/2 top-20 z-[70] max-w-[90vw] -translate-x-1/2 rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-white shadow-lift">
      {text}
    </div>
  ) : null;
  return { notify, toast };
}

// Opens (or creates) the chat with the listing's owner; sends visitors to log in first.
export function useStartChat(userId: string | undefined, notify: (m: string) => void) {
  const router = useRouter();
  return useCallback(async () => {
    if (!auth.isLoggedIn()) { router.push('/profile'); return; }
    try {
      const conv = await messagesApi.getOrCreate(userId as string) as any;
      router.push(`/messages/${conv.id}`);
    } catch {
      notify('Không mở được cuộc trò chuyện');
    }
  }, [router, userId, notify]);
}

// Logged-in user's id, read after mount from the auth helper, the token, or the stored user
export function useCurrentUserId(): string | null {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    try {
      const fromAuth = (auth as any).getCurrentUserId?.();
      if (fromAuth) { setId(fromAuth); return; }
      const token = localStorage.getItem('accessToken');
      if (token) {
        const p = JSON.parse(atob(token.split('.')[1]));
        setId(p.sub || p.id || null);
        return;
      }
      setId(JSON.parse(localStorage.getItem('user') || 'null')?.id || null);
    } catch { /* not logged in */ }
  }, []);
  return id;
}
