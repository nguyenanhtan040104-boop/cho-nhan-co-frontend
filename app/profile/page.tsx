'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/api';
import Logo from '../components/Logo';
import { Field, Row } from '../components/form/Kit';

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
  const [otpAttempts, setOtpAttempts] = useState(0);

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
      if (!formData.email) throw new Error('Email là bắt buộc để xác thực tài khoản');
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
          email: formData.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Đăng ký thất bại');

      setOtpAttempts(0);
      setFormData(prev => ({ ...prev, otp: '' }));
      setTab('verify-otp');
      startCountdown();
      setMessage(data.message || `Mã OTP đã gửi tới ${formData.email}`);
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
      if (otpAttempts >= 5) throw new Error('Bạn đã nhập sai OTP quá 5 lần. Vui lòng gửi lại OTP mới.');

      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: formData.otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        const newAttempts = otpAttempts + 1;
        setOtpAttempts(newAttempts);
        const remaining = 5 - newAttempts;
        throw new Error(remaining > 0
          ? `OTP không chính xác. Còn ${remaining} lần thử.`
          : 'Bạn đã nhập sai OTP quá 5 lần. Vui lòng gửi lại OTP mới.');
      }

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
      setFormData({ username: '', email: formData.email, password: '', confirmPassword: '', fullName: '', otp: '' });
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
      setOtpAttempts(0);
      setFormData(prev => ({ ...prev, otp: '' }));
      startCountdown();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const showTabs = tab === 'login' || tab === 'register';
  const go = (t: Tab, extra?: () => void) => () => { setTab(t); setError(''); setMessage(''); extra?.(); };
  const tabBtn = (active: boolean) =>
    `-mb-px border-b-2 px-1 pb-3 text-[15px] font-semibold ${active ? 'border-forest-600 text-forest-700' : 'border-transparent text-ink-soft hover:text-ink'}`;
  const link = 'text-sm font-semibold text-forest-700 hover:underline';

  return (
    <div className="min-h-screen bg-paper px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-5 flex items-center gap-3">
          <Logo size={40} />
          <div>
            <p className="text-lg font-bold leading-tight text-ink">Chợ Nhân Cơ</p>
            <p className="text-[13px] text-ink-faint">Mua bán nông sản, nhà đất, việc làm tại Đắk Nông</p>
          </div>
        </div>

        <div className="card p-5 sm:p-7">
          {showTabs && (
            <div className="mb-5 flex gap-6 border-b border-line" role="tablist">
              <button role="tab" aria-selected={tab === 'login'} onClick={go('login')} className={tabBtn(tab === 'login')}>Đăng nhập</button>
              <button role="tab" aria-selected={tab === 'register'} onClick={go('register')} className={tabBtn(tab === 'register')}>Đăng ký</button>
            </div>
          )}

          {error && <p role="alert" className="mb-4 rounded-lg border border-brand-200 bg-brand-50 p-3 text-sm text-brand-700">{error}</p>}
          {message && <p role="status" className="mb-4 rounded-lg border border-forest-200 bg-forest-50 p-3 text-sm text-forest-800">{message}</p>}

          {showTabs && (
            <>
              <a href={`${API_URL}/auth/google`} className="btn-ghost w-full gap-3">
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                Tiếp tục với Google
              </a>
              <div className="my-4 flex items-center gap-3 text-[12px] text-ink-faint"><span className="h-px flex-1 bg-line" />hoặc<span className="h-px flex-1 bg-line" /></div>
            </>
          )}

          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <Field label="Tên đăng nhập hoặc email">
                <input type="text" name="email" autoComplete="username" value={formData.email} onChange={handleChange} placeholder="tên đăng nhập hoặc email" className="field" />
              </Field>
              <Field label="Mật khẩu">
                <input type="password" name="password" autoComplete="current-password" value={formData.password} onChange={handleChange} className="field" />
              </Field>
              <button type="submit" disabled={loading} className="btn-forest w-full py-3 disabled:opacity-50">{loading ? 'Đang xử lý...' : 'Đăng nhập'}</button>
              <p className="text-center">
                <button type="button" onClick={go('forgot-password', () => setFormData(prev => ({ ...prev, email: '' })))} className={link}>Quên mật khẩu?</button>
              </p>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <Field label="Tên đăng nhập" required hint="chữ cái, số và dấu _, ít nhất 3 ký tự">
                <input type="text" name="username" autoComplete="username" value={formData.username} onChange={handleChange} required className="field" />
              </Field>
              <Field label="Họ và tên">
                <input type="text" name="fullName" autoComplete="name" value={formData.fullName} onChange={handleChange} placeholder="Nguyễn Văn A" className="field" />
              </Field>
              <Field label="Email" required hint="dùng để nhận mã xác thực OTP">
                <input type="email" name="email" autoComplete="email" value={formData.email} onChange={handleChange} required className="field" />
              </Field>
              <Row>
                <Field label="Mật khẩu" required hint="từ 6 ký tự">
                  <input type="password" name="password" autoComplete="new-password" value={formData.password} onChange={handleChange} required className="field" />
                </Field>
                <Field label="Nhập lại mật khẩu" required>
                  <input type="password" name="confirmPassword" autoComplete="new-password" value={formData.confirmPassword} onChange={handleChange} required className="field" />
                </Field>
              </Row>
              <button type="submit" disabled={loading} className="btn-forest w-full py-3 disabled:opacity-50">{loading ? 'Đang xử lý...' : 'Tạo tài khoản'}</button>
              <p className="text-center text-sm text-ink-soft">Đã có tài khoản? <button type="button" onClick={go('login')} className={link}>Đăng nhập</button></p>
            </form>
          )}

          {(tab === 'verify-otp' || tab === 'verify-reset-otp') && (
            <form onSubmit={tab === 'verify-otp' ? handleVerifyOtp : handleVerifyResetOtp} className="space-y-4">
              <div>
                <h1 className="text-xl font-bold text-ink">{tab === 'verify-otp' ? 'Xác nhận email' : 'Nhập mã xác nhận'}</h1>
                <p className="mt-1 text-sm text-ink-soft">Mã 6 chữ số đã gửi tới <b className="text-ink">{formData.email}</b>.</p>
              </div>
              <Field label="Mã OTP">
                <input type="text" inputMode="numeric" autoComplete="one-time-code" name="otp" value={formData.otp} onChange={handleChange} placeholder="000000" maxLength={6}
                  className="field !py-3 text-center font-mono text-2xl tracking-[0.4em]" />
              </Field>
              {tab === 'verify-otp' && otpAttempts > 0 && otpAttempts < 5 && <p className="text-center text-xs text-brand-600">Còn {5 - otpAttempts} lần thử</p>}
              <button type="submit" disabled={loading || formData.otp.length !== 6 || (tab === 'verify-otp' && otpAttempts >= 5)} className="btn-forest w-full py-3 disabled:opacity-50">
                {loading ? 'Đang xác nhận...' : 'Xác nhận'}
              </button>
              <button type="button" onClick={handleResendOtp} disabled={countdown > 0 || loading} className="btn-ghost w-full disabled:opacity-50">
                {countdown > 0 ? `Gửi lại sau ${countdown} giây` : 'Gửi lại mã'}
              </button>
              <p className="text-center">
                <button type="button" onClick={tab === 'verify-otp' ? go('register', () => setFormData(prev => ({ ...prev, otp: '' }))) : go('forgot-password')} className={link}>Quay lại</button>
              </p>
            </form>
          )}

          {tab === 'forgot-password' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <h1 className="text-xl font-bold text-ink">Quên mật khẩu</h1>
                <p className="mt-1 text-sm text-ink-soft">Nhập email của bạn để nhận mã đặt lại mật khẩu.</p>
              </div>
              <Field label="Email">
                <input type="email" name="email" autoComplete="email" value={formData.email} onChange={handleChange} required className="field" />
              </Field>
              <button type="submit" disabled={loading} className="btn-forest w-full py-3 disabled:opacity-50">{loading ? 'Đang gửi...' : 'Gửi mã'}</button>
              <p className="text-center"><button type="button" onClick={go('login')} className={link}>Quay lại đăng nhập</button></p>
            </form>
          )}

          {tab === 'reset-password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <h1 className="text-xl font-bold text-ink">Đặt lại mật khẩu</h1>
                <p className="mt-1 text-sm text-ink-soft">Tạo mật khẩu mới cho tài khoản của bạn.</p>
              </div>
              <Field label="Mật khẩu mới" hint="từ 6 ký tự">
                <input type="password" name="password" autoComplete="new-password" value={formData.password} onChange={handleChange} required className="field" />
              </Field>
              <Field label="Nhập lại mật khẩu mới">
                <input type="password" name="confirmPassword" autoComplete="new-password" value={formData.confirmPassword} onChange={handleChange} required className="field" />
              </Field>
              <button type="submit" disabled={loading} className="btn-forest w-full py-3 disabled:opacity-50">{loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}</button>
            </form>
          )}
        </div>

        <p className="mt-5 text-center text-sm text-ink-soft">
          Cần giúp đỡ?{' '}
          <a href="https://zalo.me/0888317289" target="_blank" rel="noopener noreferrer" className={link}>Nhắn Zalo hỗ trợ</a>
        </p>
      </div>
    </div>
  );
}
