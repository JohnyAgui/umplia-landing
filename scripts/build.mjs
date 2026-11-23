// Zero-dependency static build: src/ -> dist/. Run by Vercel (vercel.json) and locally (`npm run build`).
// Fails (exit 1) when CONTACT_EMAIL is missing or any content/SEO check fails, so a bad build never deploys.
import { existsSync, rmSync, readFileSync } from 'node:fs';
import { join, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { read, write, copy, walk, hash8, esc, text } from './lib/util.mjs';
import { packIco } from './lib/ico.mjs';
import { graph } from './lib/jsonld.mjs';
import { SITE, PAGES, byId, url } from '../src/site.mjs';
import { CLAIMS } from '../src/data/claims.mjs';
import { FAQ } from '../src/data/faq.mjs';
import { FILM } from '../src/data/film.mjs';
import { IMAGES, VIDEO } from '../src/data/media.mjs';
import { check } from './check.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const DIST = join(ROOT, 'dist');

const EMAIL = (process.env.CONTACT_EMAIL || '').trim();
if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(EMAIL)) {
  console.error('build: CONTACT_EMAIL is not set (Vercel > Settings > Environment Variables). Refusing to build a site without contact.');
  process.exit(1);
}

rmSync(DIST, { recursive: true, force: true });

// ---------- 1. Hashed assets ----------
const ASSET = {}; // 'img/s1-1200.webp' -> '/assets/img/s1-1200.ab12cd34.webp'
const hashedName = (rel, buf) => {
  const ext = extname(rel);
  // keep double extensions like .av1.mp4 readable
  return `/assets/${rel.slice(0, -ext.length)}.${hash8(buf)}${ext}`;
};
for (const rel of walk(join(SRC, 'assets'))) {
  const buf = readFileSync(join(SRC, 'assets', rel));
  const out = hashedName(rel, buf);
  copy(join(SRC, 'assets', rel), join(DIST, out));
  ASSET[rel] = out;
}
const asset = (rel) => {
  if (!ASSET[rel]) throw new Error(`build: missing asset "${rel}"`);
  return ASSET[rel];
};
const abs = (rel) => SITE.origin + asset(rel);

// favicon.ico from the 16/32/48 PNGs
write(join(DIST, 'favicon.ico'), packIco(['img/icon-16.png', 'img/icon-32.png', 'img/icon-48.png'].map((r) => readFileSync(join(SRC, 'assets', r)))));

const assetTokens = (s) => s.replace(/\{\{a:([^}]+)\}\}/g, (_, rel) => asset(rel.trim()));

// CSS and JS get the asset tokens, then their own hash
function bundle(srcRel, outBase, ext) {
  const body = assetTokens(read(join(SRC, srcRel)));
  const out = `/assets/${outBase}.${hash8(body)}.${ext}`;
  write(join(DIST, out), body);
  return out;
}
const CSS = bundle('styles/site.css', 'site', 'css');
const JS = bundle('js/site.js', 'site', 'js');

// ---------- 2. Template helpers ----------
const mailto = `<a href="mailto:${EMAIL}">${EMAIL}</a>`;

function picture(key, alt, sizes, opts = {}) {
  const set = IMAGES[key];
  if (!set) throw new Error(`build: unknown image set "${key}"`);
  const [rw, rh] = set.ratio;
  const srcset = (ext) => set.widths.map((w) => `${asset(`img/${key}-${w}.${ext}`)} ${w}w`).join(', ');
  const fbW = (set.jpg.length ? set.jpg : set.widths).at(-1);
  const fbExt = set.jpg.length ? 'jpg' : 'webp';
  const h = Math.round((fbW * rh) / rw);
  const loading = opts.eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"';
  const cls = opts.cls ? ` class="${opts.cls}"` : '';
  return (
    `<picture>` +
    (set.avif ? `<source type="image/avif" srcset="${srcset('avif')}" sizes="${sizes}">` : '') +
    `<source type="image/webp" srcset="${srcset('webp')}" sizes="${sizes}">` +
    `<img${cls} src="${asset(`img/${key}-${fbW}.${fbExt}`)}" width="${fbW}" height="${h}" alt="${esc(alt)}"${loading}>` +
    `</picture>`
  );
}

function faqHtml(list) {
  return (
    '<div class="faq">' +
    list.map(([q, a]) => `<div class="faq-item"><h3>${q}</h3><p>${a}</p></div>`).join('') +
    '</div>'
  );
}

