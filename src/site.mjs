// Single page registry. Head tags, JSON-LD, hreflang, sitemap.xml and llms.txt are all generated from here,
// so they cannot drift from each other. `updated` is the date of the last real content change (sitemap lastmod).

export const SITE = {
  origin: 'https://www.umplia.com',
  name: 'Umplia',
  legalName: 'Umplia, Inc.',
  linkedin: 'https://www.linkedin.com/company/umplia/',
  founderLinkedin: 'https://www.linkedin.com/in/johnyaguilarcustomersuccess/',
  toolsUrl: 'https://app.umplia.com/tools',
  launch: '2026-11-23',
  gsv: '6DrOUIQyfwenfchEwDocyejNcKbzNcxcVED6Dw6bM1s',
};

const D = '2026-11-23';

/**
 * kind: home | page | about | guide | faq | video | tools | legal | demo | 404
 * llms: [section, one-line summary] for llms.txt (omit to leave the page out)
 */
export const PAGES = [
  // ---------- Español ----------
  {
    id: 'home', lang: 'es', path: '/', src: 'es/index.html', kind: 'home', alt: 'en-home', updated: D, og: 'og-home.jpg',
    title: 'Umplia para Cosméticos | Valida tu NSO antes de radicar',
    description: 'Umplia valida dossiers de cosméticos para Nuevas NSO y Modificaciones antes de radicar ante INVIMA, DIGEMID, ARCSA y AGEMED. Agenda una demo.',
    llms: ['Producto', 'qué valida, para quién y en qué países.'],
  },
  {
    id: 'nuevas-nso', lang: 'es', path: '/cosmeticos/nuevas-nso', src: 'es/cosmeticos/nuevas-nso.html', kind: 'page', updated: D,
    title: 'Nuevas NSO: revisa tu dossier antes de radicar | Umplia',
    description: 'El módulo Nuevas NSO revisa el dossier completo de una nueva NSO de cosméticos: coherencia entre documentos y cumplimiento de la norma andina.',
    crumbs: [['Nuevas NSO', '/cosmeticos/nuevas-nso']],
    software: true,
    llms: ['Producto', 'validación del dossier completo de una nueva NSO.'],
  },
  {
    id: 'modificaciones', lang: 'es', path: '/cosmeticos/modificaciones', src: 'es/cosmeticos/modificaciones.html', kind: 'page', updated: D,
    title: 'Modificaciones de NSO: revisa cada cambio | Umplia',
    description: 'El módulo Modificaciones revisa los cambios a una NSO de cosméticos ya otorgada, con la misma validación interna y externa. Cubre 19 tipos de modificación.',
    crumbs: [['Modificaciones', '/cosmeticos/modificaciones']],
    software: true,
    llms: ['Producto', 'validación de cambios a NSO ya otorgadas (19 tipos de modificación).'],
  },
  {
    id: 'recursos', lang: 'es', path: '/recursos', src: 'es/recursos/index.html', kind: 'page', updated: D,
    title: 'Recursos para asuntos regulatorios de cosméticos | Umplia',
    description: 'Umplia Tools, herramientas gratuitas para tus PDF del INVIMA, y preguntas frecuentes sobre Umplia y la NSO de cosméticos.',
    crumbs: [['Recursos', '/recursos']],
  },
  {
    id: 'umplia-tools', lang: 'es', path: '/recursos/umplia-tools', src: 'es/recursos/umplia-tools.html', kind: 'tools', updated: D,
    title: 'Umplia Tools: herramientas gratis para tus PDF del INVIMA',
    description: 'Divide, arma y comprime los PDF de tus trámites ante el INVIMA sin internet. Umplia Tools es gratis para Windows y macOS.',
    crumbs: [['Recursos', '/recursos'], ['Umplia Tools', '/recursos/umplia-tools']],
    llms: ['Recursos', 'programa gratuito para dividir, armar y comprimir PDF de trámites ante el INVIMA, sin internet.'],
  },
  {
    id: 'faq', lang: 'es', path: '/recursos/preguntas-frecuentes', src: 'es/recursos/preguntas-frecuentes.html', kind: 'faq', updated: D,
    title: 'Preguntas frecuentes sobre Umplia y la NSO | Umplia',
    description: 'Qué valida Umplia, en qué países funciona, qué módulos tiene y qué es la NSO de cosméticos.',
    crumbs: [['Recursos', '/recursos'], ['Preguntas frecuentes', '/recursos/preguntas-frecuentes']],
    llms: ['Guías', 'respuestas sobre el producto y la NSO.'],
  },
  {
    id: 'nosotros', lang: 'es', path: '/nosotros', src: 'es/nosotros.html', kind: 'about', alt: 'en-about', updated: D, og: 'og-nosotros.jpg',
    title: 'Acerca de Umplia: propósito y equipo',
    description: 'Umplia, Inc. desarrolla Umplia, la plataforma que valida dossiers de cosméticos antes de radicar en la CAN. Conoce a Johny Aguilar, cofundador y CEO.',
    crumbs: [['Nosotros', '/nosotros']],
    llms: ['Empresa', 'propósito, historia, equipo y datos de la empresa.'],
  },
  {
    id: 'demo', lang: 'es', path: '/demo', src: 'es/demo.html', kind: 'demo', alt: 'en-demo', updated: D,
    title: 'Agenda una demo de Umplia',
    description: 'Te mostramos Umplia con un dossier de ejemplo y resolvemos tus preguntas sobre tus NSO de cosméticos.',
    crumbs: [['Agenda una demo', '/demo']],
    llms: ['Empresa', 'formulario para agendar una demo.'],
  },
  {
    id: 'privacidad', lang: 'es', path: '/privacidad', src: 'es/privacidad.html', kind: 'legal', alt: 'en-privacy', updated: D,
    title: 'Política de tratamiento de datos personales | Umplia',
    description: 'Cómo trata Umplia, Inc. los datos personales que recibe en umplia.com, para qué los usa y cómo ejercer tus derechos.',
    crumbs: [['Privacidad', '/privacidad']],
  },
  {
    id: '404', lang: 'es', path: '/404', src: '404.html', kind: '404', updated: D, noindex: true,
    title: 'Página no encontrada | Umplia',
    description: 'La página que buscas no existe.',
  },

  // ---------- English ----------
  {
    id: 'en-home', lang: 'en', path: '/en', src: 'en/index.html', kind: 'home', alt: 'home', updated: D, og: 'og-home.jpg',
    title: 'Umplia for Cosmetics | Validate your NSO before you file',
    description: 'Umplia validates cosmetic dossiers for New NSOs and Modifications before you file with INVIMA, DIGEMID, ARCSA and AGEMED. Book a demo.',
    llms: ['English', 'Umplia for Cosmetics.'],
  },
  {
    id: 'en-about', lang: 'en', path: '/en/about', src: 'en/about.html', kind: 'about', alt: 'nosotros', updated: D, og: 'og-nosotros.jpg',
    title: 'About Umplia: purpose and team',
    description: 'Umplia, Inc. builds Umplia, the platform that validates cosmetic dossiers before filing in the Andean Community. Meet Johny Aguilar, co-founder and CEO.',
    crumbs: [['About', '/en/about']],
    llms: ['English', 'About.'],
  },
  {
    id: 'en-demo', lang: 'en', path: '/en/demo', src: 'en/demo.html', kind: 'demo', alt: 'demo', updated: D,
    title: 'Book a demo of Umplia',
    description: 'We show you Umplia on a sample dossier and answer your questions about your cosmetic NSOs.',
    crumbs: [['Book a demo', '/en/demo']],
    llms: ['English', 'Book a demo.'],
  },
  {
    id: 'en-privacy', lang: 'en', path: '/en/privacy', src: 'en/privacy.html', kind: 'legal', alt: 'privacidad', updated: D,
    title: 'Personal data policy | Umplia',
    description: 'How Umplia, Inc. handles the personal data it receives on umplia.com, what it is used for and how to exercise your rights.',
    crumbs: [['Privacy', '/en/privacy']],
  },
];

export const byId = Object.fromEntries(PAGES.map((p) => [p.id, p]));
export const url = (path) => SITE.origin + (path === '/' ? '/' : path);
