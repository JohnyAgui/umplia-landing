import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, copyFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';

export const read = (p) => readFileSync(p, 'utf8');

export function write(p, data) {
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, data);
}

export function copy(from, to) {
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
}

export const hash8 = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 8);

/** Every file under dir, as forward-slash paths relative to dir. */
export function walk(dir) {
  const out = [];
  const rec = (d) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) rec(p);
      else out.push(relative(dir, p).split(sep).join('/'));
    }
  };
  rec(dir);
  return out.sort();
}

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Strip tags for plain-text uses (JSON-LD, llms.txt). */
export const text = (html) =>
  String(html)
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
