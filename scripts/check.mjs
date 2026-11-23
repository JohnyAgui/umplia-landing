// Content and SEO gate. Runs inside the build on dist/; also runnable alone: `node scripts/check.mjs`.
import { existsSync, statSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { walk } from './lib/util.mjs';
import { RULES, RULE_EXEMPT, secretHit } from './rules.mjs';
import { PAGES, byId, url, SITE } from '../src/site.mjs';

const FORMSPREE = 'https://formspree.io/f/xdalqnkp';
const FORM_KEYS = ['nombre', 'apellido', 'empresa', 'email', 'celular', 'source'];
const HOME_ANCHORS = ['problema', 'producto', 'proceso', 'cobertura', 'acceso'];
const NOTES = ['*Basado en piloto con empresa multilatina.', '*Based on a pilot with a multi-Latin company.'];
const KB = 1024;
const BUDGET = { html: 60 * KB, css: 35 * KB, js: 12 * KB };
const VIDEO_BUDGET = [
  [/hero-1920\.[0-9a-f]{8}\.mp4$/, 3.5 * KB * KB],
  [/hero-1280\.[0-9a-f]{8}\.mp4$/, 2 * KB * KB],
  [/hero-1920\.av1\.[0-9a-f]{8}\.mp4$/, 1.8 * KB * KB],
  [/hero-1280\.av1\.[0-9a-f]{8}\.mp4$/, 1 * KB * KB],
  [/umplia-lanzamiento-1080p\.[0-9a-f]{8}\.mp4$/, 40 * KB * KB],
];

const outFile = (p) => (p.path === '/' ? 'index.html' : p.path.replace(/^\//, '') + '.html');

export function check(dist, { email } = {}) {
  const P = [];
  const files = walk(dist);
  const fileSet = new Set(files.map((f) => '/' + f));
  const html = {};
  for (const p of PAGES) {
    const f = join(dist, outFile(p));
    if (!existsSync(f)) P.push(`missing page ${p.path}`);
    else html[p.id] = readFileSync(f, 'utf8');
  }

  // 1. content rules on every text file
  for (const f of files) {
    if (!/\.(html|txt|xml|js|css|json|webmanifest|vtt)$/.test(f)) continue;
    const s = readFileSync(join(dist, f), 'utf8');
    for (const [re, why] of RULES) {
      if (RULE_EXEMPT[why] && RULE_EXEMPT[why](f)) continue;
      const m = s.match(re);
      if (m) {
        const i = m.index;
        P.push(`${f}: "${m[0]}" (${why}) …${s.slice(Math.max(0, i - 50), i + 50).replace(/\s+/g, ' ')}…`);
      }
    }
    const hit = f.endsWith('.js') || /umplia-demo-es\.[0-9a-f]{8}\.vtt$/.test(f) ? null : secretHit(s);
    if (hit) P.push(`${f}: confidential term "${hit}"`);
    if (f.endsWith('.html') && statSync(join(dist, f)).size > BUDGET.html) P.push(`${f}: HTML over ${BUDGET.html / KB} KB`);
    if (f.endsWith('.css') && statSync(join(dist, f)).size > BUDGET.css) P.push(`${f}: CSS over budget`);
    if (f.endsWith('.js') && statSync(join(dist, f)).size > BUDGET.js) P.push(`${f}: JS over budget`);
  }
  for (const f of files) for (const [re, max] of VIDEO_BUDGET) if (re.test(f) && statSync(join(dist, f)).size > max) P.push(`${f}: video over budget`);

  // 2. per-page structure
  const ids = {};
  for (const p of PAGES) {
    const s = html[p.id];
    if (!s) continue;
    const where = p.path;
    ids[p.path] = new Set([...s.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    const h1 = (s.match(/<h1[\s>]/g) || []).length;
    if (h1 !== 1) P.push(`${where}: ${h1} <h1> (need 1)`);
    const title = (s.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
    if (!title) P.push(`${where}: no <title>`);
    if (title.length > 62) P.push(`${where}: title ${title.length} chars`);
    if (/®/.test(title)) P.push(`${where}: ® in <title>`);
    const desc = (s.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
    if (!desc || desc.length > 160) P.push(`${where}: meta description length ${desc.length}`);
    if (/®/.test(desc)) P.push(`${where}: ® in meta description`);
    if (!p.noindex) {
      if (!s.includes(`<link rel="canonical" href="${url(p.path)}">`)) P.push(`${where}: canonical`);
      if (!/Umplia®/.test(s.replace(/<head>[\s\S]*<\/head>/, ''))) P.push(`${where}: no Umplia® in body`);
      if (p.alt) {
        const o = byId[p.alt];
        if (o.alt !== p.id) P.push(`${where}: hreflang pair not reciprocal (${p.alt})`);
        if (!s.includes(`hreflang="${o.lang}" href="${url(o.path)}"`)) P.push(`${where}: missing hreflang ${o.lang}`);
      }
      const ld = [...s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
      if (ld.length !== 1) P.push(`${where}: ${ld.length} JSON-LD blocks`);
      for (const m of ld) {
        try {
          const g = JSON.parse(m[1]);
          const defined = new Set();
          const refs = [];
          const visit = (o) => {
            if (Array.isArray(o)) return o.forEach(visit);
            if (o && typeof o === 'object') {
              const keys = Object.keys(o);
              if (o['@id'] && keys.length > 1) defined.add(o['@id']);
              if (o['@id'] && keys.length === 1) refs.push(o['@id']);
              keys.forEach((k) => visit(o[k]));
            }
          };
          visit(g['@graph']);
          for (const r of refs) if (!defined.has(r)) P.push(`${where}: JSON-LD @id not resolved: ${r}`);
        } catch (e) {
          P.push(`${where}: JSON-LD does not parse (${e.message})`);
        }
      }
    }
    // images
    for (const m of s.matchAll(/<img\b[^>]*>/g)) {
      const tag = m[0];
      if (!/\salt="/.test(tag)) P.push(`${where}: <img> without alt: ${tag.slice(0, 80)}`);
      if (!/\swidth="\d+"/.test(tag) || !/\sheight="\d+"/.test(tag)) P.push(`${where}: <img> without width/height: ${tag.slice(0, 80)}`);
    }
    if (/\sdata-en=/.test(s)) P.push(`${where}: data-en attribute`);
    if (/\sstyle="/.test(s)) P.push(`${where}: inline style attribute`);
    for (const m of s.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
      if (/type="application\/ld\+json"/.test(m[1])) continue;
      if (!/\ssrc="/.test(m[1]) || m[2].trim()) P.push(`${where}: inline script`);
    }
    if (/27x/.test(s) && !NOTES.some((n) => s.includes(n))) P.push(`${where}: "27x" without its footnote`);
    if (email && !s.includes(`href="mailto:${email}"`)) P.push(`${where}: no mailto link`);
    if (!s.includes(SITE.linkedin)) P.push(`${where}: no LinkedIn link`);
  }

  // 3. internal links and anchors
  const pathSet = new Set(PAGES.map((p) => p.path));
  for (const p of PAGES) {
    const s = html[p.id];
    if (!s) continue;
    for (const m of s.matchAll(/\s(href|src|srcset|poster|content)="([^"]+)"/g)) {
      for (const raw of m[2].split(',').map((x) => x.trim().split(' ')[0])) {
        if (!raw.startsWith('/') || raw.startsWith('//')) {
          if (m[1] === 'href' && raw.startsWith('#')) {
            if (raw.length > 1 && !ids[p.path].has(raw.slice(1))) P.push(`${p.path}: anchor ${raw} not found`);
          }
          continue;
        }
        if (raw.startsWith('/_vercel/')) continue;
        const [pathPart, anchor] = raw.split('#');
        const clean = pathPart.split('?')[0];
        if (clean.startsWith('/assets/') || /\.(ico|webmanifest|txt|xml)$/.test(clean)) {
          if (!fileSet.has(clean)) P.push(`${p.path}: missing file ${clean}`);
          continue;
        }
        if (!pathSet.has(clean)) P.push(`${p.path}: broken link ${raw}`);
        else if (anchor && ids[clean] && !ids[clean].has(anchor)) P.push(`${p.path}: broken anchor ${raw}`);
      }
    }
  }

  // 4. invariants
  const home = html.home || '';
  if (!home.includes(`content="${SITE.gsv}"`)) P.push('home: google-site-verification changed');
  for (const a of HOME_ANCHORS) if (!ids['/']?.has(a)) P.push(`home: anchor #${a} missing`);
  for (const id of ['home', 'demo', 'en-home', 'en-demo']) {
    const s = html[id] || '';
    if (!s.includes(`action="${FORMSPREE}"`)) P.push(`${id}: form action is not the Formspree endpoint`);
    for (const k of ['nombre', 'apellido', 'empresa', 'email', 'celular']) if (!s.includes(`name="${k}"`)) P.push(`${id}: form field ${k} missing`);
    if (!s.includes('name="source" value="umplia.com landing page"')) P.push(`${id}: source value changed`);
  }
  const js = files.find((f) => /^assets\/site\.[0-9a-f]{8}\.js$/.test(f));
  if (!js) P.push('site.js missing');
  else {
    const s = readFileSync(join(dist, js), 'utf8');
    if (!s.includes(FORMSPREE)) P.push('site.js: Formspree endpoint missing');
    for (const k of FORM_KEYS) if (!new RegExp(`\\b${k}\\b`).test(s)) P.push(`site.js: key ${k} missing`);
    if (!s.includes('FREE_PROVIDERS')) P.push('site.js: corporate-email gate missing');
  }

  // 5. sitemap matches the registry
  const sm = existsSync(join(dist, 'sitemap.xml')) ? readFileSync(join(dist, 'sitemap.xml'), 'utf8') : '';
  const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
  const want = PAGES.filter((p) => !p.noindex).map((p) => url(p.path)).sort();
  if (JSON.stringify(locs) !== JSON.stringify(want)) P.push('sitemap.xml does not match the page registry');
  for (const f of ['robots.txt', 'llms.txt', 'favicon.ico', 'site.webmanifest', '404.html', '.well-known/security.txt']) if (!fileSet.has('/' + f)) P.push(`missing ${f}`);

  return P;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
  const problems = check(dist, { email: process.env.CONTACT_EMAIL });
  for (const p of problems) console.error('- ' + p);
  console.log(problems.length ? `${problems.length} problem(s)` : 'check: ok');
  process.exit(problems.length ? 1 : 0);
}
