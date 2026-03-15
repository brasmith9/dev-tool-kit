import { MetadataRoute } from 'next';

const BASE_URL = 'ttps://devtools.isaacanane.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/guid-generator',
    '/json-formatter',
    '/json-diff',
    '/base64-tool',
    '/jwt-debugger',
    '/regex-tester',
    '/hash-generator',
    '/url-encoder',
    '/epoch-converter',
    '/sql-formatter',
    '/cron-parser',
    '/yaml-json',
    '/password-generator',
    '/settings',
  ];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}
