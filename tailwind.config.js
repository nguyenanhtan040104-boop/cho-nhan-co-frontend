/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./{app,components,libs,pages,hooks}/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Chợ Nhân Cơ — Tây Nguyên highland identity ──────────────────
        // Boldness lives in ONE place: laterite/coffee-cherry red.
        brand: {
          50:  '#FCEEEB',
          100: '#F9DAD3',
          200: '#F2B3A6',
          300: '#EA8574',
          400: '#E15A44',
          500: '#D23B27', // đỏ đất bazan / cà phê chín — primary
          600: '#B32E1D',
          700: '#8C2417',
          800: '#661A11',
          900: '#43110B',
        },
        forest: {
          50:  '#EAF3EE',
          100: '#CFE3D7',
          200: '#A9CDB8',
          300: '#7FB395',
          400: '#4C8E6C',
          500: '#1F6B4A', // xanh cao nguyên — secondary
          600: '#175539',
          700: '#0F3D29',
          800: '#0A2E1F',
          900: '#061E14',
        },
        gold: {
          400: '#F0B429',
          500: '#E8A317', // vàng nghệ/tiêu — accent, dùng rất tiết chế
          600: '#C4820E',
        },
        ink: {
          DEFAULT: '#241C15', // espresso warm near-black (true-ish, not tinted grey)
          soft: '#5B5048',
          faint: '#938a80',
        },
        paper: '#FBF9F5',   // ground — warm white, NOT cream flat
        surface: '#FFFFFF', // cards
        line: '#EAE4DB',    // hairline / borders
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
        pill: '999px',
      },
      boxShadow: {
        // one disciplined tier — no soft-grey-under-everything
        card: '0 1px 2px rgba(36,28,21,0.06)',
        lift: '0 6px 24px -8px rgba(36,28,21,0.18)',
        brand: '0 6px 20px -6px rgba(210,59,39,0.45)',
      },
      maxWidth: {
        content: '1200px',
      },
      keyframes: {
        'rise': {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        rise: 'rise .5s cubic-bezier(.2,.7,.3,1) both',
      },
    },
  },
  plugins: [],
}
