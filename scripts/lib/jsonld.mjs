import { SITE, byId, url } from '../../src/site.mjs';
import { FAQ } from '../../src/data/faq.mjs';
import { FILM } from '../../src/data/film.mjs';
import { text } from './util.mjs';

const ORG = `${SITE.origin}/#organization`;
const WEB = `${SITE.origin}/#website`;
const SOFT = `${SITE.origin}/cosmeticos#software`;
const PERSON = `${SITE.origin}/nosotros#johny-aguilar`;

const COUNTRIES = [
  ['Colombia', 'CO'],
  ['Perú', 'PE'],
  ['Ecuador', 'EC'],
  ['Bolivia', 'BO'],
].map(([name, code]) => ({ '@type': 'Country', name, identifier: code }));

function organization(ctx) {
  return {
    '@type': 'Organization',
    '@id': ORG,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.origin + '/',
    logo: { '@type': 'ImageObject', url: ctx.abs('img/icon-512.png'), width: 512, height: 512 },
    email: ctx.email,
    description:
      'Umplia desarrolla Umplia® para Cosméticos, un software que valida dossiers regulatorios de cosméticos antes de radicarlos ante INVIMA, DIGEMID, ARCSA y AGEMED.',
    founder: { '@type': 'Person', '@id': PERSON, name: 'Johny Aguilar', url: url('/nosotros') + '#johny-aguilar' },
    address: { '@type': 'PostalAddress', addressLocality: 'Bogotá', addressCountry: 'CO' },
    areaServed: COUNTRIES,
    knowsAbout: [
      'Notificación Sanitaria Obligatoria (NSO)',
      'Decisión 833 de la Comunidad Andina',
      'Dossiers regulatorios de cosméticos',
      'Asuntos regulatorios de cosméticos',
      'INVIMA',
      'DIGEMID',
      'ARCSA',
      'AGEMED',
      'Nomenclatura INCI',
    ],
    sameAs: [SITE.linkedin],
  };
}

function website() {
  return {
    '@type': 'WebSite',
    '@id': WEB,
    url: SITE.origin + '/',
    name: SITE.name,
    inLanguage: ['es', 'en'],
    publisher: { '@id': ORG },
  };
}

function software(lang) {
  const es = lang === 'es';
  return {
    '@type': 'SoftwareApplication',
    '@id': SOFT,
    name: es ? 'Umplia para Cosméticos' : 'Umplia for Cosmetics',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: es ? 'Validación de dossiers regulatorios de cosméticos' : 'Cosmetic regulatory dossier validation',
    operatingSystem: 'Web',
    url: url(es ? '/cosmeticos' : '/en/cosmetics'),
    description: es
      ? 'Valida dossiers de Notificación Sanitaria Obligatoria (NSO) de cosméticos antes de radicarlos: coherencia entre documentos (validación interna) y cumplimiento de la Decisión 833 y de los requisitos de INVIMA, DIGEMID, ARCSA y AGEMED (validación externa).'
      : 'Validates cosmetic Mandatory Health Notification (NSO) dossiers before filing: consistency across documents (internal validation) and compliance with Andean Decision 833 and the requirements of INVIMA, DIGEMID, ARCSA and AGEMED (external validation).',
    featureList: es
      ? ['Módulo Nuevas NSO', 'Módulo Modificaciones (19 tipos de modificación)', 'Validación interna', 'Validación externa', 'Reporte con hallazgos por impacto alto, medio y bajo']
      : ['New NSO module', 'Modifications module (19 modification types)', 'Internal validation', 'External validation', 'Report with high, medium and low impact findings'],
    areaServed: COUNTRIES,
    datePublished: SITE.launch,
    provider: { '@id': ORG },
    publisher: { '@id': ORG },
  };
}

function person(ctx, lang) {
  const es = lang === 'es';
  return {
    '@type': 'Person',
    '@id': PERSON,
    name: 'Johny Aguilar',
    jobTitle: es ? 'Cofundador y CEO' : 'Co-founder and CEO',
    worksFor: { '@id': ORG },
    image: ctx.abs('img/johny-aguilar-960.jpg'),
    alumniOf: [
      { '@type': 'CollegeOrUniversity', name: 'Esade Business School' },
      { '@type': 'CollegeOrUniversity', name: 'Pontificia Universidad Javeriana' },
    ],
    homeLocation: { '@type': 'Place', name: 'Bogotá, Colombia' },
    sameAs: [SITE.founderLinkedin],
  };
}

