import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { minify } from 'html-minifier-terser';

const resolvePath = (p) => fileURLToPath(new URL(p, import.meta.url));

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
          removeRedundantAttributes: true,
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
  plugins: [htmlInclude(), htmlMinify()],
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
  },
});
