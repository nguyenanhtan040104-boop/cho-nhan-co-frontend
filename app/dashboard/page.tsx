'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, users, analytics, products, realEstate, jobs, notifications } from '../../lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [myRealEstates, setMyRealEstates] = useState<any[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth.isLoggedIn()) {
      router.push('/profile');
      return;
    }
    loadData();
  }, []);

  async function loadData() {
  try {
    const userData = await users.getMe();
    setUser(userData);

    // Load các phần khác độc lập, lỗi không làm crash trang
    const results = await Promise.allSettled([
      analytics.getOverview(),
      products.getMine(),
      realEstate.getMine(),
      jobs.getMine(),
      notifications.getAll(),
    ]);

    if (results[0].status === 'fulfilled') setStats(results[0].value);
    if (results[1].status === 'fulfilled') setMyProducts(results[1].value.data || []);
    if (results[2].status === 'fulfilled') setMyRealEstates(results[2].value.data || []);
    if (results[3].status === 'fulfilled') setMyJobs(results[3].value.data || []);
    if (results[4].status === 'fulfilled') setNotifs(results[4].value.data || []);
  } catch (e: any) {
    setError(e.message || 'Lỗi tải dữ liệu');
  } finally {
    setLoading(false);
  }
}

  async function handleDeleteProduct(id: string) {
    if (!confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      await products.delete(id);
      setMyProducts(prev => prev.filter(p => p.id !== id));
    } catch {
      alert('Xóa thất bại');
    }
  }

  async function handleDeleteRealEstate(id: string) {
    if (!confirm('Bạn chắc chắn muốn xóa tin này?')) return;
    try {
      await realEstate.delete(id);
      setMyRealEstates(prev => prev.filter(p => p.id !== id));
    } catch {
      alert('Xóa thất bại');
    }
  }

  async function handleDeleteJob(id: string) {
    if (!confirm('Bạn chắc chắn muốn xóa tin này?')) return;
    try {
      await jobs.delete(id);
      setMyJobs(prev => prev.filter(p => p.id !== id));
    } catch {
      alert('Xóa thất bại');
    }
  }

  async function handleMarkAllRead() {
    await notifications.markAllRead();
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
  }

  function handleLogout() {
    auth.logout();
    router.push('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/profile" className="text-green-600 underline">Đăng nhập lại</Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: 'ri-dashboard-line' },
    { id: 'products', label: 'Sản phẩm', icon: 'ri-plant-line' },
    { id: 'real-estate', label: 'Bất động sản', icon: 'ri-home-4-line' },
    { id: 'jobs', label: 'Tuyển dụng', icon: 'ri-briefcase-line' },
    { id: 'notifications', label: 'Thông báo', icon: 'ri-notification-line' },
    { id: 'settings', label: 'Cài đặt', icon: 'ri-settings-line' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {user?.fullName?.[0] || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user?.fullName}</h1>
              <p className="text-gray-500">@{user?.username}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            <i className="ri-logout-box-line"></i>
            Đăng xuất
          </button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-56 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors mb-1 ${
                    activeTab === tab.id
                      ? 'bg-green-50 text-green-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <i className={`${tab.icon} text-lg`}></i>
                  <span className="text-sm">{tab.label}</span>
                  {tab.id === 'notifications' && notifs.filter(n => !n.isRead).length > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {notifs.filter(n => !n.isRead).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && stats && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Tổng quan</h2>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <i className="ri-price-tag-3-line text-green-600 text-lg"></i>
                      </div>
                      <span className="text-gray-500 text-sm">Tin đăng</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalListings}</p>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i className="ri-eye-line text-blue-600 text-lg"></i>
                      </div>
                      <span className="text-gray-500 text-sm">Lượt xem</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalViews}</p>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <i className="ri-message-3-line text-purple-600 text-lg"></i>
                      </div>
                      <span className="text-gray-500 text-sm">Tin nhắn mới</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.unreadMessages}</p>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <i className="ri-vip-crown-line text-yellow-600 text-lg"></i>
                      </div>
                      <span className="text-gray-500 text-sm">Gói VIP</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                      {stats.vip ? `${stats.vip.plan} (${stats.vip.daysLeft}d)` : 'Chưa có'}
                    </p>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Phân loại tin đăng</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Sản phẩm', value: stats.breakdown?.products, color: 'text-green-600', icon: 'ri-plant-line' },
                      { label: 'Bất động sản', value: stats.breakdown?.realEstates, color: 'text-blue-600', icon: 'ri-home-4-line' },
                      { label: 'Tuyển dụng', value: stats.breakdown?.jobs, color: 'text-indigo-600', icon: 'ri-briefcase-line' },
                      { label: 'Diễn đàn', value: stats.breakdown?.forumPosts, color: 'text-purple-600', icon: 'ri-chat-3-line' },
                    ].map((item, i) => (
                      <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
                        <i className={`${item.icon} text-2xl ${item.color} mb-1 block`}></i>
                        <p className="text-2xl font-bold text-gray-900">{item.value || 0}</p>
                        <p className="text-sm text-gray-500">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Đăng tin mới</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { href: '/products/create', label: 'Đăng sản phẩm', icon: 'ri-plant-line', color: 'bg-green-600' },
                      { href: '/real-estate/create', label: 'Đăng BĐS', icon: 'ri-home-4-line', color: 'bg-blue-600' },
                      { href: '/jobs/create', label: 'Đăng tuyển dụng', icon: 'ri-briefcase-line', color: 'bg-indigo-600' },
                      { href: '/forum/create', label: 'Viết bài', icon: 'ri-chat-3-line', color: 'bg-purple-600' },
                    ].map((item, i) => (
                      <Link
                        key={i}
                        href={item.href}
                        className={`${item.color} text-white p-4 rounded-xl text-center hover:opacity-90 transition-opacity`}
                      >
                        <i className={`${item.icon} text-2xl block mb-1`}></i>
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Sản phẩm của tôi ({myProducts.length})</h2>
                  <Link href="/products/create" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                    + Đăng sản phẩm
                  </Link>
                </div>

                {myProducts.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                    <i className="ri-plant-line text-5xl text-gray-300 block mb-3"></i>
                    <p className="text-gray-500 mb-4">Bạn chưa có sản phẩm nào</p>
                    <Link href="/products/create" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                      Đăng sản phẩm ngay
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myProducts.map(product => (
                      <div key={product.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <i className="ri-image-line text-gray-400 text-xl"></i>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{product.title}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-green-600 font-semibold">{Number(product.price).toLocaleString()}đ/{product.unit}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              product.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                            }`}>{product.status === 'ACTIVE' ? 'Đang hiển thị' : 'Đã tạm dừng'}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span><i className="ri-eye-line mr-1"></i>{product.viewCount} lượt xem</span>
                            <span><i className="ri-map-pin-line mr-1"></i>{product.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={`/products/${product.id}`} className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
                            <i className="ri-eye-line text-lg"></i>
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                          >
                            <i className="ri-delete-bin-line text-lg"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* REAL ESTATE TAB */}
            {activeTab === 'real-estate' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Bất động sản của tôi ({myRealEstates.length})</h2>
                  <Link href="/real-estate/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    + Đăng BĐS
                  </Link>
                </div>

                {myRealEstates.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                    <i className="ri-home-4-line text-5xl text-gray-300 block mb-3"></i>
                    <p className="text-gray-500 mb-4">Bạn chưa có tin bất động sản nào</p>
                    <Link href="/real-estate/create" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                      Đăng tin ngay
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myRealEstates.map(item => (
                      <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.images?.[0] ? (
                            <img src={item.images[0].url} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <i className="ri-home-4-line text-gray-400 text-xl"></i>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.title}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-blue-600 font-semibold">{Number(item.price).toLocaleString()}đ</span>
                            <span className="text-sm text-gray-500">{item.area}m²</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              item.status === 'NEW' ? 'bg-green-100 text-green-700' :
                              item.status === 'TRADING' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>{item.status === 'NEW' ? 'Mới' : item.status === 'TRADING' ? 'Đang giao dịch' : item.status}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span><i className="ri-eye-line mr-1"></i>{item.viewCount} lượt xem</span>
                            <span><i className="ri-map-pin-line mr-1"></i>{item.address}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={`/real-estate/${item.id}`} className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
                            <i className="ri-eye-line text-lg"></i>
                          </Link>
                          <button
                            onClick={() => handleDeleteRealEstate(item.id)}
                            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                          >
                            <i className="ri-delete-bin-line text-lg"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* JOBS TAB */}
            {activeTab === 'jobs' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Tuyển dụng của tôi ({myJobs.length})</h2>
                  <Link href="/jobs/create" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                    + Đăng tuyển dụng
                  </Link>
                </div>

                {myJobs.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                    <i className="ri-briefcase-line text-5xl text-gray-300 block mb-3"></i>
                    <p className="text-gray-500 mb-4">Bạn chưa có tin tuyển dụng nào</p>
                    <Link href="/jobs/create" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
                      Đăng tin ngay
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myJobs.map(job => (
                      <div key={job.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="ri-briefcase-line text-indigo-600 text-xl"></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{job.title}</h4>
                            {job.isUrgent && (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Khẩn cấp</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span>{job.type === 'EMPLOYER' ? 'Tuyển dụng' : 'Tìm việc'}</span>
                            {job.salary && <span className="text-green-600 font-medium">{job.salary}</span>}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span><i className="ri-eye-line mr-1"></i>{job.viewCount} lượt xem</span>
                            <span><i className="ri-map-pin-line mr-1"></i>{job.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={`/jobs/${job.id}`} className="p-2 text-gray-500 hover:text-indigo-600 transition-colors">
                            <i className="ri-eye-line text-lg"></i>
                          </Link>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                          >
                            <i className="ri-delete-bin-line text-lg"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Thông báo</h2>
                  {notifs.some(n => !n.isRead) && (
                    <button onClick={handleMarkAllRead} className="text-sm text-green-600 hover:text-green-700">
                      Đánh dấu tất cả đã đọc
                    </button>
                  )}
                </div>

                {notifs.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                    <i className="ri-notification-line text-5xl text-gray-300 block mb-3"></i>
                    <p className="text-gray-500">Chưa có thông báo nào</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifs.map(notif => (
                      <div key={notif.id} className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${
                        notif.isRead ? 'border-gray-200' : 'border-green-500'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className={`font-medium ${notif.isRead ? 'text-gray-600' : 'text-gray-900'}`}>{notif.title}</p>
                            <p className="text-sm text-gray-500 mt-1">{notif.body}</p>
                          </div>
                          {!notif.isRead && (
                            <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notif.createdAt).toLocaleDateString('vi-VN', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && user && (
              <SettingsTab user={user} onUpdate={setUser} />
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ user, onUpdate }: { user: any; onUpdate: (u: any) => void }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const [form, setForm] = useState({
    fullName: user.fullName || '',
    address: user.address || '',
    phone: user.phone || '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [pwMsg, setPwMsg] = useState('');

  // Email verification state
  const [emailInput, setEmailInput] = useState(user.email || '');
  const [otpInput, setOtpInput] = useState('');
  const [emailStep, setEmailStep] = useState<'idle' | 'otp'>('idle');
  const [emailMsg, setEmailMsg] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  function startCountdown() {
    setCountdown(60);
    const t = setInterval(() => setCountdown(p => { if (p <= 1) { clearInterval(t); return 0; } return p - 1; }), 1000);
  }

  async function handleSendEmailOtp(e: React.FormEvent) {
    e.preventDefault();
    setEmailLoading(true); setEmailMsg('');
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/users/me/add-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: emailInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setEmailMsg('Đã gửi mã OTP tới email của bạn');
      setEmailStep('otp');
      startCountdown();
    } catch (err: any) {
      setEmailMsg(err.message || 'Có lỗi xảy ra');
    } finally {
      setEmailLoading(false);
    }
  }

  async function handleVerifyEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailLoading(true); setEmailMsg('');
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/users/me/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: otpInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setEmailMsg('Xác thực email thành công!');
      setEmailStep('idle');
      onUpdate({ ...user, email: emailInput, isEmailVerified: true });
    } catch (err: any) {
      setEmailMsg(err.message || 'Có lỗi xảy ra');
    } finally {
      setEmailLoading(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await users.updateProfile(form);
      onUpdate({ ...user, ...updated });
      setMsg('Lưu thành công!');
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setMsg(e.message || 'Lỗi lưu thông tin');
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg('Mật khẩu mới không khớp');
      return;
    }
    try {
      const { auth: authApi } = await import('../../lib/api');
      await authApi.changePassword(pwForm.currentPassword, pwForm.newPassword);
      setPwMsg('Đổi mật khẩu thành công!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e: any) {
      setPwMsg(e.message || 'Lỗi đổi mật khẩu');
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Cài đặt tài khoản</h2>

      {/* Profile Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Thông tin cá nhân</h3>
        <form onSubmit={handleSaveProfile}>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
              <input
                type="text"
                value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input
                type="text"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
              <input
                type="text"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="flex items-center gap-2">
              <input type="text" value={user.email || 'Chưa có email'} disabled className="flex-1 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
              {user.isEmailVerified
                ? <span className="text-green-600 text-sm font-medium whitespace-nowrap">Đã xác thực</span>
                : <span className="text-orange-500 text-sm font-medium whitespace-nowrap">Chưa xác thực</span>
              }
            </div>
          </div>

          {msg && (
            <p className={`mt-3 text-sm ${msg.includes('thành công') ? 'text-green-600' : 'text-red-600'}`}>{msg}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Đổi mật khẩu</h3>
        <form onSubmit={handleChangePassword}>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
              <input
                type="password"
                value={pwForm.currentPassword}
                onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
              <input
                type="password"
                value={pwForm.newPassword}
                onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                value={pwForm.confirmPassword}
                onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {pwMsg && (
            <p className={`mt-3 text-sm ${pwMsg.includes('thành công') ? 'text-green-600' : 'text-red-600'}`}>{pwMsg}</p>
          )}

          <button
            type="submit"
            className="mt-4 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Đổi mật khẩu
          </button>
        </form>
      </div>

      {/* Email Verification */}
      {!user.isEmailVerified && (
        <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-gray-900">Xác thực email</h3>
            <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">Bắt buộc để đăng bài</span>
          </div>

          {emailMsg && (
            <p className={`mb-3 text-sm ${emailMsg.includes('thành công') ? 'text-green-600' : emailMsg.includes('gửi') ? 'text-green-600' : 'text-red-600'}`}>{emailMsg}</p>
          )}

          {emailStep === 'idle' ? (
            <form onSubmit={handleSendEmailOtp} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {user.email ? 'Email của bạn' : 'Thêm email'}
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder="email@example.com"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <button type="submit" disabled={emailLoading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                {emailLoading ? 'Đang gửi...' : 'Gửi mã xác thực'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyEmail} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã OTP (6 chữ số)</label>
                <input
                  type="text"
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-mono"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={emailLoading || otpInput.length !== 6}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                  {emailLoading ? 'Đang xác nhận...' : 'Xác nhận'}
                </button>
                <button type="button" onClick={handleSendEmailOtp} disabled={countdown > 0 || emailLoading}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm">
                  {countdown > 0 ? `Gửi lại (${countdown}s)` : 'Gửi lại OTP'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {user.isEmailVerified && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-6 flex items-center gap-3">
          <i className="ri-checkbox-circle-fill text-green-600 text-xl"></i>
          <div>
            <p className="font-medium text-green-800">Email đã được xác thực</p>
            <p className="text-sm text-green-600">{user.email}</p>
          </div>
        </div>
      )}
    </div>
  );
}
