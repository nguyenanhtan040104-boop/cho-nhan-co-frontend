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
    { id: 'analytics', label: 'Hiệu suất', icon: 'ri-bar-chart-line' },
    { id: 'engagement', label: 'Tương tác', icon: 'ri-heart-line' },
    { id: 'products', label: 'Sản phẩm', icon: 'ri-plant-line' },
    { id: 'real-estate', label: 'Bất động sản', icon: 'ri-home-4-line' },
    { id: 'jobs', label: 'Tuyển dụng', icon: 'ri-briefcase-line' },
    { id: 'notifications', label: 'Thông báo', icon: 'ri-notification-line' },
    { id: 'security', label: 'Bảo mật', icon: 'ri-shield-check-line' },
    { id: 'settings', label: 'Cài đặt', icon: 'ri-settings-line' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <div className="flex items-center gap-3">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-10 h-10 md:w-14 md:h-14 rounded-full object-cover flex-shrink-0 border-2 border-green-200" />
            ) : (
              <div className="w-10 h-10 md:w-14 md:h-14 bg-green-600 rounded-full flex items-center justify-center text-white text-lg md:text-xl font-bold flex-shrink-0">
                {user?.fullName?.[0] || 'U'}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-lg md:text-2xl font-bold text-gray-900 truncate">{user?.fullName}</h1>
              {user?.username && <p className="text-sm text-gray-500 truncate">@{user.username}</p>}
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 text-sm flex-shrink-0">
            <i className="ri-logout-box-line"></i>
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>

        {/* Mobile: horizontal scroll tabs */}
        <div className="md:hidden mb-4">
          <div className="bg-white rounded-xl shadow-sm p-1.5 overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {tabs.map(tab => (
                <button key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'notifications') notifications.getAll().then((d: any) => setNotifs(d.data || [])).catch(() => {});
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors relative ${
                    activeTab === tab.id ? 'bg-green-50 text-green-700' : 'text-gray-600'
                  }`}>
                  <i className={`${tab.icon} text-base`}></i>
                  {tab.label}
                  {tab.id === 'notifications' && notifs.filter(n => !n.isRead).length > 0 && (
                    <span className="bg-red-500 text-white text-xs px-1 rounded-full leading-4">{notifs.filter(n => !n.isRead).length}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar - desktop only */}
          <div className="hidden md:block w-56 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-2">
              {tabs.map(tab => (
                <button key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'notifications') {
                      notifications.getAll().then((d: any) => setNotifs(d.data || [])).catch(() => {});
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors mb-1 ${
                    activeTab === tab.id ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}>
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
          <div className="flex-1 min-w-0">

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

            {/* ANALYTICS TAB - 3.2 Theo dõi hiệu suất */}
            {activeTab === 'analytics' && <AnalyticsTab />}

            {/* ENGAGEMENT TAB - 3.4 User Engagement */}
            {activeTab === 'engagement' && <EngagementTab />}

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
              <ProductsTab
                myProducts={myProducts}
                setMyProducts={setMyProducts}
              />
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
                    {notifs.map(notif => {
                      const convId = notif.data?.conversationId;
                      const isMessage = notif.type === 'MESSAGE' && convId;
                      const icon = notif.type === 'MESSAGE' ? 'ri-message-3-line text-blue-500' : 'ri-notification-3-line text-green-500';
                      const content = (
                        <div className={`bg-white rounded-xl p-4 shadow-sm border-l-4 transition-colors ${
                          notif.isRead ? 'border-gray-200' : 'border-green-500'
                        } ${isMessage ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
                          onClick={async () => {
                            if (!notif.isRead) {
                              await notifications.markRead(notif.id).catch(() => {});
                              setNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
                            }
                            if (isMessage) router.push(`/messages/${convId}`);
                          }}>
                          <div className="flex items-start gap-3">
                            <i className={`${icon} text-xl flex-shrink-0 mt-0.5`}></i>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`font-medium text-sm ${notif.isRead ? 'text-gray-600' : 'text-gray-900'}`}>{notif.title}</p>
                                {!notif.isRead && <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1"></span>}
                              </div>
                              {notif.body && <p className="text-sm text-gray-500 mt-0.5 truncate">{notif.body}</p>}
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notif.createdAt).toLocaleString('vi-VN', {
                                  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                      return <div key={notif.id}>{content}</div>;
                    })}
                  </div>
                )}
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'security' && (
              <SecurityTab />
            )}

            {activeTab === 'settings' && user && (
              <SettingsTab user={user} onUpdate={setUser} />
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityTab() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${API_URL}/users/me/login-history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setHistory(data.data || []);
      } catch {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function getStatusStyle(status: string) {
    if (status === 'SUCCESS') return 'bg-green-100 text-green-700';
    if (status === 'FAILED') return 'bg-red-100 text-red-700';
    if (status === 'LOCKED') return 'bg-orange-100 text-orange-700';
    return 'bg-gray-100 text-gray-700';
  }

  function getStatusLabel(status: string) {
    if (status === 'SUCCESS') return 'Thành công';
    if (status === 'FAILED') return 'Sai mật khẩu';
    if (status === 'LOCKED') return 'Bị khóa';
    return status;
  }

  function formatDevice(userAgent: string) {
    if (!userAgent) return 'Không rõ';
    if (userAgent.includes('Mobile')) return 'Điện thoại';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    return 'Trình duyệt';
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Bảo mật tài khoản</h2>

      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-2">
          <i className="ri-lock-password-line text-green-600 text-xl"></i>
          <h3 className="font-semibold text-gray-900">Khóa tài khoản tự động</h3>
        </div>
        <p className="text-sm text-gray-500">Tài khoản sẽ bị khóa <strong>15 phút</strong> nếu nhập sai mật khẩu <strong>5 lần liên tiếp</strong>.</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Lịch sử đăng nhập gần đây</h3>
        {loading ? (
          <p className="text-gray-400 text-sm">Đang tải...</p>
        ) : history.length === 0 ? (
          <p className="text-gray-400 text-sm">Chưa có lịch sử đăng nhập</p>
        ) : (
          <div className="space-y-3">
            {history.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <i className={`text-xl ${item.status === 'SUCCESS' ? 'ri-shield-check-line text-green-500' : 'ri-shield-cross-line text-red-500'}`}></i>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{formatDevice(item.userAgent)}</p>
                    <p className="text-xs text-gray-400">{item.ipAddress} · {new Date(item.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusStyle(item.status)}`}>
                  {getStatusLabel(item.status)}
                </span>
              </div>
            ))}
          </div>
        )}
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
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState('');

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

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!user.isEmailVerified) {
      setAvatarMsg('Vui lòng xác thực email trước khi cập nhật ảnh đại diện');
      return;
    }
    setAvatarUploading(true);
    setAvatarMsg('');
    try {
      const { uploads } = await import('../../lib/api');
      const { url } = await uploads.uploadImage(file);
      const updated = await users.updateProfile({ avatarUrl: url });
      onUpdate({ ...user, ...updated, avatarUrl: url });
      setAvatarMsg('Cập nhật ảnh đại diện thành công!');
      setTimeout(() => setAvatarMsg(''), 3000);
    } catch (err: any) {
      setAvatarMsg(err.message || 'Lỗi tải ảnh lên');
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
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

      {/* Avatar */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Ảnh đại diện</h3>
        <div className="flex items-center gap-5">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-green-200" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-2xl">
              {user.fullName?.[0] || 'U'}
            </div>
          )}
          <div>
            {user.isEmailVerified ? (
              <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${avatarUploading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}>
                <i className={avatarUploading ? 'ri-loader-4-line animate-spin' : 'ri-camera-line'}></i>
                {avatarUploading ? 'Đang tải...' : 'Đổi ảnh đại diện'}
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={avatarUploading} />
              </label>
            ) : (
              <div>
                <button disabled className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gray-300 cursor-not-allowed">
                  <i className="ri-camera-line"></i> Đổi ảnh đại diện
                </button>
                <p className="text-xs text-orange-500 mt-1.5 flex items-center gap-1">
                  <i className="ri-information-line"></i> Cần xác thực email để đổi ảnh
                </p>
              </div>
            )}
            {avatarMsg && (
              <p className={`text-xs mt-1.5 ${avatarMsg.includes('thành công') ? 'text-green-600' : 'text-red-500'}`}>{avatarMsg}</p>
            )}
          </div>
        </div>
      </div>

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

// =================== PRODUCTS TAB COMPONENT ===================
function ProductsTab({ myProducts, setMyProducts }: { myProducts: any[]; setMyProducts: any }) {
  const [editingQuantity, setEditingQuantity] = useState<string | null>(null);
  const [quantityValue, setQuantityValue] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Xóa sản phẩm này?')) return;
    setActionLoading(id + '-delete');
    try {
      await products.delete(id);
      setMyProducts((prev: any[]) => prev.filter(p => p.id !== id));
    } catch { alert('Xóa thất bại'); }
    finally { setActionLoading(null); }
  }

  async function handleRestore(id: string) {
    setActionLoading(id + '-restore');
    try {
      await products.restore(id);
      setMyProducts((prev: any[]) => prev.map(p => p.id === id ? { ...p, isDeleted: false, status: 'ACTIVE' } : p));
    } catch { alert('Khôi phục thất bại'); }
    finally { setActionLoading(null); }
  }

  async function handleToggleStatus(product: any) {
    const newStatus = product.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setActionLoading(product.id + '-status');
    try {
      await products.updateStatus(product.id, newStatus);
      setMyProducts((prev: any[]) => prev.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
    } catch { alert('Cập nhật thất bại'); }
    finally { setActionLoading(null); }
  }

  async function handleSaveQuantity(id: string) {
    const qty = Number(quantityValue);
    if (isNaN(qty) || qty < 0) { alert('Số lượng không hợp lệ'); return; }
    setActionLoading(id + '-qty');
    try {
      const updated = await products.updateQuantity(id, qty);
      setMyProducts((prev: any[]) => prev.map(p => p.id === id ? { ...p, quantity: qty, status: qty <= 0 ? 'SOLD_OUT' : p.status } : p));
      setEditingQuantity(null);
    } catch { alert('Cập nhật thất bại'); }
    finally { setActionLoading(null); }
  }

  const statusLabel: any = { ACTIVE: 'Đang hiển thị', PAUSED: 'Tạm dừng', SOLD_OUT: 'Hết hàng', DRAFT: 'Nháp' };
  const statusColor: any = {
    ACTIVE: 'bg-green-100 text-green-700',
    PAUSED: 'bg-yellow-100 text-yellow-700',
    SOLD_OUT: 'bg-red-100 text-red-700',
    DRAFT: 'bg-gray-100 text-gray-600',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Sản phẩm của tôi ({myProducts.length})</h2>
        <Link href="/products/create" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
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
            <div key={product.id} className={`bg-white rounded-xl p-4 shadow-sm ${product.isDeleted ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-4">
                {/* Ảnh */}
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {product.images?.[0] ? (
                    <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <i className="ri-image-line text-gray-400 text-xl"></i>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-gray-900 truncate">{product.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${statusColor[product.status] || 'bg-gray-100 text-gray-600'}`}>
                      {statusLabel[product.status] || product.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-green-600 font-semibold text-sm">{Number(product.price).toLocaleString()}đ/{product.unit}</span>
                    {product.isVip && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">VIP</span>
                    )}
                    <span className="text-xs text-gray-400"><i className="ri-eye-line mr-1"></i>{product.viewCount}</span>
                  </div>

                  {/* Tồn kho */}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">Tồn kho:</span>
                    {editingQuantity === product.id ? (
                      <div className="flex items-center gap-1">
                        <input type="number" value={quantityValue} onChange={e => setQuantityValue(e.target.value)}
                          className="w-20 px-2 py-0.5 border border-gray-300 rounded text-xs" min="0" autoFocus />
                        <button onClick={() => handleSaveQuantity(product.id)}
                          disabled={actionLoading === product.id + '-qty'}
                          className="text-xs bg-green-600 text-white px-2 py-0.5 rounded hover:bg-green-700 disabled:opacity-50">
                          {actionLoading === product.id + '-qty' ? '...' : 'Lưu'}
                        </button>
                        <button onClick={() => setEditingQuantity(null)} className="text-xs text-gray-500 hover:text-gray-700">Hủy</button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingQuantity(product.id); setQuantityValue(String(product.quantity ?? 0)); }}
                        className="text-xs text-blue-600 hover:underline">
                        {product.quantity ?? 0} {product.unit} (sửa)
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t flex-wrap">
                <Link href={`/products/${product.id}`}
                  className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50">
                  <i className="ri-eye-line"></i> Xem
                </Link>

                {!product.isDeleted && (
                  <Link href={`/products/${product.id}/edit`}
                    className="flex items-center gap-1 text-xs text-gray-600 hover:text-green-600 px-2 py-1 rounded hover:bg-green-50">
                    <i className="ri-edit-line"></i> Sửa
                  </Link>
                )}

                {!product.isDeleted && product.status !== 'SOLD_OUT' && (
                  <button onClick={() => handleToggleStatus(product)}
                    disabled={actionLoading === product.id + '-status'}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors disabled:opacity-50 ${
                      product.status === 'ACTIVE'
                        ? 'text-yellow-600 hover:bg-yellow-50'
                        : 'text-green-600 hover:bg-green-50'
                    }`}>
                    <i className={product.status === 'ACTIVE' ? 'ri-pause-circle-line' : 'ri-play-circle-line'}></i>
                    {actionLoading === product.id + '-status' ? '...' : product.status === 'ACTIVE' ? 'Tạm dừng' : 'Hiển thị lại'}
                  </button>
                )}

                {!product.isDeleted && !product.isVip && (
                  <Link href={`/products/vip?id=${product.id}`}
                    className="flex items-center gap-1 text-xs text-yellow-600 hover:text-yellow-700 px-2 py-1 rounded hover:bg-yellow-50">
                    <i className="ri-vip-crown-line"></i> Nâng VIP
                  </Link>
                )}

                {!product.isDeleted ? (
                  <button onClick={() => handleDelete(product.id)}
                    disabled={actionLoading === product.id + '-delete'}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 ml-auto disabled:opacity-50">
                    <i className="ri-delete-bin-line"></i>
                    {actionLoading === product.id + '-delete' ? '...' : 'Xóa'}
                  </button>
                ) : (
                  <button onClick={() => handleRestore(product.id)}
                    disabled={actionLoading === product.id + '-restore'}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 ml-auto disabled:opacity-50">
                    <i className="ri-restart-line"></i>
                    {actionLoading === product.id + '-restore' ? '...' : 'Khôi phục'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =================== 3.2 ANALYTICS TAB ===================
function AnalyticsTab() {
  const [data, setData] = useState<any>(null);
  const [reData, setReData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([analytics.getProductStats(), analytics.getRealEstateStats()])
      .then(([p, r]) => {
        if (p.status === 'fulfilled') setData(p.value);
        if (r.status === 'fulfilled') setReData(r.value || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div></div>;

  const products = data?.products || [];
  const maxViews = Math.max(...products.map((p: any) => p.viewCount), 1);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Hiệu suất tin đăng</h2>

      {/* Sản phẩm */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i className="ri-plant-line text-green-600"></i>
          Top sản phẩm theo lượt xem
        </h3>
        {products.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Chưa có dữ liệu</p>
        ) : (
          <div className="space-y-3">
            {products.map((p: any, i: number) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="w-6 text-sm text-gray-400 text-center font-medium">{i + 1}</span>
                {p.images?.[0] && (
                  <img src={p.images[0].url} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" alt="" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(p.viewCount / maxViews) * 100}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{p.viewCount} lượt xem</span>
                  </div>
                </div>
                {p.isVip && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-medium">VIP</span>}
                <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {p.status === 'ACTIVE' ? 'Hoạt động' : 'Ẩn'}
                </span>
              </div>
            ))}
          </div>
        )}
        {data?.totalViews !== undefined && (
          <p className="text-xs text-gray-400 mt-4 pt-4 border-t">Tổng lượt xem sản phẩm: <strong className="text-gray-700">{data.totalViews.toLocaleString()}</strong></p>
        )}
      </div>

      {/* Bất động sản */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i className="ri-home-4-line text-blue-600"></i>
          Bất động sản theo lượt xem
        </h3>
        {reData.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Chưa có dữ liệu</p>
        ) : (
          <div className="space-y-3">
            {reData.map((r: any, i: number) => (
              <div key={r.id} className="flex items-center gap-3">
                <span className="w-6 text-sm text-gray-400 text-center font-medium">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(r.viewCount / Math.max(...reData.map((x: any) => x.viewCount), 1)) * 100}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{r.viewCount} lượt xem</span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  r.status === 'NEW' ? 'bg-green-100 text-green-700' :
                  r.status === 'TRADING' ? 'bg-yellow-100 text-yellow-700' :
                  r.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {r.status === 'NEW' ? 'Mới' : r.status === 'TRADING' ? 'Giao dịch' : r.status === 'COMPLETED' ? 'Hoàn tất' : 'Tạm dừng'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// =================== 3.4 ENGAGEMENT TAB ===================
function EngagementTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analytics.getEngagement()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div></div>;

  const summary = data?.summary || {};
  const forumPosts = data?.forumPosts || [];

  const totalViews = (summary.totalProductViews || 0) + (summary.totalRealEstateViews || 0) + (summary.totalJobViews || 0);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Tương tác & Engagement</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tổng lượt xem', value: totalViews.toLocaleString(), icon: 'ri-eye-line', color: 'bg-blue-100 text-blue-600' },
          { label: 'Lượt thích forum', value: summary.totalForumLikes || 0, icon: 'ri-heart-line', color: 'bg-red-100 text-red-500' },
          { label: 'Bình luận', value: summary.totalForumComments || 0, icon: 'ri-chat-1-line', color: 'bg-purple-100 text-purple-600' },
          { label: 'View BĐS', value: (summary.totalRealEstateViews || 0).toLocaleString(), icon: 'ri-home-4-line', color: 'bg-green-100 text-green-600' },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${item.color}`}>
              <i className={`${item.icon} text-lg`}></i>
            </div>
            <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            <p className="text-xs text-gray-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Breakdown lượt xem theo loại */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Lượt xem theo danh mục</h3>
        {[
          { label: 'Sản phẩm', value: summary.totalProductViews || 0, color: 'bg-green-500', total: totalViews },
          { label: 'Bất động sản', value: summary.totalRealEstateViews || 0, color: 'bg-blue-500', total: totalViews },
          { label: 'Tuyển dụng', value: summary.totalJobViews || 0, color: 'bg-indigo-500', total: totalViews },
        ].map((item, i) => (
          <div key={i} className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">{item.label}</span>
              <span className="font-medium text-gray-900">{item.value.toLocaleString()} lượt</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className={`${item.color} h-2 rounded-full`}
                style={{ width: item.total > 0 ? `${(item.value / item.total) * 100}%` : '0%' }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Forum posts engagement */}
      {forumPosts.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <i className="ri-chat-3-line text-purple-600"></i>
            Bài viết diễn đàn
          </h3>
          <div className="space-y-3">
            {forumPosts.map((p: any) => (
              <div key={p.id} className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                  <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 flex-shrink-0">
                  <span className="flex items-center gap-1"><i className="ri-heart-line text-red-400"></i>{p.likeCount}</span>
                  <span className="flex items-center gap-1"><i className="ri-chat-1-line text-blue-400"></i>{p._count?.comments || 0}</span>
                  <span className="flex items-center gap-1"><i className="ri-eye-line text-gray-400"></i>{p.viewCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
