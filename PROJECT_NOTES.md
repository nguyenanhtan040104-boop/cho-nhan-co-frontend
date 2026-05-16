# Chợ Nhân Cơ — Project Notes

> Tài liệu kỹ thuật cho AI assistant đọc lại khi context bị reset.  
> Cập nhật: 2026-05-16

---

## 1. Tổng quan dự án

- **Site:** https://www.chonhanco.com (production, Vercel)
- **Repo frontend:** `C:\Users\TAN\Documents\prj\frontend-updated\frontend`
- **Repo backend:** `C:\Users\TAN\Documents\prj\cho-nhan-co-backend`
- **Stack:** Next.js 14 App Router · Tailwind CSS · TypeScript · NestJS + Prisma (backend)
- **Font:** `Be Vietnam Pro` (subsets: latin, vietnamese; weights: 400/500/600/700/800)
- **Icon lib:** Remix Icon (`ri-*`) via CDN
- **Backend URL:** `https://cho-nhan-co-backend-production.up.railway.app/api`

---

## 2. Cấu trúc thư mục frontend

```
app/
  layout.tsx              — Root layout, font, metadata, <Header />
  page.tsx                — Trang chủ (SSR, fetch data)
  HomepageClient.tsx      — Search bar + lịch sử tìm kiếm (client component)
  components/
    Header.tsx            — Header sticky (hamburger, logo, nav, seller menu, icons, đăng tin)
  dashboard/page.tsx      — Dashboard cá nhân (nhiều tab)
  messages/page.tsx       — Inbox nhắn tin (list conversations)
  messages/[id]/page.tsx  — Chi tiết cuộc trò chuyện (Socket.IO)
  products/               — Trang danh sách + chi tiết sản phẩm
  real-estate/            — Bất động sản
  jobs/                   — Việc làm
  forum/                  — Diễn đàn
  canh-bao/               — Cảnh báo lừa đảo
  advertisements/         — Quảng cáo
  market-prices/          — Bảng giá thị trường
  wallet/page.tsx         — Ví điện tử + nạp tiền PayOS
  products/vip/page.tsx   — Thanh toán VIP PayOS
  pricing/                — Bảng giá gói VIP
  profile/                — Đăng nhập / đăng ký
lib/
  api.ts                  — Tất cả API calls (auth, products, wallet, messages, notifications...)
```

---

## 3. Header (`app/components/Header.tsx`)

### Cấu trúc từ trái → phải:
```
☰ Hamburger | 🏪 chợNC (logo) | Nav links | Dành cho người bán ▼ | [flex-1 spacer] | ❤️ | 🔔 | Liên hệ | Quản lý tin | [Đăng tin] | 👤
```

### Chi tiết từng phần:
- **Hamburger** → dropdown danh mục (tất cả categories)
- **Logo** `chợNC` → link về `/`
- **Nav links** (desktop lg+): `Chợ NC | Sản phẩm | Bất động sản | Việc làm` — active state highlight
- **Dành cho người bán** dropdown:
  - Quản lý tin → `/dashboard`
  - Gói VIP → `/pricing`
  - Đăng quảng cáo → `/advertisements/create`
- **❤️ (tim)** → `navDashboard('liked')` → dashboard tab Tương tác
- **🔔 (chuông)** → `navDashboard('notifications')` → dashboard tab Thông báo
- **Liên hệ** → `/messages`
- **Quản lý tin** → `navDashboard('products')` → dashboard tab Sản phẩm
- **Đăng tin** (button đen) → dropdown chọn loại (sản phẩm/BĐS/việc làm/QC/diễn đàn), yêu cầu đăng nhập
- **👤 Avatar** → `/dashboard`

### Bug fix quan trọng — Tab switching khi đang ở dashboard:
- Khi đang ở `/dashboard`, click tim/chuông/quản lý tin **KHÔNG navigate** (same URL)
- Fix: dùng `navDashboard(tab)`:
  ```ts
  function navDashboard(tab: string) {
    if (pathname === '/dashboard') {
      window.dispatchEvent(new CustomEvent('dashboard-switch-tab', { detail: tab }));
      router.replace(`/dashboard?tab=${tab}`);
    } else {
      router.push(`/dashboard?tab=${tab}`);
    }
  }
  ```
- Dashboard lắng nghe event `dashboard-switch-tab` để switch tab ngay lập tức

