import { Metadata } from 'next';
import JobDetail from './JobDetail';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://cho-nhan-co-backend-production.up.railway.app/api';

async function getJob(id: string) {
  try {
    const res = await fetch(`${API}/jobs/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) return { title: 'Tin tuyển dụng không tồn tại' };

  const title = job.title;
  const description = `Tuyển dụng: ${job.title} tại ${job.location || 'Đắk Nông'}. Lương: ${job.salary || 'Thỏa thuận'}. ${job.description?.slice(0, 100) || ''}`;

  return {
    title,
    description,
    keywords: [job.title, 'tuyển dụng', 'việc làm', 'đắk nông', 'nhân cơ', job.location].filter(Boolean),
    openGraph: {
      title: `Tuyển: ${title} | Chợ Nhân Cơ`,
      description,
      type: 'article',
    },
  };
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getJob(id);

  return (
    <>
      {job && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'JobPosting',
              title: job.title,
              description: job.description,
              datePosted: job.createdAt,
              jobLocation: {
                '@type': 'Place',
                address: { '@type': 'PostalAddress', addressLocality: job.location || 'Đắk Nông', addressCountry: 'VN' },
              },
              hiringOrganization: { '@type': 'Organization', name: job.company || 'Chợ Nhân Cơ' },
              baseSalary: job.salary ? {
                '@type': 'MonetaryAmount',
                currency: 'VND',
                value: { '@type': 'QuantitativeValue', value: job.salary },
              } : undefined,
            }),
          }}
        />
      )}
      <JobDetail jobId={id} />
    </>
  );
}
