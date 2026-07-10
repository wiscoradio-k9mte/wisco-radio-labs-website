// T4 (blog-comments DoR): the feature must ship with ZERO new CSP domains — it rides
// on the same Web3Forms + hCaptcha submission target the contact form already uses.
// This locks the rendered CSP meta content to the exact known-good string. Adding
// (or removing) a domain changes this string and turns the test red — that's the
// point: it forces a deliberate, reviewed change instead of silent domain creep.
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import BaseHead from './BaseHead.astro';

const EXPECTED_CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' https://web3forms.com https://hcaptcha.com https://*.hcaptcha.com",
  "style-src 'self' 'unsafe-inline' https://hcaptcha.com https://*.hcaptcha.com",
  "img-src 'self' data: https:",
  "font-src 'self'",
  "connect-src 'self' https://api.web3forms.com https://hcaptcha.com https://*.hcaptcha.com",
  "frame-src https://hcaptcha.com https://*.hcaptcha.com https://www.youtube-nocookie.com https://www.youtube.com",
  "form-action 'self' https://api.web3forms.com",
  'upgrade-insecure-requests',
].join('; ');

describe('BaseHead CSP (T4 — zero new domains)', () => {
  it('renders a Content-Security-Policy meta tag byte-identical to the pre-feature baseline', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BaseHead, { props: { title: 'Test Page' } });
    const match = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]*)"/);
    expect(match).not.toBeNull();
    // HTML-entity-decode the single quotes Astro escapes in the attribute value.
    const decoded = (match as RegExpMatchArray)[1].replace(/&#39;/g, "'").replace(/&amp;/g, '&');
    expect(decoded).toBe(EXPECTED_CSP);
  });
});