### Không có search bar trong header — chỉ có ở banner trang chủ

---

## 4. Trang chủ (`app/page.tsx` + `app/HomepageClient.tsx`)

### Layout tổng thể:
```
[Header]
[Banner vàng #ffd400] — text slogan + search bar floating
[Search history chips] — dưới search bar, trên nền xám
[Categories scroll] — ảnh Unsplash
[VIP tin nổi bật] — grid 2-6 col
[Sản phẩm mới] — grid 2-6 col
[BĐS + Tuyển dụng] — 2 col
[Diễn đàn] — list
[Footer]
```

### Banner (ĐÚNG CÁCH — đã xác nhận đẹp):
```tsx
<div className="relative" style={{ background: '#ffd400', paddingTop: 36, paddingBottom: 40 }}>
  <div className="text-center px-4">
    <h1>Giá tốt, gần nhà, chốt nhanh!</h1>
    <p>subtitle</p>
  </div>
  {/* Search bar floating — nửa vàng nửa xám */}
  <div className="absolute bottom-0 translate-y-1/2 left-0 right-0 px-4 z-10">
    <div className="max-w-2xl mx-auto">
      <HomepageClient />
    </div>
  </div>
</div>
<div style={{ height: 42 }} /> {/* spacer cho search bar đè xuống */}
```

> ⚠️ KHÔNG dùng `overflow-hidden` trên banner — sẽ clip search bar  
> ⚠️ KHÔNG nhét search bar hoàn toàn trong banner — trông xấu  
> ✅ Đúng: search bar `translate-y-1/2` nằm ở ranh giới vàng/xám

### HomepageClient — Smart Search:
```ts
const SEARCH_ROUTES = [
  { keywords: ['bất động sản', 'bds', 'nhà đất', 'phòng trọ', ...], route: '/real-estate' },
  { keywords: ['việc làm', 'tuyển dụng', ...], route: '/jobs' },
  { keywords: ['nông sản', 'rau củ', ...], route: '/products?category=NONG_SAN' },
  { keywords: ['vật nuôi', 'chó', 'mèo', ...], route: '/products?category=VAT_NUOI' },
  ...
]
function smartSearch(q: string) {
  const lower = q.toLowerCase().trim().normalize('NFC'); // normalize cho tiếng Việt
  for (const { keywords, route } of SEARCH_ROUTES) {
    if (keywords.some(k => lower.includes(k.normalize('NFC')))) return route + '?search=...';
  }
  return `/products?search=${encodeURIComponent(q)}`;
}
```

### Search History Chips:
- Lưu trong `localStorage` key `search_history`, tối đa 8 items
- Hiện dưới search bar dạng **chips** (không phải dropdown)
- Mỗi chip: icon clock + text + nút × xóa từng cái
- "Xóa lịch sử" xóa tất cả

### Sections:
- Background: `bg-gray-100` (toàn trang)
- Mỗi section: `bg-white`, `mt-2`, KHÔNG rounded corners
- Grid cards: `gap-[1px] bg-gray-100` → tạo đường kẻ tự nhiên giữa cards
- ListingCard: ảnh `4/3` ratio, badge thời gian, badge số ảnh, badge VIP, giá đỏ `#d0011b`

---

## 5. Dashboard (`app/dashboard/page.tsx`)

### Tab routing qua URL:
```ts
const TAB_MAP = {
  saved: 'engagement',
  liked: 'engagement',
  notifications: 'notifications',
  products: 'products',
  'real-estate': 'real-estate',
  jobs: 'jobs',
  wallet: 'wallet',
  engagement: 'engagement',
};
```

### Các tab có:
- `overview` — Tổng quan
- `analytics` — Hiệu suất
- `engagement` — Tương tác (Facebook-style feed: ai thích/bình luận bài)
- `products` — Quản lý sản phẩm
- `real-estate` — Quản lý BĐS
- `jobs` — Quản lý việc làm
- `notifications` — Thông báo
- `security` — Bảo mật
- `settings` — Cài đặt

### Tab Tương tác (EngagementTab):
- Fetch song song: `analytics.getEngagement()` + `notifications.getAll()`
- Hiện feed kiểu Facebook: avatar + tên + nội dung thông báo + time ago
- Badge icon: ❤️ red (like), 💬 blue (comment), 🔔 yellow (khác)
- Chấm vàng = chưa đọc

