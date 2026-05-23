# Session Summary — Chợ Nhân Cơ

## Stack
- **Frontend**: Next.js 14 App Router → Vercel (auto deploy từ GitHub)
- **Backend**: NestJS + Prisma + PostgreSQL → Railway (auto deploy từ GitHub)
- **Domain**: `chonhanco.com` (mua tại Vietnix)
- **CDN/Security**: Cloudflare (free plan)
- **Storage**: Supabase (ảnh upload)
- **Email**: Resend

---

## Tài khoản quan trọng
- **Admin**: `nguyenanhtan040104@gmail.com` — role ADMIN đã set trong DB
- **User test**: `ttyloveking9@gmail.com`
- **GitHub frontend**: `nguyenanhtan040104-boop/cho-nhan-co-frontend`
- **GitHub backend**: `nguyenanhtan040104-boop/cho-nhan-co-backend`

---

## Cấu trúc URL
- **Frontend**: `chonhanco.com` → Vercel
- **Backend API**: `api.chonhanco.com/api` → Railway (qua Cloudflare proxy)
- **Railway direct**: `cho-nhan-co-backend-production.up.railway.app` (bị block bởi Cloudflare middleware)

---

## Backend Enums quan trọng
```ts
ProductCategory:  NONG_SAN | VAT_NUOI | DO_DUNG_GIA_DINH | HANG_TIEU_DUNG | DICH_VU
RealEstateType:   NHA_O | DAT_NEN | PHONG_TRO | MAT_BANG
JobType:          EMPLOYER | JOB_SEEKER
ForumCategory:    NONG_NGHIEP | CHAN_NUOI | THI_TRUONG | KINH_NGHIEM | HOI_DAP | CANH_BAO
```

---

## Các trang đã tạo/sửa trong session này

### Trang mới
| Trang | File | Mô tả |
|-------|------|--------|
| `/vat-nuoi` | `app/vat-nuoi/page.tsx` | Trang vật nuôi riêng, amber theme, filter theo loại |
| `/dich-vu` | `app/dich-vu/page.tsx` | Trang dịch vụ riêng, indigo theme, filter theo loại |

### Trang đã sửa
| Trang | Thay đổi |
|-------|----------|
| `/products` | Bỏ VAT_NUOI/DICH_VU, chỉ còn NONG_SAN/DO_DUNG/HANG_TIEU_DUNG |
| `/products/create` | Bỏ template picker, đọc `?category` từ URL, subcategory picker cho VAT_NUOI/DICH_VU |
| `/products/[id]/edit` | Fix: gửi `images[]` trong update payload (trước đó bị ignore) |
| `/dashboard` | Thêm tabs: Vật nuôi, Dịch vụ, Quảng cáo, Diễn đàn, Cảnh báo |

---

## Components đã tạo/sửa

### Mới
- `app/components/EmptyState.tsx` — Hiển thị khi không có kết quả tìm kiếm (Chợ Tốt style)

### Sửa
- `app/components/LikeButton.tsx` — Đổi vị trí về `top-1.5 right-1.5`
- `app/components/Header.tsx`:
  - Thêm Vật nuôi, Dịch vụ vào navLinks
  - Sửa subcategory links dùng đúng enum (NHA_O, DAT_NEN, EMPLOYER...)
  - Tách postItems: Đăng nông sản / Đăng vật nuôi / Đăng dịch vụ riêng
  - Mục "Nông sản & Thực phẩm" có đủ: Tất cả, Nông sản, Đồ dùng gia đình, Hàng tiêu dùng

---

## Backend đã sửa

### `products.service.ts`
- `update()`: Thêm field `images[]`, dùng `??` thay `||` (tránh mất giá trị 0/empty)
- Khi có `images` mới: xóa ảnh cũ → tạo lại từ array mới

### `forum.service.ts`
- Thêm method `getUserPosts(userId, query)` — lấy bài viết của user theo category

### `forum.controller.ts`
- Thêm endpoint `GET /forum/my-posts` (JWT guard)

### `app.module.ts`
- Đăng ký `CloudflareMiddleware` cho tất cả routes

### `common/middleware/cloudflare.middleware.ts` (MỚI)
- Chặn request không qua Cloudflare (không có `CF-Connecting-IP` header)
- Whitelist: localhost, Railway internal IPs (10.x, 172.x)
- Bỏ qua khi `NODE_ENV=development`

