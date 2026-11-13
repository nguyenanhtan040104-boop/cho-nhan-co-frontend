/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./{app,components,libs,pages,hooks}/**/*.{html,js,ts,jsx,tsx}"],
  // The dashboard builds some class names at runtime (bg-${accent}-600), so keep these.
  safelist: [
    { pattern: /^(bg|text|border)-(forest|gold|blue)-(50|100|600|700)$/ },
    { pattern: /^hover:(bg|text)-(forest|gold|blue)-(50|600|700)$/ },
  ],
  theme: {
    extend: {
      colors: {
        // ── Chợ Nhân Cơ — bright marketplace palette ─────────────────────
        // Leaf green carries the brand; cherry red is reserved for the one
        // action we want people to take ("Đăng tin") and for alerts.
        brand: {
          50:  '#FCEEEB',
          100: '#F9DAD3',
          200: '#F2B3A6',
          300: '#EA8574',
          400: '#E15A44',
          500: '#D23B27', // cherry red — primary action
          600: '#B32E1D',
          700: '#8C2417',
          800: '#661A11',
          900: '#43110B',
        },
        forest: {
          50:  '#EAF7EF',
          100: '#D2EEDD',
          200: '#A6DDBC',
          300: '#72C894',
          400: '#3BAE6C',
          500: '#12944F', // leaf green
          600: '#0D7A41', // buttons (white text passes AA)
          700: '#095F33', // prices, headings on light
          800: '#07472A',
          900: '#042F1B',
        },
        gold: {
          50:  '#FEF8E7',
          100: '#FCEEC4',
          200: '#F9DD8E',
          300: '#F5C94F',
          400: '#F0B429',
          500: '#E8A317', // VIP / sponsored accents
          600: '#C4820E',
          700: '#9A6409',
          800: '#734A08',
          900: '#4D3105',
        },
        ink: {
          DEFAULT: '#13271D', // deep green-black
          soft: '#4C6054',
          faint: '#7F9187',
        },
        paper: '#F3F7F3',   // app background, slightly green so white cards lift off it
        surface: '#FFFFFF', // cards
        line: '#E1E9E3',    // hairline / borders
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        // headings use the same family now; kept as a name so existing pages keep working
        display: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        sheet: '24px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(19,39,29,0.05), 0 2px 10px -4px rgba(19,39,29,0.08)',
        lift: '0 10px 30px -12px rgba(19,39,29,0.28)',
        brand: '0 6px 18px -6px rgba(210,59,39,0.5)',
        nav: '0 -4px 20px -8px rgba(19,39,29,0.18)',
      },
      maxWidth: {
        content: '1200px',
      },
      keyframes: {
        'rise': {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'sheet-up': {
          '0%':   { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        rise: 'rise .5s cubic-bezier(.2,.7,.3,1) both',
        'sheet-up': 'sheet-up .25s cubic-bezier(.2,.8,.3,1) both',
      },
    },
  },
  plugins: [],
}
