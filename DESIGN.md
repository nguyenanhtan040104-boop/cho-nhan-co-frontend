# Chợ Nhân Cơ: design rules

## What this site is

A local market for the people of Nhân Cơ, Đắk Nông: farmers, small sellers, neighbours looking for land,
work or a service. It must feel like a real, practical, trustworthy place, not a SaaS template and not a
copy of a national shop.

References read: VoltAgent/awesome-design-md (Airbnb and mydealz for structure), plus the owner's brief.
We took principles only. Palette, copy, icons and the brand mark are our own.

## Identity: the market awning

Every market stall has an awning. It is the one recognisable shape of this site.

- Logo: striped awning over "Cơ", with one red dot (a ripe coffee cherry, the crop Nhân Cơ is known for).
- A thin scalloped awning strip sits at the top of the header and the footer. It is the only decoration.
- Favicon and the link-preview image (Zalo, Facebook) use the same awning.
- Voice: plain, local, respectful. "Chợ của bà con Nhân Cơ", not "nền tảng thương mại điện tử".

## Principles

1. Practical first: what it is, what it costs, is it available, who sells it, where. In that order.
2. Structure with whitespace, type and hairlines. Not every block is a card.
3. One accent (green) for actions and prices. Earth-gold only for "Nổi bật". Red only for errors, delete, hearts, unread.
4. Soft, not fancy: no gradients, glass, glow, floating buttons, emoji, auto-moving carousels.
5. Few pills: only the avatar, round icon buttons and count dots are circles. Buttons, fields, chips and tags are rounded rectangles.
6. Mobile first. The bottom tab bar is the main navigation on phones.

## Tokens (`tailwind.config.js`, `app/globals.css`)

**Colour**

- `canvas` `#FAF8F4` warm page background. `paper` `#F4F1EA` warm fill for panels. `surface` white for header, fields, cards that need to lift.
- `line` `#E3DDD2` warm hairline. Fields use `#B0B0B0` so they read as controls.
- `ink` `#222222`, `ink-soft` `#484848` body, `ink-faint` `#6A6A6A` meta.
- `forest` deep green: 600 buttons, 700 prices and links. `gold` muted earth: tags and pinned. `brand` red: errors and hearts.

**Type**: Be Vietnam Pro, weights 400 to 700. Home H1 28/40px, section title 22px, card title 15px 500, price 17px 700, meta 13px.

**Shape and depth**: photos and cards 12px, buttons and fields 8px, tags 4px. Flat by default; one soft shadow (`shadow-lift`) for menus only.

## Components

- Header: logo, one search field with a green button, "Đăng tin", icons, then a category strip with icons and an ink underline for the active one.
- `ListingRow` (default on list pages): small photo on the left with tags (Hết hàng, Gấp, Nổi bật) and a photo count; on the right the title, one muted attributes line (type, stock, area, legal status), price per unit, place and age, seller, heart. Hairline between rows, no boxes. Learned from how Vietnamese classifieds lay out lists (dense rows, attributes line, small tags), not from their colours or artwork.`n- `ListingCard`: the grid alternative (view toggle, remembered on the device) and the home page.`n- Desktop list pages add a right column: post CTA, popular searches, safety note.
- `ListPage`: title and real count, search, category chips, quick filters, price filter where the API supports it, sort, nearby, pager. Loading shows skeletons, a failed request shows an error with a retry button, an empty result says so and offers one action.
- Forms: `components/form/Kit`. Detail pages: `components/detail/*`.

## States

Loading: skeletons shaped like the content. Error: say what failed, offer retry. Empty: one line, one action.
Success: short confirmation. Never show an error as an empty list.

## Accessibility

Visible keyboard focus (2px ink), labelled inputs, `alt` on images, tables with captions, 44px touch targets on phone,
colour never the only cue (price changes use arrows and signs).

## Audit before merging a page

Search for `gradient`, `backdrop-blur`, `shadow-lg`, `rounded-2xl`, `text-gray-`, a red button, `font-extrabold`, emoji,
an `<img>` without `alt`. Open it at 375px and check there is no sideways scroll. See `AUDIT.md` for the current list.
