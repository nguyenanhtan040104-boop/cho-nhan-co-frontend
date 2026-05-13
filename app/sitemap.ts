import { MetadataRoute } from 'next';

const BASE_URL = 'https://chonhanco.com';

const staticRoutes = [
  { url: '/', priority: 1.0, changeFrequency: 'daily' },
  { url: '/forum', priority: 0.9, changeFrequency: 'hourly' },
  { url: '/products', priority: 0.9, changeFrequency: 'hourly' },
  { url: '/real-estate', priority: 0.8, changeFrequency: 'daily' },
  { url: '/jobs', priority: 0.8, changeFrequency: 'daily' },
  { url: '/market-prices', priority: 0.7, changeFrequency: 'hourly' },
  { url: '/advertisements', priority: 0.6, changeFrequency: 'daily' },
];

async function fetchIds(path: string): Promise<string[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/${path}?limit=200`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data || []).map((item: any) => item.id);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [forumIds, productIds, realEstateIds, jobIds] = await Promise.all([
    fetchIds('forum/posts'),
    fetchIds('products'),
    fetchIds('real-estate'),
    fetchIds('jobs'),
  ]);

  const forumEntries = forumIds.map(id => ({
    url: `${BASE_URL}/forum/${id}`,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const productEntries = productIds.map(id => ({
    url: `${BASE_URL}/products/${id}`,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const realEstateEntries = realEstateIds.map(id => ({
    url: `${BASE_URL}/real-estate/${id}`,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const jobEntries = jobIds.map(id => ({
    url: `${BASE_URL}/jobs/${id}`,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [
    ...staticRoutes.map(r => ({
      url: `${BASE_URL}${r.url}`,
      changeFrequency: r.changeFrequency as any,
      priority: r.priority,
      lastModified: new Date(),
    })),
    ...forumEntries,
    ...productEntries,
    ...realEstateEntries,
    ...jobEntries,
  ];
}