---

## Cloudflare Setup

### DNS Records
```
CNAME  @              cname.vercel-dns.com     Proxied ✅
CNAME  www            cname.vercel-dns.com     Proxied ✅
CNAME  api            6730f3y4.up.railway.app  Proxied ✅
TXT    _railway-...   (railway verify)         DNS only
MX     send           (resend email)           DNS only
TXT    _dmarc         (dmarc)                  DNS only
```

### Security Config
- **Bot Fight Mode**: ON
- **Rate Limiting Rule**: 200 req / 10s / IP → Block 1 hour (URI Path contains `/`)
- **Under Attack Mode**: Disabled (chỉ bật khi bị DDoS thật)
- **SSL/TLS**: Full (strict)

---

## Vấn đề đang tồn tại (cần fix)

### 🔴 QUAN TRỌNG — Login loop ở Admin dashboard
**Nguyên nhân**: `NEXT_PUBLIC_API_URL` trong Vercel chưa được redeploy sau khi đổi sang `https://api.chonhanco.com/api`

**Cách fix**:
1. Vercel → project → Settings → Environment Variables
2. Đảm bảo `NEXT_PUBLIC_API_URL = https://api.chonhanco.com/api`
3. Deployments → Redeploy deployment mới nhất

**Tại sao loop**: Frontend vẫn gọi API qua URL Railway cũ `cho-nhan-co-backend-production.up.railway.app` → bị Cloudflare middleware block 403 → logout → login → 403 → loop

### 🟡 Trang Cảnh báo lừa đảo trống
**Nguyên nhân**: Bài đăng khi tạo có `approvalStatus: PENDING`, cần admin duyệt mới hiện
**Cách fix**: Vào `chonhanco.com/admin` → Moderation → duyệt bài PENDING (sau khi fix login loop)

### 🟡 Metadata/canonical URL vẫn trỏ về Vercel subdomain
Cần redeploy Vercel để lấy domain mới `chonhanco.com`

---

## Luồng deploy
```
git push → GitHub → Vercel/Railway auto deploy (~1-2 phút)
Cloudflare không ảnh hưởng gì đến deploy pipeline
```

---

## Các file quan trọng

### Frontend
```
app/
├── page.tsx                    — Trang chủ
├── products/page.tsx           — Nông sản (có LikeButton, EmptyState)
├── vat-nuoi/page.tsx           — Vật nuôi (NEW)
├── dich-vu/page.tsx            — Dịch vụ (NEW)
├── real-estate/page.tsx        — Bất động sản
├── jobs/page.tsx               — Việc làm
├── forum/page.tsx              — Diễn đàn
├── canh-bao/page.tsx           — Cảnh báo lừa đảo
├── dashboard/page.tsx          — Dashboard người dùng (nhiều tabs)
├── products/create/page.tsx    — Đăng tin (đọc ?category từ URL)
├── products/[id]/edit/page.tsx — Sửa tin (fix images)
└── components/
    ├── Header.tsx              — Header với dropdown danh mục
    ├── LikeButton.tsx          — Nút tim (top-right ảnh)
    ├── EmptyState.tsx          — Empty state (NEW)
    └── PostOptionsMenu.tsx     — Menu 3 chấm (edit/delete)
```

### Backend
```
src/
├── app.module.ts                              — Đăng ký CloudflareMiddleware
├── common/middleware/cloudflare.middleware.ts — Bảo vệ Railway (NEW)
└── modules/
    ├── products/products.service.ts           — Fix update với images
    └── forum/
        ├── forum.service.ts                   — Thêm getUserPosts()
        └── forum.controller.ts                — Thêm GET /forum/my-posts
```

---

## Ghi chú khác
- VIP badge đã dời sang **top-center** (`left-1/2 -translate-x-1/2`) để không đè LikeButton
- `PostOptionsMenu` (menu 3 chấm) nằm ở `top-2 left-2`
- Subcategory vật nuôi/dịch vụ được lưu dạng `#Chó\n...` prefix trong description để search được
- Trang canh-bao dùng `forum` API với `category: CANH_BAO`
- Bài forum mới tạo có `approvalStatus: PENDING` → cần admin duyệt qua `/admin`
