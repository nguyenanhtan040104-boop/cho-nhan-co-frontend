
import SellerProfile from './SellerProfile';

export async function generateStaticParams() {
  return [
    { name: 'Nguyen-Van-A' },
    { name: 'Tran-Thi-B' },
    { name: 'Le-Van-C' },
    { name: 'Pham-Thi-D' },
    { name: 'Hoang-Van-E' },
    { name: 'Nguy%E1%BB%85n%20V%C4%83n%20A' },
    { name: 'Tr%E1%BA%A7n%20Th%E1%BB%8B%20B' },
    { name: 'L%C3%AA%20V%C4%83n%20C' },
    { name: 'Ph%E1%BA%A1m%20Th%E1%BB%8B%20D' },
    { name: 'Ho%C3%A0ng%20V%C4%83n%20E' },
  ];
}

export default function SellerPage({ params }: { params: { name: string } }) {
  return <SellerProfile sellerName={decodeURIComponent(params.name)} />;
}