const fmtDate = (iso, lang) =>
  new Date(iso + 'T12:00:00Z').toLocaleDateString(lang === 'es' ? 'es-CO' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

function crumbsHtml(page) {
  if (!page.crumbs) return '';
  const home = page.lang === 'es' ? ['Inicio', '/'] : ['Home', '/en'];
  const items = [home, ...page.crumbs];
  return (
    `<nav class="crumbs" aria-label="${page.lang === 'es' ? 'Ruta de navegación' : 'Breadcrumb'}"><ol>` +
    items
      .map(([name, path], i) =>
        i === items.length - 1
          ? `<li><span aria-current="page">${name}</span></li>`
          : path
            ? `<li><a href="${path}">${name}</a></li>`
            : `<li><span>${name}</span></li>`,
      )
      .join('') +
    `</ol></nav>`
  );
}

const partial = (name, lang) => {
  const p1 = join(SRC, 'partials', `${name}.${lang}.html`);
  const p2 = join(SRC, 'partials', `${name}.html`);
  if (existsSync(p1)) return read(p1);
  if (existsSync(p2)) return read(p2);
  throw new Error(`build: missing partial ${name}`);
};

const T = {
  es: {
    'poster-alt': 'Reporte de Umplia sobre el dossier de ejemplo Sérum Facial Iluminador Aurora: el expediente no está listo para radicar, con 8 hallazgos de impacto alto y 17 de impacto medio.',
    'vid-pause': 'Pausar el video',
    'vid-play': 'Reproducir el video',
    'vid-desc': 'Video sin sonido de 17 segundos: el reporte de Umplia sobre un dossier de ejemplo, los dos módulos Nuevas NSO y Modificaciones, el logo de Umplia y el análisis automático del expediente.',
    'film-title': 'Película de lanzamiento de Umplia para Cosméticos',
    close: 'Cerrar',
    transcript: 'Transcripción y capítulos',
    'film-poster-alt': 'Umplia: validación de dossiers de cosméticos para la Comunidad Andina, en minutos. Colombia, Perú, Ecuador y Bolivia.',
  },
  en: {
    'poster-alt': 'Umplia report on the sample dossier Sérum Facial Iluminador Aurora: the dossier is not ready to file, with 8 high-impact and 17 medium-impact findings.',
    'vid-pause': 'Pause the video',
    'vid-play': 'Play the video',
    'vid-desc': 'Silent 17-second video: the Umplia report on a sample dossier, the two modules New NSO and Modifications, the Umplia logo and the automatic analysis of the dossier. On-screen text is in Spanish.',
    'film-title': 'Umplia for Cosmetics launch film',
    close: 'Close',
    transcript: 'Transcript and chapters (in Spanish)',
    'film-poster-alt': 'Umplia: cosmetic dossier validation for the Andean Community, in minutes. Colombia, Peru, Ecuador and Bolivia.',
  },
};

function fill(s, page) {
  const lang = page.lang;
  let out = s;
  for (let i = 0; i < 4 && /\{\{partial:/.test(out); i++) out = out.replace(/\{\{partial:([\w-]+)\}\}/g, (_, n) => partial(n, lang));
  out = out
    .replace(/\{\{t:([\w-]+)\}\}/g, (_, k) => {
      if (T[lang][k] === undefined) throw new Error(`build: unknown string ${k}`);
      return T[lang][k];
    })
    .replace(/\{\{faq:(\w+)\}\}/g, (_, set) => faqHtml(FAQ[lang][set]))
    .replace(/\{\{img:([^|}]+)\|([^|}]*)\|([^|}]+)(?:\|(\w+))?\}\}/g, (_, key, alt, sizes, flag) =>
      picture(key.trim(), alt.trim(), sizes.trim(), { eager: flag === 'eager' }),
    )
    .replace(/\{\{claim:(\w+)\}\}/g, (_, k) => {
      const v = CLAIMS[lang][k];
      if (v === undefined) throw new Error(`build: unknown claim ${k}`);
      return v;
    })
    .replace(/\{\{crumbs\}\}/g, crumbsHtml(page))
    .replace(/\{\{updated\}\}/g, `<time datetime="${page.updated}">${fmtDate(page.updated, lang)}</time>`)
    .replace(/\{\{demo\}\}/g, page.kind === 'home' ? '#acceso' : lang === 'es' ? '/demo' : '/en/demo')
    .replace(/\{\{alt-es\}\}/g, lang === 'es' ? page.path : page.alt ? byId[page.alt].path : '/')
    .replace(/\{\{alt-en\}\}/g, lang === 'en' ? page.path : page.alt ? byId[page.alt].path : '/en')
    .replace(/\{\{film:(\w+)\}\}/g, (_, k) => asset(VIDEO.film[k]))
    .replace(/\{\{loop:(\w+)\}\}/g, (_, k) => asset(VIDEO.loop[k]))
    .replace(/\{\{film-credit\}\}/g, lang === 'es' ? FILM.credit : FILM.creditEn)
    .replace(/\{\{chapters\}\}/g, () =>
      '<ol class="chapters">' +
      FILM.chapters
        .map((c) => `<li><button type="button" class="chapter" data-t="${c.start}"><span class="chapter-t">${Math.floor(c.start / 60)}:${String(c.start % 60).padStart(2, '0')}</span> ${c.title}</button></li>`)
        .join('') +
      '</ol>',
    )
    .replace(/\{\{transcript\}\}/g, () =>
      FILM.chapters
        .map((c) => `<h3 id="t-${c.start}">${Math.floor(c.start / 60)}:${String(c.start % 60).padStart(2, '0')} · ${c.title}</h3><p>${c.text}</p>`)
        .join(''),
    )
    .replace(/\{\{mailto\}\}/g, mailto)
    .replace(/\{\{email\}\}/g, EMAIL);
  out = assetTokens(out);
  const left = out.match(/\{\{[^}]*\}\}/);
  if (left) throw new Error(`build: unresolved token ${left[0]} in ${page.src}`);
  return out;
}

