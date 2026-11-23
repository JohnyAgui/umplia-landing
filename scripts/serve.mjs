// Tiny local server for dist/ that mimics Vercel's cleanUrls (no dependencies). `npm run serve` -> http://localhost:4321
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const PORT = Number(process.env.PORT || 4321);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.vtt': 'text/vtt',
};

async function exists(p) {
  try { return (await stat(p)).isFile(); } catch { return false; }
}

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path !== '/' && path.endsWith('/')) { res.writeHead(308, { Location: path.slice(0, -1) }); return res.end(); }
  if (path.endsWith('.html')) { res.writeHead(308, { Location: path.slice(0, -5) || '/' }); return res.end(); }
  let file = join(DIST, path === '/' ? 'index.html' : path);
  if (!(await exists(file))) file = join(DIST, path + '.html');
  let status = 200;
  if (!(await exists(file))) { file = join(DIST, '404.html'); status = 404; }
  const body = await readFile(file);
  const type = TYPES[extname(file)] || 'application/octet-stream';
  const range = req.headers.range;
  if (range && type === 'video/mp4') {
    const [s, e] = range.replace('bytes=', '').split('-');
    const start = Number(s);
    const end = e ? Number(e) : body.length - 1;
    res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${body.length}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
    return res.end(body.subarray(start, end + 1));
  }
  res.writeHead(status, { 'Content-Type': type, 'Content-Length': body.length, 'Cache-Control': 'no-store', 'Accept-Ranges': 'bytes' });
  res.end(body);
}).listen(PORT, () => console.log(`serving dist on http://localhost:${PORT}`));
