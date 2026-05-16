# Session: doanchatbiloi — Chợ Nhân Cơ (Web Group)

> Tóm tắt toàn bộ đoạn chat session "Continue frontend project implementation"  
> Ngày: 2026-05-16

---

## Tổng quan

Phiên làm việc tập trung redesign frontend **chonhanco.com** theo phong cách **Chợ Tốt**, đồng thời bổ sung nhiều tính năng mới (comment, like, thông báo real-time).

---

## 1. Redesign giao diện theo Chợ Tốt

### Banner & Search
- **Banner** cao hơn, có icon decorations (nhà/lá/túi/gấu...) rải rác 2 bên (ẩn dần trên mobile)
- **Search bar** nằm TRONG banner ở phía dưới (không floating ra ngoài)
- **Lịch sử tìm kiếm** chuyển từ chips hiển thị sẵn → **dropdown** xuất hiện khi click vào ô search
- Fix bug: dropdown bị cắt do `overflow-hidden` trên banner → đã xóa

### Categories
- Bỏ ảnh Unsplash → dùng **icon Remix** trong vòng tròn màu sắc theo danh mục
- Layout: `grid-cols-10` desktop / `grid-cols-5` mobile — dàn đều, không scroll ngang

### ListingCard
- Thêm **nút tim** overlay góc trên phải ảnh
- Badge VIP chuyển xuống góc dưới trái

### Header
**Layout mới** (trái → phải):
```
☰ | 🏪 chợNC | Dành cho người bán ▼  ←[flex-1]→  Chợ NC | Sản phẩm | BĐS | Việc làm  ←[flex-1]→  ❤️ 🔔 Liên hệ | Quản lý tin | Đăng tin | 👤
```
- "Dành cho người bán" sang **trái** (cạnh logo)
- Nav links ra **giữa**
- Actions (tim, chuông, ...) ở **phải**

---

## 2. Tính năng Like (Tim)

### Giai đoạn 1 — localStorage
- Bấm tim → toggle đỏ/xám, lưu `localStorage`
- Dashboard tab Tương tác → section "Sản phẩm đã thích" hiện grid các bài đã like
- Đồng bộ 2 chiều: trang chủ ↔ trang chi tiết

### Giai đoạn 2 — Server-side (có thông báo)
- Thêm model `ItemLike` vào Prisma schema
- API: `POST /item-comments/like/:targetType/:targetId` (toggle, tạo notification cho chủ bài)
- `LikeButton` component: gọi API khi đã đăng nhập, dùng localStorage khi chưa login
- **Fix bug**: app lưu token là `accessToken` nhưng header đọc `token` → luôn null → redirect sai

---

## 3. Tính năng Comment

### Backend (NestJS + Prisma)
Thêm model `ItemComment` generic:
```prisma
model ItemComment {
  id         String   @id @default(cuid())
  content    String
  targetType String   // PRODUCT, REAL_ESTATE, JOB
  targetId   String
  userId     String
  parentId   String?  // hỗ trợ nested reply
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```
API:
- `GET /item-comments?targetType=...&targetId=...`
- `POST /item-comments` (yêu cầu login)
- `DELETE /item-comments/:id` (chỉ xóa comment của mình)

### Frontend
- Component `CommentSection` — Facebook-style:
  - Nested replies (1 cấp)
  - Xóa comment của mình
  - Auto-resize textarea
  - Hiển thị avatar + tên + time ago
- Thêm vào trang chi tiết: **Sản phẩm**, **BĐS**, **Việc làm**
- **Fix build error**: `</div>` thừa gây "Parsing ecmascript source code failed" → wrap Fragment `<>...</>`

### Like comment
- Thêm nút like trên từng comment trong `CommentSection`

---

## 4. Hệ thống Thông báo

### Backend
- Thêm `GET /notifications/unread-count` → `{ count: N }`
- `ItemCommentsService` tạo notification khi:
  - Ai đó comment bài của bạn
  - Ai đó reply comment của bạn
  - Ai đó like bài của bạn

### Frontend — Header
- Poll `unread-count` mỗi **30 giây**
- Badge đỏ trên icon chuông: hiện số, `99+` nếu quá 99
- Badge reset về 0 khi bấm vào chuông

### Dropdown mini (giống Chợ Tốt)

**❤️ Tim** — "Tin đăng đã lưu":
- Hiện danh sách sản phẩm đã like (từ localStorage)
- "Xem tất cả" → dashboard tab Tương tác

**🔔 Chuông** — "Thông Báo" (redesign to, đẹp):
- Fetch 10 thông báo mới nhất
- Chưa đọc → nền vàng nhạt + chấm đỏ
- Có tabs (Tất cả / Chưa đọc)
- "Xem tất cả" → dashboard tab Thông báo

---

## 5. Bug đã fix trong session

| Bug | Nguyên nhân | Fix |
|-----|-------------|-----|
| Build lỗi "Event handlers cannot be passed to Client Component" | Nút tim có `onClick` trong Server Component | Chuyển thành `<span>`, tách `LikeButton` client component |
| Click tim navigate sang trang chi tiết | Bubble lên `<Link>` | Dùng `e.stopPropagation()` |
| Dropdown lịch sử tìm kiếm bị cắt | `overflow-hidden` trên banner | Xóa `overflow-hidden` |
| Bấm chuông redirect sang admin dashboard | Đọc sai key `token` thay vì `accessToken` | Fix key localStorage |
| Build lỗi "Parsing ecmascript source code failed" | `</div>` thừa / 2 root elements | Wrap Fragment `<>...</>`, xóa tag thừa |

---

## 6. Cấu trúc deploy

- **Frontend** (Vercel): push git → auto deploy ~1-2 phút
- **Backend** (Railway): push git → auto build ~2-3 phút
- Backend URL: `https://cho-nhan-co-backend-production.up.railway.app/api`
- Frontend URL: `https://www.chonhanco.com`

---

## 7. File quan trọng đã sửa

| File | Thay đổi |
|------|----------|
| `app/components/Header.tsx` | Layout mới, 2 dropdown (tim/chuông), poll unread, fix token key |
| `app/page.tsx` | Import LikeButton, categories grid |
| `app/HomepageClient.tsx` | Search history → dropdown thay vì chips |
| `app/components/LikeButton.tsx` | Client component, toggle like, gọi API |
| `app/components/CommentSection.tsx` | Component mới, nested comments, like comment |
| `app/products/[id]/ProductDetail.tsx` | Thêm LikeButton, section "Tin tương tự", CommentSection |
| `app/real-estate/[id]/RealEstateDetail.tsx` | Thêm CommentSection |
| `app/jobs/[id]/JobDetail.tsx` | Thêm CommentSection |
| `lib/api.ts` | Thêm `itemComments` namespace (getAll, create, delete, toggleLike) |
| `backend/prisma/schema.prisma` | Thêm `ItemComment`, `ItemLike` model |
| `backend/src/modules/item-comments/` | Module mới (controller, service, module) |
| `backend/src/modules/notifications/` | Thêm endpoint `unread-count`, auto-create notification |
