// A strip of market awning: alternating green and pale stripes with a scalloped lower edge.
// It is the one decorative element of the brand, used only at the top of the header and the footer.
export default function Awning({ id = 'awn', height = 10, className = '' }: { id?: string; height?: number; className?: string }) {
  const h = 10;
  return (
    <svg className={`block w-full ${className}`} height={height} aria-hidden="true" focusable="false">
      <defs>
        <pattern id={id} width="48" height={h} patternUnits="userSpaceOnUse">
          <path d={`M0 0H24V3Q24 ${h} 12 ${h}Q0 ${h} 0 3Z`} fill="#0D7A41" />
          <path d={`M24 0H48V3Q48 ${h} 36 ${h}Q24 ${h} 24 3Z`} fill="#D2EEDD" />
        </pattern>
      </defs>
      <rect width="100%" height={height} fill={`url(#${id})`} />
    </svg>
  );
}