// ---------- 3. Head ----------
function head(page) {
  const u = url(page.path);
  const es = page.lang === 'es';
  const og = abs('img/' + (page.og || 'og-home.jpg'));
  const robots = page.noindex ? 'noindex, follow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
  const L = [];
  L.push('<meta charset="utf-8">');
  L.push('<meta name="viewport" content="width=device-width, initial-scale=1">');
  L.push(`<title>${esc(page.title)}</title>`);
  L.push(`<meta name="description" content="${esc(page.description)}">`);
  L.push(`<meta name="robots" content="${robots}">`);
  if (!page.noindex) {
    L.push(`<link rel="canonical" href="${u}">`);
    if (page.alt) {
      const other = byId[page.alt];
      const esP = es ? page : other;
      const enP = es ? other : page;
      L.push(`<link rel="alternate" hreflang="es" href="${url(esP.path)}">`);
      L.push(`<link rel="alternate" hreflang="en" href="${url(enP.path)}">`);
      L.push(`<link rel="alternate" hreflang="x-default" href="${url(esP.path)}">`);
    }
  }
  L.push('<meta name="theme-color" content="#ffffff">');
  L.push('<meta name="color-scheme" content="light">');
  L.push(`<link rel="preload" href="${asset('fonts/inter-latin-600.woff2')}" as="font" type="font/woff2" crossorigin>`);
  L.push(`<link rel="preload" href="${asset('fonts/inter-latin-400.woff2')}" as="font" type="font/woff2" crossorigin>`);
  L.push(`<link rel="stylesheet" href="${CSS}">`);
  if (page.kind === 'home') {
    const set = (ext) => IMAGES['hero-poster'].widths.map((w) => `${asset(`img/hero-poster-${w}.${ext}`)} ${w}w`).join(', ');
    L.push(`<link rel="preload" as="image" type="image/avif" imagesrcset="${set('avif')}" imagesizes="(min-width: 1360px) 1280px, 100vw" fetchpriority="high">`);
  }
  L.push('<link rel="icon" href="/favicon.ico" sizes="32x32">');
  L.push(`<link rel="icon" type="image/png" sizes="192x192" href="${asset('img/icon-192.png')}">`);
  L.push(`<link rel="apple-touch-icon" href="${asset('img/apple-touch-icon.png')}">`);
  L.push('<link rel="manifest" href="/site.webmanifest">');
  L.push(`<meta property="og:type" content="${page.kind === 'guide' || page.kind === 'video' ? 'article' : 'website'}">`);
  L.push('<meta property="og:site_name" content="Umplia">');
  L.push(`<meta property="og:locale" content="${es ? 'es_CO' : 'en_US'}">`);
  L.push(`<meta property="og:title" content="${esc(page.title)}">`);
  L.push(`<meta property="og:description" content="${esc(page.description)}">`);
  L.push(`<meta property="og:url" content="${u}">`);
  L.push(`<meta property="og:image" content="${og}">`);
  L.push('<meta property="og:image:width" content="1200">');
  L.push('<meta property="og:image:height" content="630">');
  L.push('<meta name="twitter:card" content="summary_large_image">');
  if (page.id === 'home') L.push(`<meta name="google-site-verification" content="${SITE.gsv}">`);
  if (!page.noindex) L.push(`<script type="application/ld+json">${JSON.stringify(graph(page, { abs, email: EMAIL, fill: (s) => s.replace(/\{\{mailto\}\}/g, EMAIL) })).replace(/</g, '\\u003c')}</script>`);
  L.push(`<script defer src="${JS}"></script>`);
  L.push('<script defer src="/_vercel/insights/script.js"></script>');
  return L.join('\n');
}

