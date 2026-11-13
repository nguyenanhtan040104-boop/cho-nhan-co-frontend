import Link from 'next/link';

// Price per category. Prices unchanged from the previous page.
const CATEGORIES = [
  { name: 'Bất động sản', desc: 'Đất ruộng, vườn cây, nhà vườn', tab: 'real-estate', vip7: 70000, vip30: 199000 },
  { name: 'Nông sản và thực phẩm', desc: 'Lúa, gạo, rau, củ, trái cây', tab: 'products', vip7: 30000, vip30: 79000 },
  { name: 'Vật nuôi', desc: 'Trâu, bò, gà, vịt, heo', tab: 'vat-nuoi', vip7: 35000, vip30: 89000 },
  { name: 'Việc làm', desc: 'Thời vụ, mùa gặt, công nhật', tab: 'jobs', vip7: 30000, vip30: 79000 },
  { name: 'Dịch vụ', desc: 'Sửa chữa, vận chuyển, thuê thợ', tab: 'dich-vu', vip7: 30000, vip30: 75000 },
];

const FAQ = [
  { q: 'Mua gói rồi hết hạn thì sao?', a: 'Bài vẫn hiển thị bình thường trong danh sách thường. Bài chỉ mất nhãn nổi bật và không còn được đẩy lên đầu.' },
  { q: 'Mua nhiều gói cho cùng một bài được không?', a: 'Được. Thời gian VIP được cộng dồn. Bài còn 3 ngày VIP, mua thêm gói 7 ngày sẽ thành 10 ngày.' },
  { q: 'Vì sao giá mỗi danh mục khác nhau?', a: 'Đất vườn và nhà có giá trị cao, ít người mua hơn nên cần nhiều thời gian tìm khách, giá VIP cao hơn. Việc làm và dịch vụ chủ yếu mua bán trong vùng nên giá thấp hơn.' },
  { q: 'Có hoàn tiền nếu bán được sớm không?', a: 'Hiện chưa hỗ trợ hoàn tiền. Bạn có thể dùng thời gian còn lại để đẩy một bài khác cùng danh mục.' },
];

const money = (n: number) => `${n.toLocaleString('vi-VN')}đ`;

export const metadata = {
  title: 'Bảng giá đẩy tin',
  description: 'Giá đẩy tin lên đầu danh sách theo từng danh mục, gói 7 ngày và 30 ngày.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-paper pb-10">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
          <h1 className="text-[1.5rem] font-bold leading-tight text-ink sm:text-3xl">Đẩy tin lên đầu, bán nhanh hơn</h1>
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-soft">
            Đăng tin bình thường là miễn phí. Nếu muốn tin được xem nhiều hơn, chọn một bài của bạn rồi mua thêm thời gian nổi bật. Không có gói bắt buộc, không tự gia hạn.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-8 px-4 pt-6 sm:px-6">
        <section aria-labelledby="gia">
          <h2 id="gia" className="text-lg font-bold text-ink">Giá theo danh mục</h2>
          <div className="card mt-3 overflow-hidden">
            <div className="grid grid-cols-[1fr_5.5rem_5.5rem] gap-x-3 border-b border-line bg-paper px-4 py-2 text-[12px] font-semibold text-ink-soft sm:grid-cols-[1fr_7rem_7rem]">
              <span>Danh mục</span>
              <span className="text-right">7 ngày</span>
              <span className="text-right">30 ngày</span>
            </div>
            <ul className="divide-y divide-line">
              {CATEGORIES.map(c => (
                <li key={c.tab}>
                  <Link href={`/dashboard?tab=${c.tab}`} className="grid grid-cols-[1fr_5.5rem_5.5rem] items-center gap-x-3 px-4 py-3.5 hover:bg-paper sm:grid-cols-[1fr_7rem_7rem]">
                    <span className="min-w-0">
                      <span className="block font-semibold text-ink">{c.name}</span>
                      <span className="block truncate text-[12px] text-ink-faint">{c.desc}</span>
                    </span>
                    <span className="text-right font-bold tabular-nums text-ink">{money(c.vip7)}</span>
                    <span className="text-right font-bold tabular-nums text-forest-700">{money(c.vip30)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-2 text-[13px] text-ink-faint">Bấm vào một dòng để chọn bài cần đẩy trong trang quản lý tin.</p>
        </section>

        <section aria-labelledby="duoc" className="grid gap-4 sm:grid-cols-2">
          <div>
            <h2 id="duoc" className="text-lg font-bold text-ink">Tin có VIP được gì</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[15px] text-ink-soft marker:text-forest-600">
              <li>Hiện trên đầu danh sách trong suốt thời gian VIP</li>
              <li>Có nhãn "Nổi bật" bên cạnh ảnh</li>
              <li>Đăng ảnh không giới hạn</li>
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink">Tin miễn phí</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[15px] text-ink-soft marker:text-ink-faint">
              <li>3 tin mỗi tháng</li>
              <li>Hiển thị 30 ngày, tối đa 5 ảnh</li>
              <li>Nằm trong danh sách thường, xếp theo ngày đăng</li>
            </ul>
          </div>
        </section>

        <section className="flex flex-wrap items-center justify-between gap-3 border-y border-line py-4">
          <p className="text-[15px] text-ink-soft">Thanh toán trừ từ ví. Nạp ví qua PayOS, hệ thống tự xác nhận.</p>
          <Link href="/wallet" className="btn-forest shrink-0">Nạp tiền vào ví</Link>
        </section>

        <section aria-labelledby="hoi">
          <h2 id="hoi" className="text-lg font-bold text-ink">Câu hỏi thường gặp</h2>
          <div className="card mt-3 divide-y divide-line">
            {FAQ.map(f => (
              <details key={f.q} className="group px-4 py-3.5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3 font-semibold text-ink">
                  {f.q}
                  <i className="ri-arrow-down-s-line mt-0.5 shrink-0 text-ink-faint transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
