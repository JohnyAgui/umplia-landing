// Visible Q&A. Answers are HTML; tokens ({{mailto}}) are filled by the build.
// The same text feeds the FAQPage JSON-LD on /recursos/preguntas-frecuentes, so markup always matches the page.

const es = {
  que: ['¿Qué es Umplia?', 'Umplia® para Cosméticos es un software que valida dossiers de Notificación Sanitaria Obligatoria (NSO) de cosméticos antes de radicarlos ante INVIMA (Colombia), DIGEMID (Perú), ARCSA (Ecuador) y AGEMED (Bolivia). Lo desarrolla Umplia, Inc. y está disponible desde el 23 de noviembre de 2026.'],
  revisa: ['¿Qué revisa Umplia en un dossier?', 'Hace dos validaciones. La validación interna verifica la consistencia de la información en todos los documentos del dossier: fórmula, rotulado, especificaciones, estabilidad y declaraciones del fabricante. La validación externa comprueba que el dossier cumpla la Decisión 833 y sus modificaciones, los requisitos de cada autoridad, la nomenclatura INCI y los listados de referencia. El resultado es un reporte con los hallazgos priorizados por impacto alto, medio y bajo.'],
  modulos: ['¿Qué módulos tiene Umplia?', 'Dos. <a href="/cosmeticos/nuevas-nso">Nuevas NSO</a> revisa el dossier completo de una nueva NSO. <a href="/cosmeticos/modificaciones">Modificaciones</a> revisa los cambios a una NSO ya otorgada y cubre 19 tipos de modificación.'],
  renov: ['¿Umplia cubre renovaciones de NSO?', 'No. Hoy Umplia cubre Nuevas NSO y Modificaciones.'],
  paises: ['¿En qué países funciona?', 'En los cuatro países de la Comunidad Andina: Colombia (INVIMA), Perú (DIGEMID), Ecuador (ARCSA) y Bolivia (AGEMED). Los cuatro comparten el régimen armonizado de la Decisión 833 y cada autoridad tiene requisitos propios.'],
  tarda: ['¿Cuánto tarda la revisión?', 'Umplia revisa un dossier de nueva NSO en 35 minutos en promedio. La revisión manual de un dossier completo toma de 8 a 9 horas.'],
  reemplaza: ['¿Umplia reemplaza al profesional de Asuntos Regulatorios?', 'No. Umplia nunca inventa datos: cuando los documentos no coinciden, te muestra cuáles coinciden y cuál difiere, y el analista decide sobre cada hallazgo. Lo que no se puede leer con claridad queda marcado como «Requiere revisión humana».'],
  radica: ['¿Umplia radica el trámite por mí?', 'No. Umplia revisa el dossier antes de que lo radiques en la plataforma de la autoridad sanitaria. La radicación la sigue haciendo tu equipo.'],
  requer: ['¿Con Umplia ya no habrá requerimientos?', 'Nadie puede prometer eso. Umplia encuentra los hallazgos antes de radicar para que los corrijas a tiempo; la decisión sobre el trámite es de la autoridad sanitaria.'],
  donde: ['¿Dónde se guardan mis dossiers?', 'Los dossiers se guardan en Colombia (Oracle Cloud, región Bogotá), cifrados en reposo. Los analiza un modelo de IA de código abierto que opera Umplia: no se envían a ChatGPT, Gemini ni Claude y no se usan para entrenar el modelo.'],
  ia: ['¿Umplia usa ChatGPT u otra IA externa?', 'No. Los dossiers los analiza un modelo de IA de código abierto que opera Umplia. No se envían a ChatGPT, Gemini ni Claude y no se usan para entrenar el modelo.'],
  farma: ['¿Sirve para laboratorios farmacéuticos?', 'Sí, para las NSO de cosméticos que notifican. Umplia para Cosméticos no cubre registros sanitarios de medicamentos.'],
  precio: ['¿Cuánto cuesta Umplia?', 'Depende de tu volumen de trámites y de los módulos que necesites. Lo conversamos en la demo.'],
  demo: ['¿Cómo agendo una demo?', 'Llena el formulario en <a href="/demo">umplia.com/demo</a> o escríbenos a {{mailto}}. Te mostramos Umplia con un dossier de ejemplo.'],
  tools: ['¿Qué es Umplia Tools?', 'Un programa gratuito con herramientas para tus trámites ante el INVIMA: Divisor de PDF, Armar PDF, Comprimir PDF y Comprimir y dividir. Funciona sin internet, en Windows y macOS. <a href="/recursos/umplia-tools">Conoce Umplia Tools</a>.'],
  nso: ['¿Qué es la NSO de cosméticos?', 'La Notificación Sanitaria Obligatoria es la comunicación, con carácter de declaración jurada, con la que el titular informa a la autoridad sanitaria que comercializará un cosmético en un país de la Comunidad Andina. <a href="/recursos/guias/nso-cosmeticos-comunidad-andina">Lee la guía completa</a>.'],
  vigencia: ['¿Cuánto dura una NSO?', 'Siete años desde la fecha del código, renovables por periodos iguales, según el Art. 18 de la Decisión 833.'],
  d833: ['¿Qué es la Decisión 833?', 'Es la norma de la Comunidad Andina que armoniza la regulación de los productos cosméticos en Colombia, Perú, Ecuador y Bolivia. Aplica desde el 1 de marzo de 2021. La Decisión 944 de 2025 reemplazó su Art. 9, la lista de requisitos de la NSO.'],
};

