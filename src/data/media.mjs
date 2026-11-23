// Responsive image sets. Files live in src/assets/img as `${key}-${width}.${ext}`.
// ratio = intrinsic [w, h]; widths = available widths; jpg = widths that also ship as JPEG fallback.
export const IMAGES = {
  'hero-poster': { ratio: [1920, 1080], widths: [1280, 1920], jpg: [1280, 1920], avif: true },
  'film-poster': { ratio: [1280, 720], widths: [1280], jpg: [1280], avif: false },
  s1: { ratio: [3648, 1478], widths: [1200, 2400], jpg: [1200], avif: true },
  s3: { ratio: [1410, 810], widths: [705, 1410], jpg: [705], avif: true },
  s6: { ratio: [2730, 510], widths: [1200, 2400], jpg: [1200], avif: true },
  'johny-aguilar': { ratio: [960, 1200], widths: [640, 960], jpg: [640, 960], avif: true },
  'tool-divisor-pdf': { ratio: [1320, 660], widths: [1320], jpg: [], avif: true },
  'tool-armar-pdf': { ratio: [1320, 880], widths: [1320], jpg: [], avif: true },
  'tool-comprimir-pdf': { ratio: [1320, 880], widths: [1320], jpg: [], avif: true },
  'tool-comprimir-y-dividir': { ratio: [1320, 880], widths: [1320], jpg: [], avif: true },
};

// Hero loop and film files (src/assets/media).
export const VIDEO = {
  loop: { '1920': 'media/hero-1920.mp4', '1920av1': 'media/hero-1920.av1.mp4', '1280': 'media/hero-1280.mp4', '1280av1': 'media/hero-1280.av1.mp4' },
  film: { '1080': 'media/umplia-lanzamiento-1080p.mp4', '720': 'media/umplia-lanzamiento-720p.mp4' },
};
