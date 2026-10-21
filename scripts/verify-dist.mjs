#!/usr/bin/env node
/**
 * Post-build checks on the generated HTML (runs as part of `npm run build`).
 * No dependencies: it reads dist/ and fails the build if a page would ship with
 * an SEO or accessibility regression that is easy to miss by eye.
 *
 *  - exactly one <h1>, a <title>, a meta description and a canonical link
 *  - every <img> has an alt attribute
 *  - every JSON-LD block parses
 *  - every internal href/src points to a file that exists in dist/
 *  - the home page contains the key content as text in the initial HTML
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const errors = [];
const fail = (file, message) => errors.push(`${relative(DIST, file)}: ${message}`);

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

if (!existsSync(DIST)) {
  console.error('dist/ not found. Run `astro build` first.');
  process.exit(1);
}

const files = walk(DIST);
const htmlFiles = files.filter((f) => f.endsWith('.html'));

function resolveInternal(url) {
  const path = decodeURIComponent(url.split(/[?#]/)[0]);
  if (!path || path === '/') return join(DIST, 'index.html');
  const target = join(DIST, path);
  if (path.endsWith('/')) return join(target, 'index.html');
  return target;
}

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const count = (re) => (html.match(re) ?? []).length;

  if (count(/<h1[\s>]/g) !== 1) fail(file, `expected exactly one <h1>, found ${count(/<h1[\s>]/g)}`);
  if (!/<title>[^<]{10,}<\/title>/.test(html)) fail(file, 'missing or empty <title>');
  if (!/<meta name="description" content="[^"]{50,}"/.test(html)) fail(file, 'missing or short meta description');
  if (!/<link rel="canonical" href="https:\/\/[^"]+"/.test(html)) fail(file, 'missing canonical link');
  if (!/<html lang="en"/.test(html)) fail(file, 'missing <html lang>');

  for (const img of html.match(/<img\b[^>]*>/g) ?? []) {
    // A bare `alt` (empty) is correct for decorative images.
    if (!/\salt(=|[\s>])/.test(img)) fail(file, `<img> without alt: ${img.slice(0, 80)}…`);
  }

  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(json);
    } catch {
      fail(file, 'JSON-LD does not parse');
    }
  }

  for (const [, attr, url] of html.matchAll(/\s(href|src)="([^"]+)"/g)) {
    if (!url.startsWith('/') || url.startsWith('//')) continue;
    if (!existsSync(resolveInternal(url))) fail(file, `broken internal ${attr}: ${url}`);
  }
  for (const [, srcset] of html.matchAll(/\ssrcset="([^"]+)"/g)) {
    for (const candidate of srcset.split(',')) {
      const url = candidate.trim().split(/\s+/)[0];
      if (url.startsWith('/') && !existsSync(resolveInternal(url))) fail(file, `broken srcset entry: ${url}`);
    }
  }
}

// Key content must be crawlable text in the initial HTML of the home page.
const home = join(DIST, 'index.html');
if (existsSync(home)) {
  const text = readFileSync(home, 'utf8');
  const contentDir = fileURLToPath(new URL('../src/content/', import.meta.url));
  const profile = Object.values(JSON.parse(readFileSync(join(contentDir, 'profile.json'), 'utf8')))[0];
  const roles = JSON.parse(readFileSync(join(contentDir, 'experience.json'), 'utf8'));
  const projectTitles = readdirSync(join(contentDir, 'projects'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(join(contentDir, 'projects', f), 'utf8')).title);

  const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const expected = [profile.name, profile.headline, ...roles.map((r) => r.organization), ...roles.map((r) => r.role), ...projectTitles];
  for (const phrase of expected) {
    if (!text.includes(escape(phrase))) fail(home, `initial HTML is missing "${phrase}"`);
  }
}

for (const required of ['robots.txt', 'sitemap-index.xml', 'llms.txt', 'favicon.svg', 'og.jpg']) {
  if (!existsSync(join(DIST, required))) errors.push(`missing ${required}`);
}

if (errors.length) {
  console.error(`\n✗ verify-dist found ${errors.length} problem(s):\n  - ${errors.join('\n  - ')}\n`);
  process.exit(1);
}
console.log(`✓ verify-dist: ${htmlFiles.length} pages checked (headings, meta, alt text, JSON-LD, internal links, crawlable content).`);
