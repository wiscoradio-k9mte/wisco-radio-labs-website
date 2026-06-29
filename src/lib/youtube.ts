// Pure helper: extract a YouTube video ID from either a bare ID or a full URL.
// Lives here as a pure function so it is unit-testable in isolation.
//
// Supported input forms:
//   dQw4w9WgXcQ                        → dQw4w9WgXcQ
//   https://www.youtube.com/watch?v=dQw4w9WgXcQ
//   https://youtu.be/dQw4w9WgXcQ
//   https://www.youtube.com/embed/dQw4w9WgXcQ

const YOUTUBE_ID_RE = /^[A-Za-z0-9_-]{11}$/;

export function extractYouTubeId(input: string): string {
  if (!input) return '';

  // Already a bare 11-char ID
  if (YOUTUBE_ID_RE.test(input.trim())) {
    return input.trim();
  }

  try {
    const url = new URL(input);
    // youtu.be/<id>
    if (url.hostname === 'youtu.be') {
      return url.pathname.slice(1).split('?')[0];
    }
    // youtube.com/watch?v=<id>
    const v = url.searchParams.get('v');
    if (v) return v;
    // youtube.com/embed/<id>
    const embedMatch = url.pathname.match(/\/embed\/([A-Za-z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];
  } catch {
    // not a URL, fall through
  }

  return input; // pass through unrecognized forms; let the embed component handle it
}
