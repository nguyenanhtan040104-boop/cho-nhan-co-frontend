'use client';
interface Props {
  rating: number; // 0-5, can be decimal
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (n: number) => void;
}
export default function StarRating({ rating, max = 5, size = 'md', interactive = false, onRate }: Props) {
  const sz = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-lg';
  return (
    <div className={`flex gap-0.5 ${sz}`}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i + 1 <= Math.round(rating);
        return (
          <button key={i} type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate?.(i + 1)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} ${filled ? 'text-yellow-400' : 'text-gray-200'}`}>
            <i className="ri-star-fill"></i>
          </button>
        );
      })}
    </div>
  );
}
