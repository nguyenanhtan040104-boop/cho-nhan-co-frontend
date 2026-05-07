'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function ProfilePage() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register' | 'verify-otp' | 'forgot-password' | 'reset-password'>('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
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

  /**
   * Đăng ký
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (!formData.email || !formData.password) {
        throw new Error('Email và password là bắt buộc');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Password không khớp');
      }

      if (formData.password.length < 6) {
        throw new Error('Password phải ít nhất 6 ký tự');
      }

      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          fullName: formData.fullName || 'User',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Đăng ký thất bại');
      }

      setMessage('✅ Đã gửi mã OTP tới email của bạn');
      setTab('verify-otp');
      startCountdown();
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify OTP
   */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (!formData.otp || formData.otp.length !== 6) {
        throw new Error('Vui lòng nhập mã OTP 6 chữ số');
      }

      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          code: formData.otp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Verify OTP thất bại');
      }

      // Lưu token
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      setMessage('✅ Xác nhận email thành công!');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Đăng nhập
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }

      // Lưu token
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      setMessage('✅ Đăng nhập thành công!');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Quên mật khẩu - gửi OTP
   */
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (!formData.email) throw new Error('Vui lòng nhập email');

      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gửi OTP thất bại');

      setMessage('✅ Đã gửi mã OTP tới email của bạn');
      setTab('reset-password');
      startCountdown();
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Đặt lại mật khẩu
   */
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (!formData.otp || formData.otp.length !== 6)
        throw new Error('Vui lòng nhập mã OTP 6 chữ số');
      if (!formData.password) throw new Error('Vui lòng nhập mật khẩu mới');
      if (formData.password !== formData.confirmPassword)
        throw new Error('Mật khẩu không khớp');
      if (formData.password.length < 6)
        throw new Error('Mật khẩu phải ít nhất 6 ký tự');

      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          code: formData.otp,
          newPassword: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Đặt lại mật khẩu thất bại');

      setMessage('✅ Đổi mật khẩu thành công! Vui lòng đăng nhập lại');
      setFormData({ email: formData.email, password: '', confirmPassword: '', fullName: '', otp: '' });
      setTimeout(() => setTab('login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gửi lại OTP
   */
  const handleResendOtp = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      if (!res.ok) {
        throw new Error('Gửi lại OTP thất bại');
      }

      setMessage('✅ Đã gửi lại mã OTP');
      startCountdown();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
        {/* Tabs */}
        {tab !== 'verify-otp' && tab !== 'forgot-password' && tab !== 'reset-password' && (
          <div className="flex gap-4 mb-8 border-b">
            <button
              onClick={() => setTab('login')}
              className={`pb-3 font-medium transition ${
                tab === 'login'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500'
              }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => setTab('register')}
              className={`pb-3 font-medium transition ${
                tab === 'register'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500'
              }`}
            >
              Đăng ký
            </button>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-3">
            <span className="text-lg">❌</span>
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-start gap-3">
            <span className="text-lg">✅</span>
            <span>{message}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium"
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>

            <button
              type="button"
              onClick={() => { setTab('forgot-password'); setError(''); setMessage(''); }}
              className="w-full text-green-600 text-sm hover:text-green-700 transition mt-1"
            >
              Quên mật khẩu?
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Bạn sẽ nhận OTP tại email này</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium"
            >
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </form>
        )}

        {/* VERIFY OTP FORM */}
        {tab === 'verify-otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
              <p className="font-medium">📧 Kiểm tra email của bạn</p>
              <p className="text-xs mt-1">{formData.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã OTP (6 chữ số)
              </label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading || formData.otp.length !== 6}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium"
            >
              {loading ? 'Đang xác nhận...' : 'Xác nhận OTP'}
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={countdown > 0 || loading}
              className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition text-sm"
            >
              {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại OTP'}
            </button>

            <button
              type="button"
              onClick={() => {
                setTab('register');
                setFormData({ ...formData, otp: '' });
              }}
              className="w-full text-green-600 py-2 text-sm hover:text-green-700 transition"
            >
              Quay lại
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {tab === 'forgot-password' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">🔑</div>
              <h2 className="text-xl font-semibold text-gray-800">Quên mật khẩu</h2>
              <p className="text-sm text-gray-500 mt-1">Nhập email để nhận mã OTP đặt lại mật khẩu</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium"
            >
              {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
            </button>

            <button
              type="button"
              onClick={() => { setTab('login'); setError(''); setMessage(''); }}
              className="w-full text-gray-500 text-sm hover:text-gray-700 transition"
            >
              ← Quay lại đăng nhập
            </button>
          </form>
        )}

        {/* RESET PASSWORD FORM */}
        {tab === 'reset-password' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🔐</div>
              <h2 className="text-xl font-semibold text-gray-800">Đặt lại mật khẩu</h2>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              📧 Mã OTP đã gửi tới: <strong>{formData.email}</strong>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mã OTP (6 chữ số)</label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading || formData.otp.length !== 6}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium"
            >
              {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={countdown > 0 || loading}
              className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition text-sm"
            >
              {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại OTP'}
            </button>

            <button
              type="button"
              onClick={() => { setTab('forgot-password'); setError(''); setMessage(''); }}
              className="w-full text-gray-500 text-sm hover:text-gray-700 transition"
            >
              ← Quay lại
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t text-center text-sm text-gray-600">
          <p>
            Cần giúp?{' '}
            <Link href="/support" className="text-green-600 hover:text-green-700 font-medium">
              Liên hệ hỗ trợ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