function breadcrumbs(page) {
  if (!page.crumbs) return null;
  const items = [[page.lang === 'es' ? 'Inicio' : 'Home', page.lang === 'es' ? '/' : '/en'], ...page.crumbs];
  return {
    '@type': 'BreadcrumbList',
    '@id': url(page.path) + '#breadcrumb',
    itemListElement: items.map(([name, path], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      ...(path ? { item: url(path) } : {}),
    })),
  };
}

export function graph(page, ctx) {
  const pageUrl = url(page.path);
  const typeByKind = { about: 'AboutPage', faq: 'FAQPage', demo: 'ContactPage', legal: 'WebPage', guide: 'WebPage', video: 'WebPage' };
  const webpage = {
    '@type': typeByKind[page.kind] || 'WebPage',
    '@id': pageUrl + '#webpage',
    url: pageUrl,
    name: page.title,
    description: page.description,
    inLanguage: page.lang,
    isPartOf: { '@id': WEB },
    dateModified: page.updated,
    primaryImageOfPage: { '@type': 'ImageObject', url: ctx.abs('img/' + (page.og || 'og-home.jpg')) },
  };
  const nodes = [organization(ctx), website(), webpage];
  const bc = breadcrumbs(page);
  if (bc) {
    webpage.breadcrumb = { '@id': bc['@id'] };
    nodes.push(bc);
  }
  if (page.kind === 'home' || page.software) {
    nodes.push(software(page.lang));
    webpage.about = { '@id': SOFT };
  }
  if (page.kind === 'about') {
    nodes.push(person(ctx, page.lang));
    webpage.about = { '@id': ORG };
    webpage.mainEntity = { '@id': ORG };
  }
  if (page.kind === 'faq') {
    webpage.mainEntity = FAQ.es.full.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: ctx.fill(text(a)) },
    }));
  }
  if (page.kind === 'guide') {
    nodes.push({
      '@type': 'Article',
      '@id': pageUrl + '#article',
      headline: page.headline,
      description: page.description,
      inLanguage: page.lang,
      datePublished: page.published,
      dateModified: page.updated,
      author: { '@id': ORG },
      publisher: { '@id': ORG },
      mainEntityOfPage: { '@id': pageUrl + '#webpage' },
      image: ctx.abs('img/og-home.jpg'),
      about: [
        { '@type': 'Thing', name: 'Notificación Sanitaria Obligatoria de cosméticos' },
        { '@type': 'Legislation', name: 'Decisión 833 de la Comunidad Andina', legislationIdentifier: 'Decisión 833' },
      ],
    });
  }
  if (page.kind === 'tools') {
    nodes.push({
      '@type': 'SoftwareApplication',
      '@id': pageUrl + '#software',
      name: 'Umplia Tools',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Windows 10, Windows 11, macOS 13 o posterior',
      description:
        'Programa gratuito con herramientas para trámites ante el INVIMA: Divisor de PDF, Armar PDF, Comprimir PDF y Comprimir y dividir. Funciona sin internet.',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      downloadUrl: SITE.toolsUrl,
      inLanguage: 'es',
      provider: { '@id': ORG },
    });
    webpage.about = { '@id': pageUrl + '#software' };
  }
  if (page.kind === 'video') {
    const vid = {
      '@type': 'VideoObject',
      '@id': pageUrl + '#video',
      name: FILM.name,
      description: FILM.description,
      thumbnailUrl: [ctx.abs('img/film-poster-1280.jpg')],
      uploadDate: '2026-11-23T08:00:00-05:00',
      duration: 'PT1M30S',
      contentUrl: ctx.abs(FILM.file1080),
      inLanguage: 'es',
      publisher: { '@id': ORG },
      transcript: FILM.chapters.map((c) => c.text).join(' '),
      hasPart: FILM.chapters.map((c, i) => ({
        '@type': 'Clip',
        name: c.title,
        startOffset: c.start,
        endOffset: FILM.chapters[i + 1] ? FILM.chapters[i + 1].start : 90,
        url: `${pageUrl}?t=${c.start}#video`,
      })),
    };
    nodes.push(vid, {
      '@type': 'Article',
      '@id': pageUrl + '#article',
      headline: page.headline,
      description: page.description,
      inLanguage: 'es',
      datePublished: page.published,
      dateModified: page.updated,
      author: { '@id': ORG },
      publisher: { '@id': ORG },
      mainEntityOfPage: { '@id': pageUrl + '#webpage' },
      image: ctx.abs('img/og-lanzamiento.jpg'),
      video: { '@id': vid['@id'] },
    });
  }
  return { '@context': 'https://schema.org', '@graph': nodes };
}
