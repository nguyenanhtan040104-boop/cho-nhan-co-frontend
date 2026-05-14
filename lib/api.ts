// lib/api.ts - Tất cả API calls

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// =================== HELPERS ===================

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    // Token hết hạn - thử refresh
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      // Thử lại request
      headers['Authorization'] = `Bearer ${getToken()}`;
      const retryRes = await fetch(`${API_URL}${path}`, { ...options, headers });
      if (!retryRes.ok) throw await retryRes.json();
      return retryRes.json();
    } else {
      // Không refresh được - logout
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/profile';
      throw new Error('Phiên đăng nhập hết hạn');
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Lỗi server' }));
    throw err;
  }

  return res.json();
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

// =================== AUTH ===================

export const auth = {
  async register(data: {
    email?: string;
    phone?: string;
    username: string;
    password: string;
    fullName: string;
    address?: string;
  }) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async login(identifier: string, password: string) {
    const data = await request<{ accessToken: string; refreshToken: string }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ identifier, password }) }
    );
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data;
  },

  async sendOtp(target: string, type: string) {
    return request('/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ target, type }),
    });
  },

  async verifyOtp(target: string, code: string, type: string) {
    const data = await request<{ accessToken?: string; refreshToken?: string }>(
      '/auth/otp/verify',
      { method: 'POST', body: JSON.stringify({ target, code, type }) }
    );
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken!);
    }
    return data;
  },

  async forgotPassword(target: string) {
    return request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ target }),
    });
  },

  async resetPassword(target: string, code: string, newPassword: string) {
    return request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ target, code, newPassword }),
    });
  },

  async changePassword(currentPassword: string, newPassword: string) {
    return request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  isLoggedIn(): boolean {
    return !!getToken();
  },

  getCurrentUserId(): string | null {
    const token = getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload.sub || payload.userId || payload.id || null;
    } catch { return null; }
  },
};

// =================== USERS ===================

