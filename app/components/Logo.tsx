// The mark: a market awning over "Cơ", with one red dot (a ripe coffee cherry).
// Flat shapes only. The awning is the site's signature and also appears as a strip in the header and footer.
export default function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg role="img" aria-label="Chợ Nhân Cơ" width={size} height={size} viewBox="0 0 40 40" className="shrink-0">
      <rect width="40" height="40" rx="9" fill="#095F33" />
      <path d="M5 7h10v5a5 5 0 0 1-10 0z" fill="#FFFFFF" />
      <path d="M15 7h10v5a5 5 0 0 1-10 0z" fill="#A6DDBC" />
      <path d="M25 7h10v5a5 5 0 0 1-10 0z" fill="#FFFFFF" />
      <text x="18.5" y="34" textAnchor="middle" fontSize="15" fontWeight="700" fill="#FFFFFF" style={{ fontFamily: 'var(--font-sans), system-ui, sans-serif' }}>Cơ</text>
      <circle cx="31.5" cy="29.5" r="2.5" fill="#D23B27" />
    </svg>
  );
}
