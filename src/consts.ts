// Central constants file. All pending inputs are clearly marked PLACEHOLDER.
// Swapping any of these is a one-line edit here; nothing else needs to change.

export const SITE_TITLE = 'Wisco Radio Labs';
export const SITE_DESCRIPTION =
  'Ham-radio maker brand from the Driftless. Building CW trainers, transceivers, and more — in the open.';

// Nav items — single source of truth; rendered by both desktop nav and mobile drawer.
export const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Products', href: '/products/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' },
] as const;

// Formspree form endpoint.
// TODO: replace with the real form ID from formspree.io/f/<ID> once Travis creates the form.
export const FORMSPREE_ID = 'PLACEHOLDER_FORM_ID';

// Contact email.
// TODO: confirm with Travis whether wiscoradio@gmail.com is the public contact, then set it here.
export const CONTACT_EMAIL = ''; // PLACEHOLDER — leave empty until confirmed

// Social / external links. Render only the ones with non-empty values (see Footer, Contact).
export const SOCIAL_LINKS = {
  // TODO: fill in once Travis confirms these.
  qrz: 'https://www.qrz.com/db/K9MTE', // QRZ profile — public, safe to ship
  youtube: '', // PLACEHOLDER
  github: 'https://github.com/wiscoradio-k9mte', // public org
} as const;

// Analytics insertion point.
// Set to true and add the vendor <script> in BaseHead.astro when the domain is live.
// Analytics vendor is an open decision for Travis — not picked silently here.
export const ANALYTICS_ENABLED = false;

// Preview guard. The github.io preview is publicly reachable (private Pages needs a paid
// plan), so while we're iterating we tell search engines not to index it. Flip to false
// at real go-live with the custom domain, so the launched site CAN be found/indexed.
export const PREVIEW_NOINDEX = true;
