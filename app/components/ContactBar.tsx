'use client';

// One-tap contact for a listing: call, Zalo, or chat. Sits above the phone tab bar.
function digits(phone: string) {
  const d = phone.replace(/\D/g, '');
  return d.startsWith('84') ? '0' + d.slice(2) : d;
}

export default function ContactBar({ phone, onChat }: { phone?: string | null; onChat: () => void }) {
  const num = phone ? digits(phone) : '';
  const btn = 'flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition active:scale-[0.98]';

  return (
    <>
      <div aria-hidden="true" className="h-20 md:hidden" />
      <div
        className="fixed inset-x-0 z-30 border-t border-line bg-surface/95 px-3 py-2 shadow-nav backdrop-blur md:hidden"
        style={{ bottom: 'calc(4.25rem + env(safe-area-inset-bottom))' }}
        role="group"
        aria-label="Liên hệ người bán"
      >
        <div className="mx-auto flex max-w-xl gap-2">
          {num && (
            <a href={`tel:${num}`} className={`${btn} bg-forest-600 text-white`}>
              <i className="ri-phone-fill" aria-hidden="true" /> Gọi
            </a>
          )}
          {num && (
            <a href={`https://zalo.me/${num}`} target="_blank" rel="noopener noreferrer" className={`${btn} border border-forest-600 bg-white text-forest-700`}>
              <i className="ri-chat-smile-3-line" aria-hidden="true" /> Zalo
            </a>
          )}
          <button onClick={onChat} className={`${btn} ${num ? 'border border-line bg-white text-ink' : 'bg-forest-600 text-white'}`}>
            <i className="ri-message-3-line" aria-hidden="true" /> Nhắn tin
          </button>
        </div>
      </div>
    </>
  );
}
