import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/profile/', '/messages/'],
    },
    sitemap: 'https://cho-nhan-co-frontend-bxj2-18271g0zq.vercel.app/sitemap.xml',
  };
}