### Lắng nghe custom event:
```ts
useEffect(() => {
  function onSwitchTab(e: Event) {
    const tab = (e as CustomEvent).detail;
    if (tab && TAB_MAP[tab]) setActiveTab(TAB_MAP[tab]);
  }
  window.addEventListener('dashboard-switch-tab', onSwitchTab);
  return () => window.removeEventListener('dashboard-switch-tab', onSwitchTab);
}, []);
```

---

## 6. Messages (`app/messages/page.tsx`)

### Chợ Tốt style inbox:
- **Left panel** (w-80): search + filter tabs (Tất cả / Chưa đọc / Tin rác) + conversation list
- **Right panel** (desktop): empty state "Tích cực chat, chốc lát chốt đơn!"
- Click conversation → navigate `/messages/[id]` (có full Socket.IO chat)
- Màu avatar: random từ `['bg-yellow-400', 'bg-blue-400', 'bg-green-400', 'bg-pink-400', 'bg-purple-400']`
- Unread badge: vàng tròn

---

## 7. Wallet & VIP Payment

### Wallet top-up:
- Tạo QR → **auto open PayOS** `window.open(res.checkoutUrl, '_blank')`
- Modal hiện QR + countdown 5 phút + poll status mỗi 3s
- Không cần bấm thêm nút "Mở trang thanh toán"

### VIP Payment flow:
- Endpoint: `POST /wallet/create-vip-payment`
- Endpoint: `GET /wallet/vip-payment-status/:orderCode`
- Webhook handler: type `vip_payment` → activate VIP on success
- UI: `/products/vip/page.tsx` — modal QR + countdown + auto redirect dashboard

---

## 8. API lib (`lib/api.ts`)

### Các namespace chính:
```ts
auth          — isLoggedIn(), getUser(), login(), register(), logout()
products      — getAll(), getOne(), create(), update(), delete(), like()
realEstate    — getAll(), getOne(), create()...
jobs          — getAll(), getOne(), create()...
forum         — getPosts(), getPost(), createPost(), likePost(), addComment()...
messages      — getConversations(), getOrCreate(), getMessages(), archive()...
notifications — getAll(), markRead(), markAllRead()
wallet        — getBalance(), topUp(), createVipPayment(), checkVipPaymentStatus()...
analytics     — getEngagement(), getSummary()...
```

---

## 9. Những điều KHÔNG làm (đã thử và xấu)

| Việc | Lý do xấu |
|------|-----------|
| Emoji decorations trên banner | Render thành outline đen trắng, trông như sticker dán |
| `overflow-hidden` trên banner | Clip mất search bar |
| Search bar hoàn toàn trong banner (không floating) | Banner trông cao và nặng nề |
| Rounded corners (`rounded-xl`) trên section cards | Trông rời rạc, không compact |
| Shadow (`shadow-sm`) trên section cards | Nhìn "AI-generated", không natural |
| Search bar dropdown (thay vì chips) | Che khuất content, UX kém hơn |
| 2 search bar (header + banner) | Thừa, user phàn nàn |

---

## 10. Design tokens

| Token | Giá trị |
|-------|---------|
| Primary yellow | `#ffd400` |
| Price red | `#d0011b` |
| Background | `#f4f4f4` (gray-100) |
| Section bg | `#ffffff` |
| Section gap | `gap-[1px] bg-gray-100` |
| Section spacing | `mt-2` |
| Card image ratio | `4/3` |
| Header height | `h-14` (56px) |
| Search bar height | `52px` |
| Font | Be Vietnam Pro |

---

## 11. Lệnh git thường dùng

```bash
cd "C:\Users\TAN\Documents\prj\frontend-updated\frontend"
git add <files>
git commit -m "message"
git push
# → Vercel auto deploy sau ~1-2 phút
```

---

## 12. Lưu ý khi làm việc với AI assistant

- **Đọc file trước khi Edit** — tool Edit yêu cầu đã Read file
- **Không dùng `overflow-hidden` trên banner** bao giờ
- **Search bar banner = floating `translate-y-1/2`** — đây là style đúng
- **Smart search cần `.normalize('NFC')`** cho tiếng Việt
- **Dashboard tab switch** cần cả `router.replace` + `CustomEvent` khi đang ở dashboard
- **Vercel deploy** tự động khi push lên `main` branch
- Backend trên Railway — không tự ý thay đổi nếu không có yêu cầu rõ ràng
