#!/usr/bin/env node
// Converts the legal-content/*.md sources into root *.html pages and
// matching src/components/*.html body partials. No npm deps.
//
// Re-run any time the markdown changes: `node tools/md-to-legal.mjs`

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const placeholders = {
  '[DATE TO INSERT]': 'May 2026',
  '[VERIFY PAYMENT PROCESSOR — e.g. Stripe Payments Australia Pty Ltd]': 'Stripe Payments Australia Pty Ltd',
};
// [REGISTERED OFFICE ADDRESS] is omitted by stripping the whole containing line.

const pages = [
  { md: 'privacy-policy.md',          slug: 'privacy',         title: 'Privacy Policy',          desc: "Bury Digital's privacy policy — how we collect, use, store, and disclose personal information under the Australian Privacy Act 1988." },
  { md: 'terms-of-service.md',        slug: 'terms',           title: 'Terms of Service',        desc: 'The terms of service governing use of the Bury Digital platform by Australian businesses.' },
  { md: 'acceptable-use-policy.md',   slug: 'acceptable-use',  title: 'Acceptable Use Policy',   desc: 'The acceptable use rules for the Bury Digital platform — messaging law compliance, prohibited uses, and enforcement.' },
  { md: 'subprocessors.md',           slug: 'subprocessors',   title: 'Subprocessors',           desc: 'The third-party service providers Bury Digital uses to deliver the Service, what they process, and where they operate.' },
  { md: 'security.md',                slug: 'security',        title: 'Security',                desc: 'How Bury Digital protects Customer Data and End User personal information — infrastructure, isolation, access controls, and incident response.' },
  { md: 'data-processing-agreement.md', slug: 'dpa',           title: 'Data Processing Agreement', desc: "Bury Digital's data processing agreement, defining processor obligations for Customer Data under the Australian Privacy Act." },
];

// ----- minimal markdown renderer (just what these documents need) -----

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Inline: links, bold, italic. Run AFTER escapeHtml so we operate on escaped text.
function renderInline(text) {
  let out = escapeHtml(text);
  // links: [label](url)
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
    const safeUrl = url.replace(/"/g, '&quot;');
    return `<a href="${safeUrl}">${label}</a>`;
  });
  // bold: **x**
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // italic: *x* (avoid matching inside already-emitted tags or **)
  out = out.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  return out;
}

function parseTable(lines, i) {
  // lines[i] is the header row; lines[i+1] should be the separator.
  const splitRow = (line) =>
    line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  const header = splitRow(lines[i]);
  if (!/^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1] || '')) return null;
  const rows = [];
  let j = i + 2;
  while (j < lines.length && lines[j].trim().startsWith('|')) {
    rows.push(splitRow(lines[j]));
    j++;
  }
  const html = [
    '<div class="legal-table-wrap"><table class="legal-table">',
    '<thead><tr>' + header.map((h) => `<th>${renderInline(h)}</th>`).join('') + '</tr></thead>',
    '<tbody>' +
      rows.map((r) => '<tr>' + r.map((c) => `<td>${renderInline(c)}</td>`).join('') + '</tr>').join('') +
      '</tbody>',
    '</table></div>',
  ].join('');
  return { html, next: j };
}

function renderMarkdown(md) {
  const lines = md.split(/\r?\n/);
  const out = [];
  let i = 0;
  let paragraph = [];
  let list = null; // { type: 'ul' | 'ol', items: [] }

  const flushParagraph = () => {
    if (paragraph.length) {
      // Preserve soft line breaks within a paragraph (GFM "breaks: true").
      // Lets the contact block in Terms §19 render as separate lines.
      const html = paragraph.map((l) => renderInline(l)).join('<br>');
      out.push(`<p>${html}</p>`);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list) {
      out.push(
        `<${list.type}>` +
          list.items.map((it) => `<li>${renderInline(it)}</li>`).join('') +
          `</${list.type}>`
      );
      list = null;
    }
  };
  const flushAll = () => {
    flushParagraph();
    flushList();
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      flushAll();
      i++;
      continue;
    }

    // Headings
    let m;
    if ((m = line.match(/^(#{1,6})\s+(.*)$/))) {
      flushAll();
      const level = m[1].length;
      out.push(`<h${level}>${renderInline(m[2].trim())}</h${level}>`);
      i++;
      continue;
    }

    // Tables: a line starting with | and a following separator row
    if (line.trim().startsWith('|') && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1] || '')) {
      flushAll();
      const t = parseTable(lines, i);
      if (t) {
        out.push(t.html);
        i = t.next;
        continue;
      }
    }

    // Unordered list items
    if ((m = line.match(/^\s*-\s+(.*)$/))) {
      flushParagraph();
      if (!list || list.type !== 'ul') {
        flushList();
        list = { type: 'ul', items: [] };
      }
      list.items.push(m[1]);
      i++;
      continue;
    }

    // Ordered list items
    if ((m = line.match(/^\s*\d+\.\s+(.*)$/))) {
      flushParagraph();
      if (!list || list.type !== 'ol') {
        flushList();
        list = { type: 'ol', items: [] };
      }
      list.items.push(m[1]);
      i++;
      continue;
    }

    // Paragraph continuation
    flushList();
    paragraph.push(line.trim());
    i++;
  }
  flushAll();
  return out.join('\n');
}

