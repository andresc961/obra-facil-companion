import { describe, expect, it } from 'vitest';
import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { sitemapStaticPaths, sitemapXML } from '@/lib/sitemap';

function inventory() {
  const root = createRootRoute({ staticData: { sitemap: false } });
  const home = createRoute({ getParentRoute: () => root, path: '/', staticData: { sitemap: true } });
  const auth = createRoute({ getParentRoute: () => root, path: 'auth', staticData: { sitemap: false } });
  const checkout = createRoute({ getParentRoute: () => root, path: 'checkout/return', staticData: { sitemap: false } });
  const privateSection = createRoute({ getParentRoute: () => root, id: '_authenticated', staticData: { sitemap: 'exclude-subtree' } });
  const account = createRoute({ getParentRoute: () => privateSection, path: 'cuenta', staticData: { sitemap: true } });
  return createRouter({ routeTree: root.addChildren([home, auth, checkout, privateSection.addChildren([account])]) });
}

describe('public sitemap', () => {
  it('includes the homepage while excluding authentication, checkout and the private subtree', () => {
    expect(sitemapStaticPaths(inventory())).toEqual(['/']);
  });
  it('uses the public domain without fabricated content timestamps', () => {
    const xml = sitemapXML('https://obrafacil.biz', [{ path: '/' }]);
    expect(xml).toContain('<loc>https://obrafacil.biz/</loc>');
    expect(xml).not.toContain('<lastmod>');
  });
  it('preserves an authoritative timestamp if supplied', () => {
    expect(sitemapXML('https://obrafacil.biz', [{ path: '/', lastmod: '2026-10-22' }])).toContain('<lastmod>2026-10-22</lastmod>');
  });
});
