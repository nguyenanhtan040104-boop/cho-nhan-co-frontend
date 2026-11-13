// Chợ Nhân Cơ mark: plain lettering, no pictogram. "Cơ" on a flat green square.
export default function Logo({ size = 36 }: { size?: number }) {
  return (
    <span
      role="img"
      aria-label="Chợ Nhân Cơ"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
      className="grid shrink-0 place-items-center rounded-md bg-forest-700 font-extrabold leading-none tracking-tight text-white"
    >
      Cơ
    </span>
  );
}