export const users = {
  async getMe() {
    return request<any>('/users/me');
  },

  async updateProfile(data: { fullName?: string; address?: string; phone?: string; avatarUrl?: string }) {
    return request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getProfile(userId: string) {
    return request<any>(`/users/${userId}`);
  },

  async getUserProducts(userId: string, page = 1) {
    return request<any>(`/users/${userId}/products?page=${page}`);
  },
};

// =================== PRODUCTS ===================

export const products = {
  async getAll(params?: {
    search?: string;
    category?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
  }) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.append(k, String(v));
      });
    }
    return request<any>(`/products?${query}`);
  },

  async getOne(id: string) {
    return request<any>(`/products/${id}`);
  },

  async create(data: {
    title: string;
    description: string;
    category: string;
    price: number;
    unit: string;
    quantity?: number;
    location: string;
    contactPhone?: string;
    images?: string[];
  }) {
    return request('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: any) {
    return request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string) {
    return request(`/products/${id}`, { method: 'DELETE' });
  },

  async getMine(page = 1, limit = 20) {
    return request<any>(`/products/me/list?page=${page}&limit=${limit}`);
  },

  async updateStatus(id: string, status: string) {
    return request(`/products/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
  },

  async updateQuantity(id: string, quantity: number) {
    return request(`/products/${id}/quantity`, { method: 'PUT', body: JSON.stringify({ quantity }) });
  },

  async restore(id: string) {
    return request(`/products/${id}/restore`, { method: 'POST' });
  },

  async bulkDelete(ids: string[]) {
    return request('/products/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) });
  },

  async upgradeVip(id: string, durationDays = 30) {
    return request(`/products/${id}/vip`, { method: 'POST', body: JSON.stringify({ durationDays }) });
  },

  async adminToggleVip(id: string, isVip: boolean) {
    return request(`/products/${id}/vip`, { method: 'POST', body: JSON.stringify({ durationDays: isVip ? 30 : 0 }) });
  },
};

// =================== REAL ESTATE ===================

export const realEstate = {
  async getAll(params?: any) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.append(k, String(v));
      });
    }
    return request<any>(`/real-estates?${query}`);
  },

  async getOne(id: string) {
    return request<any>(`/real-estates/${id}`);
  },

  async create(data: any) {
    return request('/real-estates', { method: 'POST', body: JSON.stringify(data) });
  },

  async update(id: string, data: any) {
    return request(`/real-estates/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  async delete(id: string) {
    return request(`/real-estates/${id}`, { method: 'DELETE' });
  },

  async getMine(page = 1) {
    return request<any>(`/real-estates/mine?page=${page}`);
  },

  async updateStatus(id: string, status: string) {
    return request(`/real-estates/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
  },

  async addImages(id: string, images: { url: string; caption?: string }[]) {
    return request(`/real-estates/${id}/images`, { method: 'POST', body: JSON.stringify({ images }) });
  },

  async adminToggleVip(id: string, isVip: boolean) {
    return request(`/real-estate/${id}/vip`, { method: 'PATCH', body: JSON.stringify({ isVip }) });
  },
};

// =================== JOBS ===================

export const jobs = {
  async getAll(params?: any) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.append(k, String(v));
      });
    }
    return request<any>(`/jobs?${query}`);
  },

  async getOne(id: string) {
    return request<any>(`/jobs/${id}`);
  },

  async create(data: any) {
    return request('/jobs', { method: 'POST', body: JSON.stringify(data) });
  },

  async update(id: string, data: any) {
    return request(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  async delete(id: string) {
    return request(`/jobs/${id}`, { method: 'DELETE' });
  },

  async getMine(page = 1) {
    return request<any>(`/jobs/mine?page=${page}`);
  },

  async markUrgent(id: string) {
    return request(`/jobs/${id}/urgent`, { method: 'POST' });
  },

  async adminToggleVip(id: string, isVip: boolean) {
    return request(`/jobs/${id}/vip`, { method: 'PATCH', body: JSON.stringify({ isVip }) });
  },
};

// =================== FORUM ===================

export const forum = {
  async getPosts(params?: any) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.append(k, String(v));
      });
    }
    return request<any>(`/forum/posts?${query}`);
  },

  async getPost(id: string) {
    return request<any>(`/forum/posts/${id}`);
  },

  async createPost(data: any) {
    return request('/forum/posts', { method: 'POST', body: JSON.stringify(data) });
  },

  async deletePost(id: string) {
    return request(`/forum/posts/${id}`, { method: 'DELETE' });
  },

  async addComment(postId: string, content: string, parentId?: string) {
    return request(`/forum/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parentId }),
    });
  },

  // Aliases để dùng chung
  async getAll(params?: any) {
    return forum.getPosts(params);
  },
  async getOne(id: string) {
    return forum.getPost(id);
  },
  async create(data: any) {
    return forum.createPost(data);
  },
  async likePost(id: string) {
    return request(`/forum/posts/${id}/like`, { method: 'POST' });
  },
  async isLiked(id: string) {
    return request(`/forum/posts/${id}/liked`, { method: 'GET' });
  },
  async likeComment(commentId: string) {
    return request(`/forum/comments/${commentId}/like`, { method: 'POST' });
  },
  async isCommentLiked(commentId: string) {
    return request(`/forum/comments/${commentId}/liked`, { method: 'GET' });
  },
  async addReply(postId: string, content: string, parentId: string) {
    return request(`/forum/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parentId }),
    });
  },
  async updatePost(id: string, data: any) {
    return request(`/forum/posts/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  async deleteComment(commentId: string) {
    return request(`/forum/comments/${commentId}`, { method: 'DELETE' });
  },
  async updateComment(commentId: string, content: string) {
    return request(`/forum/comments/${commentId}`, { method: 'PUT', body: JSON.stringify({ content }) });
  },
  async pinComment(commentId: string) {
    return request(`/forum/comments/${commentId}/pin`, { method: 'POST' });
  },
  async delete(id: string) {
    return request(`/forum/posts/${id}`, { method: 'DELETE' });
  },

  // Draft management
  async getMyDrafts() {
    return request<any[]>('/forum/my-drafts');
  },
  async publishDraft(id: string) {
    return request(`/forum/posts/${id}/publish`, { method: 'POST' });
  },

  // Bulk operations
  async bulkDelete(ids: string[]) {
    return request('/forum/posts/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) });
  },

  // Admin approval
  async getPendingPosts(params?: any) {
    const query = new URLSearchParams(params || {});
    return request<any>(`/forum/admin/pending?${query}`);
  },
  async approvePost(id: string) {
    return request(`/forum/admin/posts/${id}/approve`, { method: 'POST' });
  },
  async rejectPost(id: string, reason?: string) {
    return request(`/forum/admin/posts/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) });
  },
  async bulkApprove(ids: string[]) {
    return request('/forum/admin/posts/bulk-approve', { method: 'POST', body: JSON.stringify({ ids }) });
  },
  async bulkReject(ids: string[], reason?: string) {
    return request('/forum/admin/posts/bulk-reject', { method: 'POST', body: JSON.stringify({ ids, reason }) });
  },
  async hidePost(id: string) {
    return request(`/forum/admin/posts/${id}/hide`, { method: 'POST' });
  },
  async unhidePost(id: string) {
    return request(`/forum/admin/posts/${id}/unhide`, { method: 'POST' });
  },
  async adminDeletePost(id: string) {
    return request(`/forum/admin/posts/${id}`, { method: 'DELETE' });
  },
};

// =================== MESSAGES ===================

export const messages = {
  async getConversations() {
    return request<any>('/conversations');
  },

  async getOrCreate(targetUserId: string) {
    return request<any>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ targetUserId }),
    });
  },

  async getMessages(conversationId: string, page = 1) {
    return request<any>(`/conversations/${conversationId}/messages?page=${page}`);
  },

  async archive(conversationId: string) {
    return request(`/conversations/${conversationId}/archive`, { method: 'PUT' });
  },

  async mute(conversationId: string) {
    return request(`/conversations/${conversationId}/mute`, { method: 'PUT' });
  },

  async blockUser(targetUserId: string) {
    return request(`/conversations/block/${targetUserId}`, { method: 'POST' });
  },

  async unblockUser(targetUserId: string) {
    return request(`/conversations/block/${targetUserId}`, { method: 'DELETE' });
  },

  async getBlockedUsers() {
    return request<any>('/conversations/blocks/list');
  },
};

// =================== NOTIFICATIONS ===================

export const notifications = {
  async getAll(page = 1) {
    return request<any>(`/notifications?page=${page}`);
  },

  async markRead(id: string) {
    return request(`/notifications/${id}/read`, { method: 'PUT' });
  },

  async markAllRead() {
    return request('/notifications/read-all', { method: 'PUT' });
  },
};

// =================== ANALYTICS ===================

export const analytics = {
  async getOverview() {
    return request<any>('/analytics/overview');
  },
  async getProductStats() {
    return request<any>('/analytics/products');
  },
  async getRealEstateStats() {
    return request<any>('/analytics/real-estates');
  },
  async getEngagement() {
    return request<any>('/analytics/engagement');
  },
  async getRevenue() {
    return request<any>('/analytics/revenue');
  },
};

// =================== UPLOADS ===================

export const uploads = {
  async uploadImage(file: File): Promise<{ url: string; key: string }> {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_URL}/uploads/image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!res.ok) throw await res.json();
    return res.json();
  },

  async uploadImages(files: File[]): Promise<{ url: string; key: string }[]> {
    return Promise.all(files.map(f => uploads.uploadImage(f)));
  },
};

// =================== MARKET PRICES ===================

export const marketPrices = {
  async getAll(params?: any) {
    const query = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') query.append(k, String(v)); });
    return request<any>(`/market-prices?${query}`);
  },

  async getLatest(category?: string) {
    const q = category ? `?category=${category}` : '';
    return request<any>(`/market-prices/latest${q}`);
  },

  async getCategories() {
    return request<any>('/market-prices/categories');
  },

  async getPriceHistory(productName: string, location?: string, days = 30) {
    const q = new URLSearchParams({ productName, days: String(days) });
    if (location) q.append('location', location);
    return request<any>(`/market-prices/history?${q}`);
  },

  async create(data: any) {
    return request('/market-prices', { method: 'POST', body: JSON.stringify(data) });
  },

  async delete(id: string) {
    return request(`/market-prices/${id}`, { method: 'DELETE' });
  },
};

// =================== WALLET ===================
export const wallet = {
  async get() {
    return request<any>('/wallet');
  },
  async requestTopUp(amount: number, note?: string) {
    return request('/wallet/top-up', { method: 'POST', body: JSON.stringify({ amount, note }) });
  },
  async createPayment(amount: number) {
    return request('/wallet/create-payment', { method: 'POST', body: JSON.stringify({ amount }) });
  },
  async checkPaymentStatus(orderCode: string) {
    return request<any>(`/wallet/payment-status/${orderCode}`);
  },
  async buyVip(refType: 'product' | 'job' | 'real_estate', refId: string, durationDays = 30) {
    return request('/wallet/buy-vip', { method: 'POST', body: JSON.stringify({ refType, refId, durationDays }) });
  },
  async getPendingTopUps() {
    return request<any>('/wallet/admin/pending');
  },
  async getAllTransactions(params?: any) {
    const q = new URLSearchParams(params).toString();
    return request<any>(`/wallet/admin/transactions?${q}`);
  },
  async confirmTopUp(id: string, adminNote?: string) {
    return request(`/wallet/admin/confirm/${id}`, { method: 'POST', body: JSON.stringify({ adminNote }) });
  },
  async rejectTopUp(id: string, adminNote?: string) {
    return request(`/wallet/admin/reject/${id}`, { method: 'POST', body: JSON.stringify({ adminNote }) });
  },
};

// =================== ADVERTISEMENTS ===================

export const advertisements = {
  async getAll(params?: any) {
    const query = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') query.append(k, String(v)); });
    return request<any>(`/advertisements?${query}`);
  },

  async getOne(id: string) {
    return request<any>(`/advertisements/${id}`);
  },

  async getMine(page = 1) {
    return request<any>(`/advertisements/mine?page=${page}`);
  },

  async create(data: any) {
    return request('/advertisements', { method: 'POST', body: JSON.stringify(data) });
  },

  async update(id: string, data: any) {
    return request(`/advertisements/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  async delete(id: string) {
    return request(`/advertisements/${id}`, { method: 'DELETE' });
  },
};
