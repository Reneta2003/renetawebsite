// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The canonical origin. Every absolute URL (canonical links, Open Graph,
// JSON-LD, sitemap, robots.txt, llms.txt) is derived from this value.
const SITE = 'https://reneta.nl';

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  build: {
    // Inline small stylesheets so the first paint needs no extra request.
    inlineStylesheets: 'auto',
  },
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
  image: {
    // Tell the browser how large images will render so it can pick a candidate early.
    layout: 'constrained',
  },
  fonts: [
    {
      // Self-hosted variable font (weight + optical size axes). Astro generates the
      // @font-face rules and a metric-matched fallback to minimise layout shift.
      provider: fontProviders.local(),
      name: 'Bricolage Grotesque',
      cssVariable: '--font-bricolage',
      fallbacks: ['system-ui', 'sans-serif'],
      options: {
        variants: [
          {
            // Latin subset only: the site is in English. Add the latin-ext file from
            // @fontsource-variable/bricolage-grotesque if names with other diacritics appear.
            src: ['./src/assets/fonts/bricolage-grotesque-latin-opsz-normal.woff2'],
            weight: '200 800',
            style: 'normal',
          },
        ],
      },
    },
  ],
});
