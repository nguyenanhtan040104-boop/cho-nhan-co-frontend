'use client';
export default function LikeButton() {
  return (
    <button
      onClick={e => e.preventDefault()}
      className="absolute top-1.5 right-1.5 w-7 h-7 bg-white/85 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform z-10"
    >
      <i className="ri-heart-line text-gray-500 text-sm"></i>
    </button>
  );
}
