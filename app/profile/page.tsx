'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

type Tab = 'login' | 'register' | 'verify-otp' | 'forgot-password' | 'verify-reset-otp' | 'reset-password';

export default function ProfilePage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('login');

  // Nếu đã đăng nhập rồi → về dashboard (hoặc admin nếu là admin)
  useEffect(() => {
    if (auth.isLoggedIn()) {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const dest = user?.role?.toLowerCase() === 'admin' ? '/admin/dashboard' : '/dashboard';
        router.replace(dest);
      } catch {
        router.replace('/dashboard');
      }
    }
  }, []);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    otp: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'otp' ? value.replace(/\D/g, '').slice(0, 6) : value,
    }));
    setError('');
  };

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setMessage('');
    try {
      if (!formData.username || !formData.password) throw new Error('Tên đăng nhập và mật khẩu là bắt buộc');
      if (formData.password !== formData.confirmPassword) throw new Error('Mật khẩu không khớp');
      if (formData.password.length < 6) throw new Error('Mật khẩu phải ít nhất 6 ký tự');

      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          fullName: formData.fullName || formData.username,
          email: formData.email || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Đăng ký thất bại');

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      setMessage('Đăng ký thành công!');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setMessage('');
    try {
      if (!formData.otp || formData.otp.length !== 6) throw new Error('Vui lòng nhập mã OTP 6 chữ số');

      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: formData.otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Xác nhận OTP thất bại');

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      setMessage('Xác nhận email thành công!');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setMessage('');
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: formData.email, password: formData.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Đăng nhập thất bại');

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      // Gọi /users/me để lấy role chính xác
      const meRes = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${data.accessToken}` },
      });
      const me = meRes.ok ? await meRes.json() : (data.user || {});
      localStorage.setItem('user', JSON.stringify(me));

      const isAdmin = me?.role?.toLowerCase() === 'admin';
      setMessage(isAdmin ? 'Đăng nhập Admin thành công!' : 'Đăng nhập thành công!');
      setTimeout(() => router.push(isAdmin ? '/admin/dashboard' : '/dashboard'), 1500);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setMessage('');
    try {
      if (!formData.email) throw new Error('Vui lòng nhập email');

      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gửi OTP thất bại');

      setMessage('Đã gửi mã OTP tới email của bạn');
      setFormData(prev => ({ ...prev, otp: '' }));
      setTab('verify-reset-otp');
      startCountdown();
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResetOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (!formData.otp || formData.otp.length !== 6) {
      setError('Vui lòng nhập mã OTP 6 chữ số');
      return;
    }
    setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    setTab('reset-password');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setMessage('');
    try {
      if (!formData.password) throw new Error('Vui lòng nhập mật khẩu mới');
      if (formData.password !== formData.confirmPassword) throw new Error('Mật khẩu không khớp');
      if (formData.password.length < 6) throw new Error('Mật khẩu phải ít nhất 6 ký tự');

      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: formData.otp, newPassword: formData.password, confirmPassword: formData.confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Đặt lại mật khẩu thất bại');

      setMessage('Đổi mật khẩu thành công! Vui lòng đăng nhập lại');
      setFormData({ email: formData.email, password: '', confirmPassword: '', fullName: '', otp: '' });
      setTimeout(() => setTab('login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true); setError('');
    try {
      const endpoint = tab === 'verify-reset-otp' ? 'forgot-password' : 'resend-otp';
      const res = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      if (!res.ok) throw new Error('Gửi lại OTP thất bại');
      setMessage('Đã gửi lại mã OTP');
      startCountdown();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const showTabs = tab === 'login' || tab === 'register';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <i className="ri-store-2-line text-white text-2xl"></i>
          </div>
          <h1 className="font-bold text-gray-800 text-lg">Chợ Nhân Cơ</h1>
        </div>

        {/* Tabs */}
        {showTabs && (
          <div className="flex gap-4 mb-6 border-b">
            <button
              onClick={() => { setTab('login'); setError(''); setMessage(''); }}
              className={`pb-3 font-medium transition ${tab === 'login' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => { setTab('register'); setError(''); setMessage(''); }}
              className={`pb-3 font-medium transition ${tab === 'register' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
            >
              Đăng ký
            </button>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {message}
          </div>
        )}

        {/* LOGIN */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập hoặc email</label>
              <input type="text" name="email" value={formData.email} onChange={handleChange} placeholder="username hoặc email@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium">
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
            <button type="button" onClick={() => { setTab('forgot-password'); setError(''); setMessage(''); setFormData(prev => ({ ...prev, email: '' })); }}
              className="w-full text-green-600 text-sm hover:text-green-700 transition">
              Quên mật khẩu?
            </button>
          </form>
        )}

        {/* REGISTER */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập *</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="vd: nguyen_van_a" required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              <p className="text-xs text-gray-500 mt-1">Chỉ chữ cái, số và dấu _, ít nhất 3 ký tự</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Nguyễn Văn A"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu *</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••" required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu *</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••" required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-gray-400 font-normal">(tùy chọn, để xác thực sau)</span>
              </label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium">
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
            <p className="text-center text-sm text-gray-500 mt-2">
              Đã có tài khoản?{' '}
              <button type="button" onClick={() => { setTab('login'); setError(''); setMessage(''); }}
                className="text-green-600 hover:text-green-700 font-medium">
                Đăng nhập
              </button>
            </p>
          </form>
        )}

        {/* VERIFY OTP (đăng ký) */}
        {tab === 'verify-otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Xác nhận email</h2>
              <p className="text-sm text-gray-500 mt-1">Mã OTP đã gửi tới <strong>{formData.email}</strong></p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã OTP (6 chữ số)</label>
              <input type="text" name="otp" value={formData.otp} onChange={handleChange} placeholder="000000" maxLength={6}
                className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono" />
            </div>
            <button type="submit" disabled={loading || formData.otp.length !== 6}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium">
              {loading ? 'Đang xác nhận...' : 'Xác nhận'}
            </button>
            <button type="button" onClick={handleResendOtp} disabled={countdown > 0 || loading}
              className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition text-sm">
              {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại OTP'}
            </button>
            <button type="button" onClick={() => { setTab('register'); setFormData(prev => ({ ...prev, otp: '' })); }}
              className="w-full text-gray-500 text-sm hover:text-gray-700 transition">
              Quay lại
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD - nhập email */}
        {tab === 'forgot-password' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Quên mật khẩu</h2>
              <p className="text-sm text-gray-500 mt-1">Nhập email để nhận mã OTP đặt lại mật khẩu</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium">
              {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
            </button>
            <button type="button" onClick={() => { setTab('login'); setError(''); setMessage(''); }}
              className="w-full text-gray-500 text-sm hover:text-gray-700 transition">
              Quay lại đăng nhập
            </button>
          </form>
        )}

        {/* VERIFY RESET OTP - xác nhận OTP */}
        {tab === 'verify-reset-otp' && (
          <form onSubmit={handleVerifyResetOtp} className="space-y-4">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Nhập mã xác nhận</h2>
              <p className="text-sm text-gray-500 mt-1">Mã OTP đã gửi tới <strong>{formData.email}</strong></p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã OTP (6 chữ số)</label>
              <input type="text" name="otp" value={formData.otp} onChange={handleChange} placeholder="000000" maxLength={6}
                className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono" />
            </div>
            <button type="submit" disabled={formData.otp.length !== 6}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium">
              Xác nhận mã OTP
            </button>
            <button type="button" onClick={handleResendOtp} disabled={countdown > 0 || loading}
              className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition text-sm">
              {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại OTP'}
            </button>
            <button type="button" onClick={() => { setTab('forgot-password'); setError(''); setMessage(''); }}
              className="w-full text-gray-500 text-sm hover:text-gray-700 transition">
              Quay lại
            </button>
          </form>
        )}

        {/* RESET PASSWORD - đặt mật khẩu mới */}
        {tab === 'reset-password' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Đặt lại mật khẩu</h2>
              <p className="text-sm text-gray-500 mt-1">Tạo mật khẩu mới cho tài khoản của bạn</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••" required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••" required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium">
              {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t text-center text-sm text-gray-600">
          <p>Cần giúp?{' '}
            <a href="https://zalo.me/0888317289" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 font-medium">
              Liên hệ hỗ trợ
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
