# umplia.com

Sitio web de Umplia: Umplia® para Cosméticos.

## Cómo funciona

- `src/` es la fuente: registro de páginas (`src/site.mjs`), datos (`src/data/`), plantilla, parciales, páginas, estilos, script y medios.
- `node scripts/build.mjs` genera el sitio estático en `dist/` (sin dependencias). Vercel ejecuta ese comando en cada despliegue (`vercel.json`).
- El correo de contacto sale de `CONTACT_EMAIL` si está definida; si no, se usa el correo público de Umplia. El build falla si alguna verificación de `scripts/check.mjs` no pasa (reglas de contenido, SEO, enlaces, formulario). Un build fallido nunca se publica.
- Las cifras públicas viven solo en `src/data/claims.mjs`, y cada «27x» sale con su nota al pie.

## Local

```bash
node scripts/build.mjs
node scripts/serve.mjs   # http://localhost:4321
```

## Publicar

Rama, pull request, revisión en la URL de vista previa de Vercel y merge a `main`. No subas archivos sueltos por la interfaz web de GitHub: el sitio se genera desde `src/`.
