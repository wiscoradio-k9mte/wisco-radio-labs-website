// site.webmanifest — dynamic Astro endpoint so icon paths go through withBase()
// and are therefore correct on both the GH Pages sub-path preview and a future
// root-domain deploy (where base is removed and withBase is a no-op).
//
// The <link rel="manifest"> in BaseHead.astro points here via withBase('/site.webmanifest').
import type { APIRoute } from 'astro';
import { withBase } from '../lib/link';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export const GET: APIRoute = () => {
  const manifest = {
    name: SITE_TITLE,
    short_name: 'Wisco Radio',
    description: SITE_DESCRIPTION,
    // start_url must match the base path so "Add to Home Screen" lands correctly.
    start_url: withBase('/'),
    display: 'browser',
    theme_color: '#0F1115',   // matches --bg dark token
    background_color: '#0F1115',
    icons: [
      {
        src: withBase('/icons/icon-192.png'),
        sizes: '192x192',
        type: 'image/png',
      },
      {
        // "maskable any" lets Android crop the icon to any shape AND
        // fall back to non-cropped display.
        src: withBase('/icons/icon-512.png'),
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable any',
      },
    ],
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: {
      'Content-Type': 'application/manifest+json',
    },
  });
};
