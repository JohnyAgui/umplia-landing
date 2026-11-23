// Responsive image sets. Files live in src/assets/img as `${key}-${width}.${ext}`.
// ratio = intrinsic [w, h]; widths = available widths; jpg = widths that also ship as JPEG fallback.
export const IMAGES = {
  'hero-poster': { ratio: [1920, 1080], widths: [1280, 1920, 2560], jpg: [1280, 1920], avif: true },
  'demo-poster': { ratio: [1920, 1080], widths: [1280, 1920], jpg: [1280, 1920], avif: true },
  reporte: { ratio: [2860, 1798], widths: [1430, 2860], jpg: [1430], avif: true },
  proceso: { ratio: [1496, 936], widths: [748, 1496], jpg: [748], avif: true },
  mod: { ratio: [2666, 1688], widths: [1333, 2666], jpg: [1333], avif: true },
  'johny-aguilar': { ratio: [960, 1200], widths: [640, 960], jpg: [640, 960], avif: true },
  'tool-divisor-pdf': { ratio: [1320, 660], widths: [1320], jpg: [], avif: true },
  'tool-armar-pdf': { ratio: [1320, 880], widths: [1320], jpg: [], avif: true },
  'tool-comprimir-pdf': { ratio: [1320, 880], widths: [1320], jpg: [], avif: true },
  'tool-comprimir-y-dividir': { ratio: [1320, 880], widths: [1320], jpg: [], avif: true },
};

// Hero loop and film files (src/assets/media).
export const VIDEO = {
  loop: { '1920': 'media/hero-1920.mp4', '1920av1': 'media/hero-1920.av1.mp4', '1280': 'media/hero-1280.mp4', '1280av1': 'media/hero-1280.av1.mp4' },
};
