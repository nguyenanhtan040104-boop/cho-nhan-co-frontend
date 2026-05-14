'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, users } from '../../../lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

async function adminRequest(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers as any),
    },
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Data states
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [allRealEstates, setAllRealEstates] = useState<any[]>([]);
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.push('/profile'); return; }
    loadAdmin();
  }, []);

  async function loadAdmin() {
    try {
      const me = await users.getMe();
      if (me.role?.toLowerCase() !== 'admin') {
        alert('Bạn không có quyền truy cập trang này');
        router.push('/dashboard');
        return;
      }
      setUser(me);
      await loadOverview();
    } catch {
      router.push('/profile');
    } finally {
      setLoading(false);
    }
  }

  async function loadOverview() {
    try {
      const [usersData, productsData, realEstatesData, jobsData, postsData] = await Promise.all([
        adminRequest('/users/me').catch(() => null), // placeholder
        adminRequest('/products?limit=100'),
        adminRequest('/real-estates?limit=100'),
        adminRequest('/jobs?limit=100'),
        adminRequest('/forum/posts?limit=100'),
      ]);

      setAllProducts(productsData?.data || []);
      setAllRealEstates(realEstatesData?.data || []);
      setAllJobs(jobsData?.data || []);
      setAllPosts(postsData?.data || []);

      setOverview({
        totalProducts: productsData?.total || 0,
        totalRealEstates: realEstatesData?.total || 0,
        totalJobs: jobsData?.total || 0,
        totalPosts: postsData?.total || 0,
      });
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm('Xóa sản phẩm này?')) return;
    await adminRequest(`/products/${id}`, { method: 'DELETE' });
    setAllProducts(prev => prev.filter(p => p.id !== id));
  }

  async function handleDeleteRealEstate(id: string) {
    if (!confirm('Xóa tin BĐS này?')) return;
    await adminRequest(`/real-estates/${id}`, { method: 'DELETE' });
    setAllRealEstates(prev => prev.filter(p => p.id !== id));
  }

  async function handleDeleteJob(id: string) {
    if (!confirm('Xóa tin tuyển dụng này?')) return;
    await adminRequest(`/jobs/${id}`, { method: 'DELETE' });
    setAllJobs(prev => prev.filter(p => p.id !== id));
  }

  async function handleDeletePost(id: string) {
    if (!confirm('Xóa bài viết này?')) return;
    await adminRequest(`/forum/posts/${id}`, { method: 'DELETE' });
    setAllPosts(prev => prev.filter(p => p.id !== id));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: 'ri-dashboard-line' },
    { id: 'products', label: 'Sản phẩm', icon: 'ri-plant-line', count: overview?.totalProducts },
    { id: 'real-estates', label: 'Bất động sản', icon: 'ri-home-4-line', count: overview?.totalRealEstates },
    { id: 'jobs', label: 'Tuyển dụng', icon: 'ri-briefcase-line', count: overview?.totalJobs },
    { id: 'forum', label: 'Diễn đàn', icon: 'ri-chat-3-line', count: overview?.totalPosts },
  ];

  const quickLinks = [
    { href: '/admin/moderation', label: 'Kiểm duyệt bài viết', icon: 'ri-shield-check-line', color: 'text-orange-600' },
    { href: '/admin/vip', label: 'Quản lý VIP', icon: 'ri-vip-crown-fill', color: 'text-yellow-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              A
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-500">Xin chào, {user?.fullName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
              Dashboard cá nhân
            </Link>
            <button
              onClick={() => { auth.logout(); router.push('/'); }}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm"
            >
              Đăng xuất
            </button>
          </div>
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
                    activeTab === tab.id ? 'bg-red-50 text-red-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <i className={`${tab.icon} text-lg`}></i>
                  <span className="text-sm flex-1">{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">{tab.count}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-white rounded-xl shadow-sm p-2 mt-2">
            {quickLinks.map(link => (
              <Link key={link.href} href={link.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                <i className={`${link.icon} text-lg ${link.color}`}></i>
                <span className="text-sm text-gray-700">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1">

            {/* OVERVIEW */}
            {activeTab === 'overview' && overview && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Tổng quan hệ thống</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Sản phẩm', value: overview.totalProducts, icon: 'ri-plant-line', color: 'bg-green-100 text-green-600' },
                    { label: 'Bất động sản', value: overview.totalRealEstates, icon: 'ri-home-4-line', color: 'bg-blue-100 text-blue-600' },
                    { label: 'Tuyển dụng', value: overview.totalJobs, icon: 'ri-briefcase-line', color: 'bg-indigo-100 text-indigo-600' },
                    { label: 'Bài diễn đàn', value: overview.totalPosts, icon: 'ri-chat-3-line', color: 'bg-purple-100 text-purple-600' },
                  ].map((item, i) => (
                    <div key={i} className="bg-white rounded-xl p-5 shadow-sm">
                      <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center mb-3`}>
                        <i className={`${item.icon} text-lg`}></i>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">{item.value}</p>
                      <p className="text-sm text-gray-500 mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>

                {/* Recent Products */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Sản phẩm mới nhất</h3>
                  <div className="space-y-3">
                    {allProducts.slice(0, 5).map(p => (
                      <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{p.title}</p>
                          <p className="text-xs text-gray-500">{p.user?.fullName} · {p.location}</p>
                        </div>
                        <span className="text-green-600 font-semibold text-sm">{Number(p.price).toLocaleString()}đ</span>
                      </div>
                    ))}
                    {allProducts.length === 0 && <p className="text-gray-400 text-sm">Chưa có sản phẩm nào</p>}
                  </div>
                </div>
              </div>
            )}

            {/* PRODUCTS */}
            {activeTab === 'products' && (
              <AdminList
                title="Quản lý Sản phẩm"
                items={allProducts}
                onDelete={handleDeleteProduct}
                renderItem={(p) => (
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{p.title}</p>
                    <p className="text-sm text-gray-500">{p.user?.fullName} · {p.location} · {p.category}</p>
                    <p className="text-green-600 font-semibold text-sm">{Number(p.price).toLocaleString()}đ/{p.unit}</p>
                  </div>
                )}
                renderMeta={(p) => (
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {p.status === 'ACTIVE' ? 'Đang hiển thị' : p.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{p.viewCount} lượt xem</p>
                  </div>
                )}
              />
            )}

            {/* REAL ESTATES */}
            {activeTab === 'real-estates' && (
              <AdminList
                title="Quản lý Bất động sản"
                items={allRealEstates}
                onDelete={handleDeleteRealEstate}
                renderItem={(p) => (
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{p.title}</p>
                    <p className="text-sm text-gray-500">{p.user?.fullName} · {p.address}</p>
                    <p className="text-blue-600 font-semibold text-sm">{Number(p.price).toLocaleString()}đ · {p.area}m²</p>
                  </div>
                )}
                renderMeta={(p) => (
                  <div className="text-right">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">{p.type}</span>
                    <p className="text-xs text-gray-400 mt-1">{p.viewCount} lượt xem</p>
                  </div>
                )}
              />
            )}

            {/* JOBS */}
            {activeTab === 'jobs' && (
              <AdminList
                title="Quản lý Tuyển dụng"
                items={allJobs}
                onDelete={handleDeleteJob}
                renderItem={(p) => (
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{p.title}</p>
                      {p.isUrgent && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Khẩn cấp</span>}
                    </div>
                    <p className="text-sm text-gray-500">{p.user?.fullName} · {p.location}</p>
                    {p.salary && <p className="text-indigo-600 font-semibold text-sm">{p.salary}</p>}
                  </div>
                )}
                renderMeta={(p) => (
                  <div className="text-right">
                    <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                      {p.type === 'EMPLOYER' ? 'Tuyển dụng' : 'Tìm việc'}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{p.viewCount} lượt xem</p>
                  </div>
                )}
              />
            )}

            {/* FORUM */}
            {activeTab === 'forum' && (
              <AdminList
                title="Quản lý Diễn đàn"
                items={allPosts}
                onDelete={handleDeletePost}
                renderItem={(p) => (
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{p.title}</p>
                    <p className="text-sm text-gray-500">
                      {p.isAnonymous ? 'Ẩn danh' : p.user?.fullName} · {p.category}
                    </p>
                  </div>
                )}
                renderMeta={(p) => (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{p.likeCount} ❤️ · {p.viewCount} 👁️</p>
                    <p className="text-xs text-gray-400 mt-1">{p._count?.comments || 0} bình luận</p>
                  </div>
                )}
              />
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

function AdminList({ title, items, onDelete, renderItem, renderMeta }: {
  title: string;
  items: any[];
  onDelete: (id: string) => void;
  renderItem: (item: any) => React.ReactNode;
  renderMeta: (item: any) => React.ReactNode;
}) {
  const [search, setSearch] = useState('');
  const filtered = items.filter(item =>
    item.title?.toLowerCase().includes(search.toLowerCase()) ||
    item.user?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">{title} ({items.length})</h2>
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent w-48"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <p className="text-gray-400">Không có dữ liệu</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
              <div className="flex-1 flex items-center gap-4">
                {renderItem(item)}
                {renderMeta(item)}
              </div>
              <button
                onClick={() => onDelete(item.id)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                title="Xóa"
              >
                <i className="ri-delete-bin-line text-lg"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
