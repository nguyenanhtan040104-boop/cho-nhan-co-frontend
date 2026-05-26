'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';

function GoogleCallbackContent() {
  const router = useRouter();

  useEffect(() => {
    // Tokens are passed via URL fragment (#) — never sent to servers,
    // never logged, never leaked via Referer headers.
    const hash = window.location.hash.slice(1); // strip leading '#'
    const params = new URLSearchParams(hash);

    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const error = params.get('error');

    if (error || !accessToken) {
      router.replace('/profile?error=google_failed');
      return;
    }

    // Clear fragment immediately so tokens don't linger in browser history
    window.history.replaceState(null, '', window.location.pathname);

    // Lưu tokens
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

    // Lưu user info
    const user = {
      id: params.get('userId') || '',
      fullName: params.get('fullName') || '',
      email: params.get('email') || '',
      username: params.get('username') || '',
      avatarUrl: params.get('avatarUrl') || '',
      role: params.get('role') || 'USER',
    };
    localStorage.setItem('user', JSON.stringify(user));

    // Redirect
    const isAdmin = user.role?.toLowerCase() === 'admin';
    router.replace(isAdmin ? '/admin/dashboard' : '/dashboard');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Đang đăng nhập...</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div></div>}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
