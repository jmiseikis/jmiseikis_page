# How the site is delivered

Last updated 26 October 2026. Describes what the build produces, what has been verified and what still needs a
check in the Lovable or search accounts. Update it when the build or hosting changes.

## What the build produces

`npm run build` runs three steps:

1. `vite build`: the browser app, split per page (only the home page and the 404 page are in the main bundle).
2. `vite build --config vite.ssr.config.ts`: a server bundle of the same app, used only during the build.
3. `node scripts/prerender-meta.mjs`: for every route in `src/content/seo.json`, writes `dist/<route>/index.html`
   with that route's own title, description, robots, canonical, Open Graph/Twitter tags, hreflang (only `/` and
   `/de`), JSON-LD, the route's stylesheet and **the rendered page itself** (heading, text, links, worksheet
   questions, calculator method). The browser hydrates that HTML instead of replacing it (`src/main.tsx`).

It also writes `dist/404.html` (noindex) and `dist/speaking-examples/index.html` (a canonical and meta refresh to
`/speaking`). `npm run verify:static` checks all of this after a build.

Not rendered at build time: directory records (`/tech-events`, `/swiss-vcs`, `/gza-robotics` load them from
Google Sheets in the browser; the static HTML has their heading and description) and the live YouTube feed on
`/speaking` (the static HTML shows the curated catalogue).

## Three ways the site is read

| Reader | What it receives | Status |
| --- | --- | --- |
| Browsers and ordinary fetchers (no JavaScript) | The route's static HTML: full page content and metadata | Verified locally on the built files (`verify:static`, 21 routes). Recheck on the live domain after publishing. |
| Verified search, AI and social crawlers | Lovable documents on-request prerendering for verified crawlers on React/Vite projects | **Not verified.** Needs Google Search Console URL Inspection (rendered HTML) or a social link debugger on the live site. |
| Clients asking for Markdown | Lovable documents a Markdown representation | **Not verified.** Request a page with `Accept: text/markdown` on the live domain. |

The 25 October audit measured only the first row, when the static HTML had metadata but no page content. A
spoofed crawler user agent is not evidence of what verified crawlers receive.

## HTTP status and redirects (host tasks)

The app shows a 404 page for unknown URLs and sends `/speaking-examples` to `/speaking`, but those happen in the
browser. The HTTP status is whatever the host returns. On 25 October unknown URLs, `/speaking-examples` and the
retired Swiss Tech Pulse URLs all returned **200** with the home page's HTML.

To fix that at the host (not possible from this repository alone):

- Unknown URLs should return **404**, ideally serving `dist/404.html`. Check whether Lovable hosting serves it
  automatically for unmatched paths; a `404.html` file alone does not prove a 404 status.
- `/resources/swiss-tech-pulse` and its sub-pages were removed deliberately: **410** if the host supports it,
  otherwise 404.
- `/speaking-examples` should be a **301/308** to `/speaking`. Until then, its static fallback carries a canonical
  to `/speaking` and redirects in the browser.
- `www.jmiseikis.com` currently redirects temporarily; a permanent redirect to `jmiseikis.com` is a lower-priority
  improvement.

Netlify/Vercel-style `_redirects` or `vercel.json` files do not configure Lovable hosting; do not add them as a
fix.

## Checking a release

After merging to `main` (Lovable's sync branch) and publishing in Lovable:

1. `curl -s https://jmiseikis.com/advisory | grep -c '<h1'` should print 1, and the page text should be in the
   response.
2. View source on `/de`: `<html lang="de">`, German page text, one canonical.
3. Navigate in the browser from the home page to Advisory and inspect `script[type="application/ld+json"]`: one
   script, describing Advisory (Service nodes, no PodcastSeries).
4. Search Console: URL Inspection on `/`, `/advisory`, `/de`, a worksheet and `/raas-calculator`; compare the
   rendered HTML with the page.
5. `curl -sI https://jmiseikis.com/no-such-page`: note the status (see host tasks above).

## Page weight (measured 26 October 2026)

Local production build, served by `vite preview`, Chromium at 390px, bytes downloaded per first page view
(uncompressed). Not network timings or Core Web Vitals.

| Page | JavaScript before → after | CSS before → after |
| --- | --- | --- |
| `/` | 852 kB → 594 kB | 94 kB → 83 kB |
| `/advisory` | 852 kB → 599 kB | 94 kB → 83 kB |
| `/raas-calculator` | 852 kB → 665 kB | 94 kB → 107 kB (includes the calculator's own styles) |
| `/worksheets/technical-diligence-checklist` | 852 kB → 611 kB | 94 kB → 83 kB |

"Before" is the published `main` at `67e6b80` (old calculator); "after" includes the guided calculator. The GZA
robotics map (2.3 MB PDF) used to be embedded on page load; it now loads only when a visitor asks for the preview,
with a download link beside it.

## TechDrive move (prepared, disabled)

`docs/techdrive-migration.json` holds the planned exact-page moves of `/swiss-vcs` and `/tech-events` to
`zurich.techdrive.tv`, with `enabled: false`. Both destinations returned 404 on 25 October and could not be
rechecked on 26 October from the build environment. Keep the current pages until the destinations have the full
tools, their own canonicals, attribution and maintained data; then release the redirects, internal links,
sitemaps, structured data and `llms.txt` entries together. `/resources`, the two guides and `/raas-calculator`
stay on jmiseikis.com. No whole-domain change of address.
