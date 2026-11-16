# UX and frontend audit, 2026-11-16

Scope: all 44 routes, the shared components, the list/detail/form flows. Checked by reading the code and
by running the app locally (desktop and 375px phone) against sample data, because the live database is empty.
Nothing here assumes a business requirement that is not already in the code or the API.

## Critical (blocks or misleads people)

| # | Issue | Status |
| --- | --- | --- |
| C1 | A failed list request showed "Chưa có sản phẩm" (and "0 tin"), so a network error looked like an empty market. | Fixed: error state with retry, header count says it could not load. |
| C2 | Shared link previews had no image: layout pointed at `/og-image.png`, which does not exist. Zalo and Facebook shares were blank. | Fixed: generated share image with the brand mark and Vietnamese text. |
| C3 | Stored XSS in the admin activity feed and in the JSON-LD of three detail pages. | Fixed earlier (ca9bc42f). |
| C4 | Three different VIP price lists (pricing page, wallet, `products/vip`). | Open: needs a decision from the owner. |
| C5 | Public profile showed the user's email. | Fixed in the UI. Backend still returns it. |

## High (hurts discovery and trust)

| # | Issue | Status |
| --- | --- | --- |
| H1 | Product price showed no unit (`42.000đ`, not `42.000đ/kg`). | Fixed on every card. |
| H2 | Cards hid what a buyer needs: stock, sold-out state, seller name. | Fixed: stock only when the seller gave a real figure, "Hết hàng" tag, seller line. |
| H3 | The API supports a price range for products but the page had no price filter. | Fixed on products, livestock, services. Real estate has no such API support, so none was added. |
| H4 | Brand had no recognisable mark: plain "Cơ" square, plain "C" favicon. | Fixed: awning mark, awning strip in header and footer, favicon, share image. |
| H5 | Phone toolbar wrapped ("Lọc theo giá", "Vị trí của tôi" over two lines). | Fixed with short labels. |
| H6 | Two search boxes on phone list pages (header and page). | Open: header search routes by keyword guess, page search filters the list. Needs a decision on which one stays. |
| H7 | Header search sends "cà phê" to the category, not to a keyword search, so results may not match what was typed. | Open: change `smartSearch` or drop it. |

## Frontend technical debt

- Removed 7 unused files: duplicate `ReviewSection`, `StarRating`, `ShareButton`, plus `CategorySidebar`, `NearbyToggle`, `EmptyState`.
- Two component folders (`components/` and `app/components/`). `components/` still holds `CommentSection`, `ReviewSection`, `StarRating`, `ShareButton`; moving them is mechanical but touches the detail pages.
- 50 of 85 files are client components. Lists, forms and dashboards need it; detail pages receive server data already, only their interactive parts need to be client.
- 29 `<img>` tags have no `loading` attribute (admin, galleries, avatars). List cards now use `loading="lazy"` and `decoding="async"`.
- 4 images without `alt` (admin x3, review section).
- Old type errors remain: `next.config.ts` (`eslint` key) and `advertisements/page.tsx` before this pass.
- `tsconfig.tsbuildinfo` and `.env.local` are tracked in git; `.env.local` still points at the dead Railway API.

## Nice to have

- Move filters into a bottom sheet on phones.
- Save recent searches on the device.
- Seller response time or "đã bán" counts, only if the API starts returning them.
- A "seller's other listings" row on detail pages.

## Not changed on purpose

- Business logic, API calls, routes, admin tools.
- No product, seller or price data was invented. Cards show only what the API returned.
