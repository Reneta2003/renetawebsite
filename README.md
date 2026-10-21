# reneta.nl

Personal portfolio of Reneta Trifonova, built from the approved "G" design: honeydew, navy, powder and steel blue with an electric-lime highlight.

It is a static site generated with [Astro](https://astro.build). Every page is plain, pre-rendered HTML; the only client-side JavaScript is a ~2 KB script that filters the project list. All content lives in JSON files and is validated at build time.

---

## Quick start

Requirements: **Node.js 22.12 or newer**.

```bash
npm install
npm run dev       # http://localhost:4321, live reload
npm run build     # production build into dist/, followed by automatic checks
npm run preview   # serve the production build locally
npm run check     # TypeScript + Astro diagnostics
```

`npm run build` runs `astro build` and then `scripts/verify-dist.mjs`, which fails the build if a page ships without a single `<h1>`, a title, a meta description or a canonical URL; if an image has no `alt`; if JSON-LD does not parse; if an internal link or image points nowhere; or if key content (name, roles, project titles) is missing from the initial HTML.

## Deployment

`dist/` is a fully static folder. Deploy it to any static host:

| Host | Settings |
| --- | --- |
| Netlify / Cloudflare Pages | Build command `npm run build`, output directory `dist`. `public/_headers` sets long-term caching for hashed assets and basic security headers. |
| Vercel | Framework preset "Astro", or the same build command and output directory. |
| GitHub Pages, any web server | Upload the contents of `dist/`. Configure the server to serve `404.html` for missing pages. |

The canonical domain is set once, in `astro.config.mjs` (`SITE`). Canonical links, Open Graph tags, JSON-LD, `sitemap-index.xml`, `robots.txt` and `llms.txt` all derive from it.

---

## Managing content

Everything you are likely to edit is in `src/content/`. You never need to touch a component to add, change, remove or reorder content. After editing, run `npm run build` (or keep `npm run dev` open); a mistake such as an unknown category, a missing image or a badly formatted date stops the build with a message naming the file and field.

```
src/content/
├── profile.json         name, headline, summary, links, photo, competencies, education, languages, section texts, SEO
├── experience.json      work history, one object per role
├── categories.json      the areas used to filter projects
└── projects/            one JSON file per project; the file name is the URL
    └── pentago.json  →  https://reneta.nl/projects/pentago/
```

The authoritative schema, with a comment on every field, is `src/content.config.ts`.

### Highlighting keywords

In `summary` (profile) and `highlights` (experience), wrap words recruiters should notice in double asterisks:

```json
"Designed and **independently implemented** multi-stage **CI/CD pipelines**."
```

They render as a lime marker on light backgrounds and lime text on navy. This is the only markup allowed; HTML in content is escaped.

### Add a project

Create `src/content/projects/my-project.json`:

```json
{
  "title": "My project",
  "summary": "One line shown in the list (max 140 characters).",
  "description": "Full description.\n\nA blank line starts a new paragraph.",
  "context": "Personal project",
  "collaboration": "individual",
  "client": "Optional organisation it was built for",
  "institution": "Optional university",
  "period": { "start": "2026-05", "end": "2026-07" },
  "categories": ["embedded", "security"],
  "skills": ["C", "Zephyr RTOS"],
  "awards": [],
  "image": { "src": "../../assets/projects/my-project.jpg", "alt": "What the photo shows" },
  "links": [{ "label": "Source code", "url": "https://github.com/…" }],
  "order": 3,
  "expanded": false,
  "todo": "Notes for yourself; never rendered."
}
```

| Field | Required | Notes |
| --- | --- | --- |
| `title`, `summary`, `description`, `context` | yes | Plain text. |
| `collaboration` | yes | `"individual"` or `"team"`. |
| `period` | no | `start` and optional `end` as `"YYYY"` or `"YYYY-MM"`. Add `"ongoing": true` for current work (shows "now"), `"approximate": true` to show years only. Omit `period` if the dates are unknown. |
| `categories` | yes | Ids from `categories.json`; an unknown id fails the build. |
| `skills` | yes | Feed the skill filter, the project page and structured data. Use consistent spelling across projects ("Raspberry Pi", not "RPi"). |
| `image` | no | Put the file in `src/assets/projects/`. It is resized and converted to AVIF/WebP automatically. |
| `links` | no | Thesis, repository, live site. Absolute URLs. |
| `order` | no | Lower numbers first. Projects without `order` follow, newest first. |
| `expanded` | no | Open this row in the list on page load. |

Remove a project by deleting its file. Reorder by changing `order`.

### Experience (`experience.json`)

Each role: `id`, `order`, `organization`, `role`, `start`, optional `end` (omit for the current role, which then shows "present" and the "Current" marker), optional `location`, `employmentType`, `organizationUrl`, `organizationType` (`"Organization"` or `"CollegeOrUniversity"`), `highlights` (with `**keywords**`) and `skills`.

### Profile (`profile.json`)

- `links.cv`, `links.linkedin`, `links.github` are `null` now and therefore **hidden everywhere** (the site never shows a dead link). Fill them in to make them appear in the hero, footer, structured data (`sameAs`) and `llms.txt`. For the CV, put the PDF in `public/` (e.g. `public/Reneta-Trifonova-CV.pdf`) and set `"cv": "/Reneta-Trifonova-CV.pdf"`.
- `competencies[].category` links each competency card to a project filter.
- `languages[].level` is a CEFR level (`A1`–`C2`) or `native`; `label` overrides the visible text and `note` adds a remark in brackets.
- `sections` holds the section headings, intros and the footer prompt. `seo` holds the home page title and meta description (50–170 characters).

### Categories (`categories.json`)

`id` (used in URLs such as `/?area=security`), `label`, `description` (used in structured data) and `order` (position of the filter button).

### Photos

Profile photos are referenced from `profile.json` (`photo.desktop`, `photo.mobile`) and live in `src/assets/photos/`. The desktop and phone layouts intentionally use different photos, matching the design. Replace the files or point to new ones; sizes and formats are generated at build time. `public/og.jpg` (1200×630) is the social-sharing image; regenerate it if the photo or headline changes.

---

## Architecture

```
src/
├── content.config.ts     Content schemas (Zod) and collections
├── content/              JSON content (see above)
├── assets/               Fonts, photos, project images (optimised at build)
├── lib/
│   ├── content.ts        Data access: sorting, lookups, derived labels
│   ├── format.ts         Date ranges and CEFR levels
│   ├── rich-text.ts      **keyword** markup → safe HTML / plain text
│   └── structured-data.ts  Schema.org JSON-LD builders
├── layouts/Base.astro    <head>: meta, canonical, Open Graph, fonts, JSON-LD
├── components/           One component per section of the design
├── scripts/project-filter.ts  The only client-side code
├── styles/global.css     Design tokens and base styles
└── pages/
    ├── index.astro       Home: hero, overview, experience, projects, footer
    ├── projects/[slug].astro  One page per project JSON file
    ├── llms.txt.ts, robots.txt.ts  Generated text endpoints
    └── 404.astro
```

Decisions worth knowing:

- **Static first, JavaScript last.** Each project is a native `<details>` element, so rows open and close and all content is readable with JavaScript disabled and by every crawler. The filter controls are rendered `hidden` and only revealed once the script runs, so there are never controls that do nothing.
- **Filter state in the URL.** `/?area=security&skill=Python#projects` is a shareable, filtered view. The competency cards link to these URLs; the script intercepts the click to filter in place without reloading.
- **Content is validated, not trusted.** Category references use Astro's `reference()`, images use `image()`, dates and URLs are checked. Content can only add keyword highlights, never HTML.
- **One source for every audience.** The HTML, JSON-LD, `llms.txt` and sitemap are generated from the same JSON, so they cannot drift apart.
- **Styles are scoped per component**, with shared tokens (colours, spacing, breakpoints at 768 px and 1100 px) in `global.css`.

## SEO and AI readability

- Pre-rendered HTML: every heading, role, skill and project description is in the initial response, not injected by JavaScript.
- Semantic structure: one `<h1>` per page, sections labelled by their `<h2>`, lists for roles and projects, `<time>` for dates, a skip link and landmarks.
- Structured data (JSON-LD):
  - Home page: a `Person` with `worksFor` roles (with dates), `alumniOf`, `affiliation`, `hasCredential`, `knowsAbout` and `knowsLanguage`, linked to a `WebSite` and a `ProfilePage` that lists every project.
  - Each project page: a `CreativeWork` (creator, keywords, areas, dates, awards, institution) and a `BreadcrumbList`.
- Per-page titles, meta descriptions, canonical URLs, Open Graph and Twitter cards.
- `sitemap-index.xml` (generated, excludes the 404 page) and `robots.txt` allowing all crawlers, including AI agents.
- `/llms.txt`: a plain-Markdown summary of the full profile (experience, education, competencies, languages and every project with links) for AI assistants and recruiting tools.
- Descriptive URLs (`/projects/dis-attack-and-defense/`) and image file names.

## Performance and accessibility

- Self-hosted variable font (Bricolage Grotesque, Latin subset, 77 KB), preloaded, with an automatically generated, metric-matched fallback so text does not jump when it loads.
- Hero photo served as an art-directed `<picture>` (AVIF/WebP/JPEG, several widths) with `fetchpriority="high"`; everything below the fold is lazy-loaded with explicit dimensions.
- Small CSS is inlined; the filter script (~2 KB) is inlined as a module.
- Measured locally on a throttled phone profile (4× CPU slowdown, ~9 Mbit/s): **LCP 0.7 s, CLS 0.000, ~200 KB** transferred on first load.
- WCAG 2.2 AA: colour contrast checked (lime is never used for text on light backgrounds), visible focus rings, 44 px minimum touch targets, `aria-pressed` filter buttons, a polite live region announcing results, `prefers-reduced-motion` respected.

## Verification performed

Run against the production build at 1440, 768 and 390 px wide:

- `astro check`: 0 errors, 0 warnings. `verify-dist`: all 18 pages pass.
- axe-core (WCAG 2.0/2.1/2.2 A and AA, plus best practices): 0 violations on the home page at all three widths and on project pages.
- No horizontal overflow, console errors or failed requests at any width.
- Filters: area, skill, the combination of both, the empty state, "Clear filters", competency-card links, deep links via URL, and keyboard opening of rows.
- With JavaScript disabled: all 16 projects present, rows expand, filter controls hidden.
- The 404 page is served with status 404. Invalid content (an unknown category, a malformed date) fails the build with a clear message.

## Content still to provide

Each item is also recorded as a `todo` in the relevant JSON file:

- LinkedIn and GitHub URLs, and the CV PDF (`profile.json` → `links`).
- EDACation: highlights, skills, location and employment type.
- Name of the course you were head TA for.
- MSc thesis: headline result and the modalities studied.
- BSc thesis: repository link.
- Photos or diagrams for: DIS attack and defense, Securing cloud infrastructure, Library occupancy.
- Library occupancy: software stack. Graph isomorphism: language.
- Scuba Chat and Pentago: confirm team or individual.
- InterVirtual Tours and InterTerm Klima: year; InterTerm Klima: live URL.
- The older project images are small crops from the previous site (about 370 px wide); higher-resolution originals would look sharper on project pages.

## Licences

Bricolage Grotesque is licensed under the SIL Open Font License; see `src/assets/fonts/OFL-LICENSE.txt`.
