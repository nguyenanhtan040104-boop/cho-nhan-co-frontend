// Dev-only sample data so the UI is reviewable while the backend is offline.
// Gated behind NODE_ENV !== 'production' AND only used when a fetch returns empty.
const img = (id: string) => `https://images.unsplash.com/${id}?w=600&h=450&fit=crop&q=80`;

export const mockProducts = [
  { id: 'm1', title: 'Cà phê Robusta nhân xô, phơi bãi', price: 42000, location: 'Nhân Cơ, Đắk Nông', images: [{ url: img('photo-1447933601403-0c6688de566e') }], createdAt: new Date(Date.now() - 2 * 3600e3).toISOString(), isVip: true, _type: 'product' },
  { id: 'm2', title: 'Tiêu đen loại 1, sạch, phơi khô', price: 78000, location: 'Đắk R\'lấp', images: [{ url: img('photo-1509358271058-acd22cc93898') }], createdAt: new Date(Date.now() - 5 * 3600e3).toISOString(), _type: 'product' },
  { id: 'm3', title: 'Bơ sáp 034 chính vụ, vườn nhà', price: 35000, location: 'Nhân Cơ', images: [{ url: img('photo-1523049673857-eb18f1d7b578') }], createdAt: new Date(Date.now() - 8 * 3600e3).toISOString(), _type: 'product' },
  { id: 'm4', title: 'Sầu riêng Ri6 già cây, cắt tại vườn', price: 65000, location: 'Đắk Song', images: [{ url: img('photo-1587049352846-4a222e784d38') }], createdAt: new Date(Date.now() - 26 * 3600e3).toISOString(), _type: 'product' },
  { id: 'm5', title: 'Hạt điều rang muối, đóng gói 500g', price: 120000, location: 'Gia Nghĩa', images: [{ url: img('photo-1626697556363-3c47b7d6dc8a') }], createdAt: new Date(Date.now() - 30 * 3600e3).toISOString(), _type: 'product' },
];

export const mockRealEstate = [
  { id: 'r1', title: 'Bán 2ha đất rẫy cà phê đang thu, có sổ', price: 2.8e9, address: 'Nhân Cơ, Đắk Nông', images: [{ url: img('photo-1500382017468-9049fed747ef') }], createdAt: new Date(Date.now() - 12 * 3600e3).toISOString(), isVip: true, _type: 'real-estate' },
  { id: 'r2', title: 'Nhà cấp 4 mặt tiền đường liên xã', price: 950e6, address: 'Kiến Đức', images: [{ url: img('photo-1570129477492-45c003edd2be') }], createdAt: new Date(Date.now() - 40 * 3600e3).toISOString(), _type: 'real-estate' },
];

export const mockJobs = [
  { id: 'j1', title: 'Cần thợ hái cà phê mùa vụ, bao ăn ở', salary: '350.000đ/ngày', location: 'Nhân Cơ', images: [{ url: img('photo-1625246333195-78d9c38ad449') }], createdAt: new Date(Date.now() - 3 * 3600e3).toISOString(), _type: 'job' },
  { id: 'j2', title: 'Tuyển nhân viên bán vật tư nông nghiệp', salary: '7-9 triệu', location: 'Gia Nghĩa', images: [{ url: img('photo-1560472354-b33ff0c44a43') }], createdAt: new Date(Date.now() - 20 * 3600e3).toISOString(), _type: 'job' },
];

export const mockForum = [
  { id: 'f1', title: 'Giá cà phê hôm nay lên hay xuống, bà con dự đoán sao?', user: { fullName: 'Nguyễn Văn Tâm' }, likeCount: 24, _count: { comments: 11 }, createdAt: new Date(Date.now() - 1 * 3600e3).toISOString(), images: [] },
  { id: 'f2', title: 'Kinh nghiệm chống rụng trái bơ mùa mưa', user: { fullName: 'Cô Ba Nhân Cơ' }, likeCount: 18, _count: { comments: 7 }, createdAt: new Date(Date.now() - 6 * 3600e3).toISOString(), images: [] },
  { id: 'f3', title: 'Ai có máy tuốt tiêu cho thuê không ạ?', user: { fullName: 'Trần Hùng' }, likeCount: 9, _count: { comments: 4 }, createdAt: new Date(Date.now() - 14 * 3600e3).toISOString(), images: [] },
];

export const isDev = process.env.NODE_ENV !== 'production';
