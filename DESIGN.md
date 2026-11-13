# Chợ Nhân Cơ: design rules

## Direction

The site is a **village notice board that happens to be online**. People come to look at a
photo, read a price, and call a neighbour. So the interface gets out of the way:
flat paper-coloured surfaces, thin rules instead of shadows, one strong green for
"trust and prices", one red reserved for "act now" (post a listing, warnings).

What we are deliberately not: a SaaS dashboard (gradients, glass, glow, icon tiles,
centered hero plus three cards) or a copy of another marketplace.

## Audit method

Before changing a page, search it for the things below. Each one needs a reason to stay.

| Smell | Why it is removed |
| --- | --- |
| `bg-gradient`, `from-*`, `to-*` | Decoration. Colour should carry meaning (price, status, action). |
| `backdrop-blur`, `bg-white/20` panels | Glass hurts contrast on photos and costs GPU on cheap phones. |
| `shadow-lg/xl/2xl`, glow, `ring-2` on idle cards | Depth is not information. Borders are enough. |
| `rounded-2xl/3xl`, pill buttons everywhere | Same radius on everything flattens hierarchy. |
| Icon in a pastel square next to a label | The label already says it. |
| Floating buttons | The bottom tab bar already has the post action. |
| Auto-advancing carousels | Moves content under the reader, fails "pause or stop" for accessibility. |
| Emoji as icons | Render differently per phone, read as clip art. |
| Invented numbers (fake members, fake stats) | Trust is the product. |

## Tokens (`tailwind.config.js`, `app/globals.css`)

**Colour**

- `paper` `#F3F7F3` page background, `surface` white for content, `line` `#E1E9E3` for every rule and border.
- `ink` (text), `ink-soft` (secondary), `ink-faint` (meta, placeholders). Do not use `gray-*`; they do not match the green-tinted paper.
- `forest` is the main colour: 600 for buttons and chips, 700 for prices and links, 50 for selected rows.
- `brand` (red) only for: post a listing, destructive actions, errors, urgent. Never for decoration.
- `gold` only for "featured/VIP" and pinned.
- Blue and purple are not part of the identity. Info states use `ink-soft` or `gold`.

**Type** (Be Vietnam Pro, supports full Vietnamese diacritics)

- Page title `text-[1.4rem] sm:text-3xl font-bold`; section title `text-lg/xl font-bold`.
- Body `text-[15px]`, meta `text-[12–13px]` in `ink-faint`.
- Prices are always `tabular-nums font-bold text-forest-700`; the largest text on a listing.

**Space and grid**

- 4px base. Page gutter 16px (mobile) / 24px (`sm`+). Content max width `max-w-content` (1200px).
- Lists: 2 columns on phones, 3 at `sm`, 4 at `lg`. Reading pages (forum, forms): 672–768px.

**Radius and depth**

- `card` 10px for content, `sheet` 14px for modals, `rounded-lg` for fields and buttons. Full round only for avatars and chips.
- One shadow token (`shadow-card`, barely visible) for cards that need separation on `paper`. Menus and modals use a border, not a shadow.

## Components

- `.btn-primary` red (post), `.btn-forest` green (everything else that submits), `.btn-ghost` white with border.
- `.chip` / `.chip-active` for filters and tabs; selection is shown by fill, not by icon.
- `.field` for every input. Labels sit above the field; required is a red asterisk; hints are in the label line.
- Lists use `ListPage`; forms use `components/form/Kit` (frame, field, image picker, error, submit bar);
  detail pages use `components/detail/*`.
- Status is text plus a quiet tint (`ok`, `warn`, `bad`, `off`). No pulsing badges.
- Skeletons may pulse; nothing else may.

## States

Every interactive element needs: hover (border or text colour, not scale), focus-visible ring from the browser
default, disabled (`opacity-50`), loading (spinner inside the button, label changes), and an error message
in words. Empty states say what is missing and give one next action.

## Responsive rules

- Mobile first. The bottom tab bar (`BottomNav`) is the primary navigation under 768px, so pages add no floating action button.
- Primary submit stays visible above the tab bar on long forms (sticky bar at `bottom-[4.5rem]`).
- Horizontal chip rows scroll without a scrollbar (`no-scrollbar`) and bleed to the screen edge.

## Decisions and reasons

1. **Plain thread list for the forum** instead of photo cards: people scan titles and questions, not pictures.
2. **Ad strip instead of an auto-fading hero**: photo next to a solid text panel, manual next/previous, the word "Quảng cáo" always shown.
3. **Opaque sticky bars**: header, tab bar and contact bar are solid; blur looked soft and made text harder to read over photos.
4. **No floating "+"**: the tab bar already has it; two post buttons on one screen was noise.
5. **Menus without colour-coded icons** (blue pencil, red bin, brand-coloured share): wording does the job.

## Still on the old style (to be rebuilt)

Admin area, VIP checkout, messages.
