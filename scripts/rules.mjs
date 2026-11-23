// Content rules enforced on every built file. Patterns use word boundaries so ordinary words
// ("natural", "dicho", "copia") never trip them. Each rule: [regex, why].
import { createHash } from 'node:crypto';

const ES_EN = [
  [/—/u, 'raya (em dash): prohibida en todo el sitio'],
  [/\b90\s?%/u, 'cifra prohibida 90%'],
  [/\b3\+?\s?semanas\b/iu, 'cifra prohibida: semanas de revisión'],
  [/\b(hasta\s)?6 meses\b/iu, 'cifra prohibida: 6 meses'],
  [/\bprimera plataforma\b/iu, 'claim prohibido: primera plataforma'],
  [/\bfirst platform\b/iu, 'banned claim: first platform'],
  [/\b12\s?x\b/iu, 'cifra prohibida 12x'],
  [/\bfalsos? positivos?\b/iu, 'usa "hallazgos infundados"'],
  [/\bfalse positives?\b/iu, 'use "unfounded findings"'],
  [/\bgarantiza(mos|n)?\b/iu, 'sin garantías'],
  [/\bguarantee(s|d)?\b/iu, 'no guarantees'],
  [/\brevolucionari[oa]s?\b|\bdisruptiv[oa]s?\b|\brevolutionary\b|\bdisruptive\b/iu, 'lenguaje exagerado'],
  [/\bradique con certeza\b/iu, 'frase prohibida'],
  [/farmac[eé]utica y cosm[eé]tica/iu, 'alcance: solo cosméticos'],
  [/pharmaceutical and cosmetic/iu, 'scope: cosmetics only'],
  [/\bJohnny\b/u, 'el nombre es Johny'],
  [/\bOracle\b(?! Cloud)/u, 'Oracle solo como "Oracle Cloud"'],
  [/\b(DIGEMIT|AGEMET)\b/u, 'errata de la agencia'],
  [/\bICH\b|\bCTD\b|\bQ1A\b/u, 'visual farmacéutico'],
  [/\bUmplia ®/u, 'sin espacio antes de ®'],
  [/\bCOP\s?\$?\s?\d/u, 'precios'],
  [/\bUmplia (Hub|Intelligence|Monitor|Migrate|Submit)\b/u, 'nombres internos o no lanzados'],
  [/\bInvim[AÁ]gil\b.{0,40}\b(integra|integraci[oó]n|integrat)/iu, 'sin claims de integración'],
  [/\bdesde hoy\b|\bavailable today\b/iu, 'fecha explícita, no "desde hoy"'],
  [/292,83|306,30|UVB/u, 'tarifas del INVIMA no publicadas'],
  [/\bse quedan en Colombia\b/iu, 'usa "se guardan en Colombia"'],
  [/C:\\|C:\/Users|OneDrive|\/Users\/johny/iu, 'ruta local'],
  [/[\w.+-]+@(hotmail|gmail|outlook|yahoo|icloud)\.[a-z.]+/iu, 'correo personal'],
];

export const RULES = ES_EN;

/** Files where a rule does not apply on purpose. */
export const RULE_EXEMPT = {
  'correo personal': (file) => file.endsWith('.js'),
  // The launch page quotes the film's on-screen text ("Desde hoy.") inside a dated announcement.
  'fecha explícita, no "desde hoy"': (file) => file === 'lanzamiento.html',
  // demo captions (approved by Johny on 23 Nov 2026): the demo dossier is fictional and is created in Umplia Submit
  'nombres internos o no lanzados': (file) => /umplia-demo-es\.[0-9a-f]{8}\.vtt$/.test(file),
};

// Confidential names, prices and internal figures. This repository is public, so they are stored only as
// truncated SHA-256 hashes of the normalized term (lowercase, no accents). Words and word pairs are checked.
const SECRET = new Set([
  '33b38f651edfab34', '53b1d2bc3c986e62', 'ae39e5dc489d7c9e', '58791709158cf478', 'cb850b144c90639f',
  '729237d8be546932', '50df79aaa0d0b5fb', '334c18d0f36f45d8', '376806d15816976c', '40ff19f8b0df68d9',
  'e94f5c06ccc5c11a', '93c539931c0ca08f', '87aeed51238235d9', 'ae6646d7d278b87b', 'b250b8d86d08d883',
  'd139d77cc805122a', '3e24cd373cb6230b', '96ef50b6513e10da', 'c2c9c08ff549fe7a', '5204d5cb969d4e29',
  '252ae024b06a1f6a', 'fe6d122e7f55e2ff', 'a090f8df17996a70', '74598ab640a3c9cd', '32e224c74ab599ec',
  '1406ac8eb64afbd3',
]);
const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’`]/g, "'");
const h = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16);

/** Returns the first confidential term found (as it appears in the text), or null. */
export function secretHit(textIn) {
  const words = (textIn.match(/[\p{L}\p{N}'’.,-]+/gu) || []).map((w) => w.replace(/^[.,'’-]+|[.,'’-]+$/g, ''));
  for (let i = 0; i < words.length; i++) {
    const w = norm(words[i]);
    if (w && SECRET.has(h(w))) return words[i];
    if (i + 1 < words.length && SECRET.has(h(w + ' ' + norm(words[i + 1])))) return words[i] + ' ' + words[i + 1];
  }
  return null;
}