// ---------- 4. Pages ----------
const layout = read(join(SRC, 'layouts', 'base.html'));
const outFile = (p) => (p.path === '/' ? 'index.html' : p.path.replace(/^\//, '') + '.html');

for (const page of PAGES) {
  const body = read(join(SRC, 'pages', page.src));
  let nav = partial('nav', page.lang);
  // mark the current page in nav and footer
  const mark = (html) => html.split(`href="${page.path}"`).join(`href="${page.path}" aria-current="page"`);
  nav = mark(nav);
  const footer = mark(partial('footer', page.lang));
  const html = fill(
    layout
      .replace('{{head}}', () => head(page))
      .replace('{{nav}}', () => nav)
      .replace('{{content}}', () => body)
      .replace('{{footer}}', () => footer)
      .replace(/\{\{lang\}\}/g, page.lang)
      .replace('{{bodyclass}}', page.kind === 'home' ? 'is-home' : ''),
    page,
  );
  write(join(DIST, outFile(page)), html);
}

// ---------- 5. Static files, manifest, sitemap, llms.txt ----------
for (const rel of walk(join(SRC, 'static'))) {
  const from = join(SRC, 'static', rel);
  if (/\.(txt|xml|json|html|webmanifest)$/.test(rel)) write(join(DIST, rel), read(from).replace(/\{\{email\}\}/g, EMAIL).replace(/\{\{origin\}\}/g, SITE.origin));
  else copy(from, join(DIST, rel));
}

write(
  join(DIST, 'site.webmanifest'),
  JSON.stringify(
    {
      name: 'Umplia',
      short_name: 'Umplia',
      lang: 'es',
      start_url: '/',
      display: 'browser',
      background_color: '#ffffff',
      theme_color: '#ffffff',
      icons: [
        { src: asset('img/icon-192.png'), sizes: '192x192', type: 'image/png' },
        { src: asset('img/icon-512.png'), sizes: '512x512', type: 'image/png' },
      ],
    },
    null,
    2,
  ),
);

const indexable = PAGES.filter((p) => !p.noindex);
const sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">'];
for (const p of indexable) {
  sm.push('  <url>', `    <loc>${url(p.path)}</loc>`, `    <lastmod>${p.updated}</lastmod>`);
  if (p.alt) {
    const esP = p.lang === 'es' ? p : byId[p.alt];
    const enP = p.lang === 'es' ? byId[p.alt] : p;
    sm.push(`    <xhtml:link rel="alternate" hreflang="es" href="${url(esP.path)}"/>`);
    sm.push(`    <xhtml:link rel="alternate" hreflang="en" href="${url(enP.path)}"/>`);
    sm.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${url(esP.path)}"/>`);
  }
  if (p.kind === 'video') {
    sm.push(
      '    <video:video>',
      `      <video:thumbnail_loc>${abs('img/film-poster-1280.jpg')}</video:thumbnail_loc>`,
      `      <video:title>${esc(FILM.name)}</video:title>`,
      `      <video:description>${esc(FILM.description)}</video:description>`,
      `      <video:content_loc>${abs(FILM.file1080)}</video:content_loc>`,
      '      <video:duration>90</video:duration>',
      '      <video:publication_date>2026-11-23T08:00:00-05:00</video:publication_date>',
      '    </video:video>',
    );
  }
  sm.push('  </url>');
}
sm.push('</urlset>', '');
write(join(DIST, 'sitemap.xml'), sm.join('\n'));

const llmsTpl = read(join(SRC, 'llms.txt'));
const llmsSections = {};
for (const p of indexable) {
  if (!p.llms) continue;
  const [section, summary] = p.llms;
  (llmsSections[section] ||= []).push(`- [${p.title.replace(/ \| Umplia$/, '')}](${url(p.path)}): ${summary}`);
}
const llms = llmsTpl
  .replace(/\{\{email\}\}/g, EMAIL)
  .replace(/\{\{section:([^}]+)\}\}/g, (_, s) => (llmsSections[s] || []).join('\n'));
write(join(DIST, 'llms.txt'), llms);

// ---------- 6. Checks ----------
const problems = check(DIST, { email: EMAIL });
if (problems.length) {
  console.error(`\nbuild: ${problems.length} check(s) failed:`);
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}
console.log(`build: ok (${PAGES.length} pages, ${Object.keys(ASSET).length} assets)`);
