import { expect, test } from '@playwright/test';

// Each address opens its own page, with or without the trailing slash.
const pages: [string, string][] = [
  ['/', 'Alexandre Teixeira — Portfolio'],
  ['/desktop', 'Portfolio Desktop'],
  ['/desktop/', 'Portfolio Desktop'],
  ['/cv/fr', 'CV'],
  ['/atelier', 'Atelier'],
];

for (const [path, title] of pages) {
  test(`${path} opens its own page`, async ({ request }) => {
    const response = await request.get(path, { headers: { Accept: 'text/html' } });
    expect(response.ok()).toBe(true);
    expect(await response.text()).toMatch(new RegExp(`<title>[^<]*${title}[^<]*</title>`));
  });
}

test('the old Vitrine address leads to the home page', async ({ request }) => {
  for (const path of ['/portfolio', '/portfolio/']) {
    const response = await request.get(path, { headers: { Accept: 'text/html' }, maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(response.headers().location).toBe('/');
  }
});