// ----- chrome templates -----

function rootPage({ slug, title, desc }) {
  const url = `https://bury-digital.com/${slug}.html`;
  return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />

<title>${title} — Bury Digital</title>
<meta name="description" content="${desc}" />
<link rel="canonical" href="${url}" />
<meta name="robots" content="index,follow" />
<meta name="theme-color" content="#0A0A0F" />

<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="apple-touch-icon" href="/apple-touch-icon.svg" />

<meta property="og:type" content="website" />
<meta property="og:site_name" content="Bury Digital" />
<meta property="og:title" content="${title} — Bury Digital" />
<meta property="og:description" content="${desc}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="https://bury-digital.com/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Bury Digital — AI missed-call recovery for service businesses" />
<meta property="og:locale" content="en_AU" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title} — Bury Digital" />
<meta name="twitter:description" content="${desc}" />
<meta name="twitter:image" content="https://bury-digital.com/og-image.png" />
<meta name="twitter:image:alt" content="Bury Digital — AI missed-call recovery for service businesses" />

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/src/assets/fonts/Inter-VariableFont_opsz_wght.woff2" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/src/styles/index.css">
</head>
<body>
<!-- @include: src/components/header-subpage.html -->
<main>
<!-- @include: src/components/${slug}.html -->
</main>
<!-- @include: src/components/footer.html -->

<script type="module" src="/src/scripts/main.js"></script>
</body>
</html>
`;
}

function partial({ title, body, updated }) {
  return `<section class="legal">
  <div class="wrap">
    <header class="legal-head">
      <div class="eb-text">Legal</div>
      <h1>${title}</h1>
      <div class="updated">Bury Digital Pty Ltd · ABN 31 850 554 300 · Last updated: ${updated}</div>
    </header>

    <div class="legal-doc">
${body}
    </div>
  </div>
</section>
`;
}

// ----- run -----

for (const page of pages) {
  const mdPath = path.join(root, 'legal-content', page.md);
  let src = fs.readFileSync(mdPath, 'utf8');

  // Substitute simple placeholders
  for (const [k, v] of Object.entries(placeholders)) {
    src = src.split(k).join(v);
  }
  // Omit the registered-office-address line entirely
  src = src
    .split(/\r?\n/)
    .filter((line) => !line.includes('[REGISTERED OFFICE ADDRESS]'))
    .join('\n');

  // Strip leading "# Title" heading (rendered separately in legal-head)
  src = src.replace(/^#\s+.+\n/, '');
  // Strip the ABN line ("**Bury Digital Pty Ltd (ABN 31 850 554 300)**")
  // since legal-head now carries that.
  src = src.replace(/^\*\*Bury Digital Pty Ltd \(ABN 31 850 554 300\)\*\*\s*\n/m, '');
  // Strip the "**Last updated:** ..." line (rendered in legal-head)
  const updatedMatch = src.match(/^\*\*Last updated:\*\*\s+(.+)$/m);
  const updated = updatedMatch ? updatedMatch[1].trim() : 'May 2026';
  src = src.replace(/^\*\*Last updated:\*\*\s+.+\n?/m, '');

  const body = renderMarkdown(src.trim())
    .split('\n')
    .map((l) => '      ' + l)
    .join('\n');

  const partialHtml = partial({ title: page.title, body, updated });
  const rootHtml = rootPage(page);

  fs.writeFileSync(path.join(root, `${page.slug}.html`), rootHtml);
  fs.writeFileSync(path.join(root, 'src', 'components', `${page.slug}.html`), partialHtml);
  console.log(`wrote ${page.slug}.html + src/components/${page.slug}.html`);
}
