// Central constants file. All pending inputs are clearly marked PLACEHOLDER.
// Swapping any of these is a one-line edit here; nothing else needs to change.

export const SITE_TITLE = 'Wisco Radio Labs';
export const SITE_DESCRIPTION =
  'Ham-radio maker brand from the Driftless — open-source tools built by an operator who actually uses them, with more projects in progress.';

// Nav items — single source of truth; rendered by both desktop nav and mobile drawer.
export const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Products', href: '/products/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' },
] as const;

// Web3Forms submission key.
// Replace PLACEHOLDER_WEB3FORMS_KEY with the real access_key from web3forms.com once created.
// While this is the placeholder, the contact page shows a mailto fallback instead of the form.
export const WEB3FORMS_KEY = 'PLACEHOLDER_WEB3FORMS_KEY';

// Contact email — used in the mailto fallback and form error messages.
export const CONTACT_EMAIL = 'wiscoradio@gmail.com';

// Social / external links. Render only the ones with non-empty values (see Footer, Contact).
export const SOCIAL_LINKS = {
  qrz: 'https://www.qrz.com/db/K9MTE',
  youtube: 'https://www.youtube.com/@Wisco-Radio-K9MTE',
  github: 'https://github.com/wiscoradio-k9mte',
} as const;

// Analytics insertion point.
// Set to true and add the vendor <script> in BaseHead.astro when the domain is live.
// Analytics vendor is an open decision for Travis — not picked silently here.
export const ANALYTICS_ENABLED = false;

// Preview guard. The github.io preview is publicly reachable (private Pages needs a paid
// plan), so while we're iterating we tell search engines not to index it. Flip to false
// at real go-live with the custom domain, so the launched site CAN be found/indexed.
export const PREVIEW_NOINDEX = true;
