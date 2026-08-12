import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { minify } from 'html-minifier-terser';

const resolvePath = (p) => fileURLToPath(new URL(p, import.meta.url));

// Freshness signals. Search engines and LLM crawlers use dateModified /
// og:updated_time / sitemap <lastmod> to decide how current a page is, so these
// are stamped automatically on every build instead of being hand-maintained.
//
// Dates are in Australia/Melbourne so the stamp matches the business locale
// rather than the build machine's timezone (Cloudflare Pages builds in UTC,
// which would show "yesterday" for any evening deploy).
function melbourneNow() {
  const now = new Date();
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Australia/Melbourne',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  const date = `${parts.year}-${parts.month}-${parts.day}`;
  const clock = `${parts.hour}:${parts.minute}:${parts.second}`;
  // Melbourne is UTC+11 during AEDT and UTC+10 during AEST — derive the offset
  // from the actual difference rather than hard-coding one of them.
  const offsetMin = Math.round(
    (new Date(`${date}T${clock}Z`).getTime() - new Date(now.toISOString().slice(0, 19) + 'Z').getTime()) / 60000,
  );
  const sign = offsetMin >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMin);
  const offset = `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
  return { date, dateTime: `${date}T${clock}${offset}` };
}

// Replaces __BUILD_DATE__ / __BUILD_DATETIME__ in HTML (used by the JSON-LD
// dateModified fields and the og:updated_time meta tags), and rewrites
// <lastmod> in the built sitemap.xml.
//
// public/sitemap.xml keeps a real, valid date in source; the copy in dist/ is
// what actually gets served, and that is what this rewrites. Nothing to bump by
// hand — deploy and the freshness dates move with it.
function stampBuildDate() {
  const { date, dateTime } = melbourneNow();

  return {
    name: 'vite-stamp-build-date',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html
          .replaceAll('__BUILD_DATETIME__', dateTime)
          .replaceAll('__BUILD_DATE__', date);
      },
    },
    closeBundle() {
      const sitemap = resolvePath('./dist/sitemap.xml');
      if (!existsSync(sitemap)) return;
      const xml = readFileSync(sitemap, 'utf-8').replace(
        /<lastmod>[^<]*<\/lastmod>/g,
        `<lastmod>${date}</lastmod>`,
      );
      writeFileSync(sitemap, xml);
      this.info?.(`sitemap.xml lastmod stamped ${date}`);
    },
  };
}

function htmlInclude() {
  const includeRe = /<!--\s*@include:\s*(\S+?)\s*-->/g;
  const included = new Set();

  function expand(html, baseDir) {
    return html.replace(includeRe, (_, file) => {
      const abs = resolve(baseDir, file);
      included.add(abs);
      return expand(readFileSync(abs, 'utf-8'), dirname(abs));
    });
  }

  return {
    name: 'vite-html-include',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        return expand(html, dirname(ctx.filename));
      },
    },
    configureServer(server) {
      server.watcher.on('change', (file) => {
        const norm = file.replace(/\\/g, '/');
        if (included.has(file) || norm.includes('/src/components/')) {
          server.ws.send({ type: 'full-reload' });
        }
      });
    },
  };
}

function htmlMinify() {
  return {
    name: 'vite-html-minify',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      async handler(html) {
        return minify(html, {
          collapseWhitespace: true,
          conservativeCollapse: false,
          removeComments: true,
          // Keep type="text" etc. on form inputs so attribute-based CSS
          // selectors (input[type="text"]) continue to match after build.
          removeRedundantAttributes: false,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          useShortDoctype: true,
          minifyCSS: true,
          minifyJS: true,
          decodeEntities: false,
          sortAttributes: true,
          sortClassName: true,
        });
      },
    },
  };
}

export default defineConfig({
  // Order matters: includes expand first, then date tokens inside those
  // included components get stamped, then the whole document is minified.
  plugins: [htmlInclude(), stampBuildDate(), htmlMinify()],
  base: './',
  server: {
    port: 5173,
    open: '/',
  },
  build: {
    outDir: resolvePath('./dist'),
    emptyOutDir: true,
    cssMinify: true,
    minify: 'esbuild',
    rollupOptions: {
      input: {
        main: resolvePath('./index.html'),
        partners: resolvePath('./partners.html'),
        privacy: resolvePath('./privacy.html'),
        terms: resolvePath('./terms.html'),
        security: resolvePath('./security.html'),
      },
    },
  },
});
