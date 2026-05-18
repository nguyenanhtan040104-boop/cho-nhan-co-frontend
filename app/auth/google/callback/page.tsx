'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (error || !accessToken) {
      router.replace('/profile?error=google_failed');
      return;
    }

    // Lưu tokens
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

    // Lưu user info
    const user = {
      id: searchParams.get('userId') || '',
      fullName: searchParams.get('fullName') || '',
      email: searchParams.get('email') || '',
      username: searchParams.get('username') || '',
      avatarUrl: searchParams.get('avatarUrl') || '',
      role: searchParams.get('role') || 'USER',
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
