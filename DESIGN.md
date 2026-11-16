# Chợ Nhân Cơ: design rules

## References and what we took from them

Structure follows two files from VoltAgent/awesome-design-md (Airbnb and mydealz). Nothing is copied: the
palette, wording, icons and layout are our own. We borrowed principles only.

| From | Principle we use |
| --- | --- |
| Airbnb | White canvas. One accent colour, used sparingly. Near-black ink (never pure black). Photos carry the page, so cards have no frame. One pill search bar. Category strip with icons and an underline. One shadow tier, only for things that float. |
| mydealz | Green means "act" and "price". Prices are always bold. Weights 500 and 700 do most of the work. Hairlines and canvas gutters separate things, not boxes and shadows. |

## Direction

A village market online. White, quiet, photo-first. People look at a picture, read a price, call a neighbour.
Everything that is not a photo, a price or a way to act stays out of the way.

## Why it looked cheap before (and the rule that fixes it)

| Smell | Rule |
| --- | --- |
| Two loud colours (green band + red button) | One accent: green. Red only for errors, delete, the saved heart and unread counts. |
| Green-tinted page background | White for browse pages, `#F7F7F7` for app screens (dashboard, forms, admin). |
| A box around every card | Listing cards have no frame. Content blocks use a hairline or a soft grey fill, never both. |
| Heavy type (800, 900) | Only 400, 500, 600, 700. Prices and titles 700. |
| Cartoon illustrations, emoji, gradients, glass | None. Empty states are one icon, two lines, one action. |
| Dark hero band | The header search is the hero. The home page opens with a headline and quick chips. |

## Tokens (`tailwind.config.js`, `app/globals.css`)

**Colour**

- `ink` `#222222`, `ink-soft` `#484848` (body), `ink-faint` `#6A6A6A` (meta, 5.4:1 on white).
- `surface` white, `paper` `#F7F7F7`, `line` `#DDDDDD`.
- `forest` is the only accent: 600 for buttons, 700 for prices and links on light, 50 for selected rows.
- `brand` red: errors, destructive actions, the heart, unread counts. Never a main button.
- `gold`: "Nổi bật" and pinned only, as a quiet tint.

**Type** (Be Vietnam Pro, full Vietnamese diacritics)

- Home H1 `1.75rem` mobile, `2.5rem` desktop, 700. Section title 22px 700. Card title 15px 500. Meta 13px `ink-faint`. Price 16px 700 `forest-700`.
- Buttons 15px 500. Chips 14px 500.

**Radius and depth**

- Photos and cards 12px, sheets 16px, buttons and fields 8px, chips and search full round.
- Flat by default. `shadow-lift` (Airbnb tier) is only for the header search pill, menus and dropdowns.

## Components

- Header: logo, centred pill search with a green disc, "Đăng tin" (green), icons, avatar. Below it, category strip with icons; the active one gets a 2px ink underline.
- `ListingCard`: 4:3 photo with 12px radius, heart top-right on the photo, white pill badges ("Nổi bật", "Gấp") top-left, then title, muted meta line, bold green price.
- `.btn-primary` green, `.btn-ghost` white with an ink outline, `.chip` white with hairline, `.chip-active` ink fill.
- `.field` has a grey border, ink border on hover and focus, no glow.
- Section header: 22px title left, underlined "Xem tất cả" right. No rule under it.
- Lists: `ListPage`. Forms: `components/form/Kit`. Detail pages: `components/detail/*`.

## States

Hover changes a border or text colour, never scales. Focus uses a 2px ink outline for keyboard users.
Loading shows a skeleton shaped like the final content. Errors say what happened in words.

## Responsive

Mobile first. The bottom tab bar is the main navigation under 768px; its centre button posts a listing and is green.
Chip rows scroll sideways without a scrollbar. Grids go 2, 3, 4, 5 columns.

## Audit before merging a page

Search it for: `gradient`, `backdrop-blur`, `shadow-lg`, `rounded-2xl`, `text-gray-`, `bg-brand-` on a button,
`font-extrabold`, emoji. Each one needs a reason to stay.
