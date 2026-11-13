// Chợ Nhân Cơ mark: a "C" for Chợ that ends in a leaf. Drawn for this site.
export default function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="img" aria-label="Chợ Nhân Cơ" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="9" fill="#0D7A41" />
      <path d="M21 12.2A7.6 7.6 0 1 0 21 19.8" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M20.6 8.2c3.6-.2 5.9 1.9 5.9 5.4-3.6.2-5.9-1.9-5.9-5.4z" fill="#A6DDBC" />
    </svg>
  );
}