const en = {
  que: ['What is Umplia?', 'Umplia® for Cosmetics is software that validates cosmetic Mandatory Health Notification (NSO) dossiers before they are filed with INVIMA (Colombia), DIGEMID (Peru), ARCSA (Ecuador) and AGEMED (Bolivia). It is built by Umplia, Inc. and has been available since 23 November 2026.'],
  revisa: ['What does Umplia check in a dossier?', 'It runs two validations. Internal validation checks that the documents say the same thing: formula, label, specifications, stability and manufacturer declarations. External validation checks the dossier against Decision 833 and its amendments, each authority’s requirements, INCI nomenclature and the reference lists. The result is a report with findings ranked by high, medium and low impact.'],
  paises: ['Which countries does it cover?', 'The four Andean Community countries: Colombia (INVIMA), Peru (DIGEMID), Ecuador (ARCSA) and Bolivia (AGEMED). They share the harmonized regime of Decision 833, and each authority has its own requirements.'],
  reemplaza: ['Does Umplia replace the regulatory affairs professional?', 'No. Umplia never invents data: when documents disagree, it shows which ones match and which one differs, and the professional decides on every finding. Anything it cannot read clearly is flagged as “Requires human review”.'],
  donde: ['Where are my dossiers stored?', 'Dossiers are stored in Colombia (Oracle Cloud, Bogotá region), encrypted at rest. They are analyzed by an open-source AI model operated by Umplia: they are not sent to ChatGPT, Gemini or Claude and are not used to train the model.'],
  modulos: ['Which modules are available?', 'Two. New NSO checks the full dossier for a new NSO. Modifications checks changes to an NSO already granted and covers 19 modification types.'],
  renov: ['Does Umplia cover NSO renewals?', 'No. Today Umplia covers New NSOs and Modifications.'],
  radica: ['Does Umplia file the dossier for me?', 'No. Umplia reviews the dossier before you file it on the authority’s platform. Your team still does the filing.'],
  farma: ['Is it useful for pharmaceutical companies?', 'Yes, for the cosmetic NSOs they file. Umplia for Cosmetics does not cover medicines registration.'],
  precio: ['How much does Umplia cost?', 'It depends on your filing volume and the modules you need. We discuss it in the demo.'],
};

const pick = (src, keys) => keys.map((k) => src[k]);

export const FAQ = {
  es: {
    home: pick(es, ['que', 'revisa', 'paises', 'reemplaza', 'donde']),
    cosmeticos: pick(es, ['modulos', 'renov', 'radica', 'farma', 'precio']),
    full: pick(es, ['que', 'revisa', 'modulos', 'renov', 'paises', 'tarda', 'reemplaza', 'radica', 'requer', 'donde', 'ia', 'farma', 'precio', 'demo', 'tools', 'nso', 'vigencia', 'd833']),
  },
  en: {
    home: pick(en, ['que', 'revisa', 'paises', 'reemplaza', 'donde']),
    cosmetics: pick(en, ['modulos', 'renov', 'radica', 'farma', 'precio']),
  },
};
