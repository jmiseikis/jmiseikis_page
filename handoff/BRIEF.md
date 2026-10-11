# jmiseikis.com redesign: brief for the Claude Code cloud session

Repo: `jmiseikis/jmiseikis_page` (Vite + React 18 + TypeScript + Tailwind + shadcn/ui, Lovable
Cloud/Supabase backend). Live at https://jmiseikis.com. Prepared 11 October 2026 against commit
`65dc518`.

## Read first, in this order

1. `handoff/OWNER_FACTS.md`: confirmed facts. **These override the Codex package wherever they differ.**
2. `handoff/reference/CLAUDE_CODE_PROMPT.txt`: the full redesign scope from the Codex package.
3. `handoff/reference/IMPLEMENTATION_AND_QA.txt`, `DATA_AND_CALCULATOR_CHANGES.txt`,
   `CONTENT_PRESERVATION.txt`, `DESIGN_SPEC.txt`, `LATEST_CHANGES.txt`.
4. `handoff/reference/FULL_SITE_COPY.json` and `handoff/reference/preview/`: copy and a static
   visual reference. Run `python3 handoff/reference/serve_preview.py` and open
   `all-pages.html` to see all screens. **This is a reference, not code to ship.**
5. `handoff/legal/`: drafts for `/privacy` and `/terms`.

The package was written without access to this repo. Treat its file and function names as hints
and work from the real code.

## Ground rules

- **Never commit to `main`.** `main` syncs straight into the Lovable project. Work on one branch
  per pull request (below), branched from up-to-date `main`, and open a PR for each. The owner
  merges.
- **The repo is public.** The `handoff/` folder must never be merged into `main`. Do not copy
  anything from it into `public/` except the four worksheet `.txt` files.
- Do not touch `.env`, `.lovable/`, `supabase/migrations/`, database tables, RLS policies,
  secrets, or the recipients and credentials in `supabase/functions/*`.
- Keep the edge functions `send-contact-email`, `youtube-videos`, `og-image` and `mcp` working.
  Keep Turnstile, zod validation and React Query caching.
- **No em dashes** in any authored copy (use commas, colons, parentheses or a spaced hyphen).
  Keep diacritics: Mišeikis, Zürich in "TechDrive Zürich".
- No owner email address or `mailto:` anywhere on the site, in metadata or in downloads. The
  single exception is the privacy contact `dr.miseikis@gmail.com`, as plain text on `/privacy`
  and `/terms` only.
- No public fees ("fees on request"), no invented testimonials, client outcomes or partnerships.
  `src/components/Testimonials.tsx` exists: check whether it renders invented content, and
  report it rather than inventing replacements.
- Before every PR: `npm ci` (or `bun install`), `npm run lint`, `npx vitest run`, `npm run build`.
  All must pass. Do not send real contact-form emails while testing.
- Every PR description lists the changed files, what the owner should check in the Lovable
  preview after merging, and anything left unresolved.

## What is in the repo today (verified)

- Routes in `src/App.tsx`: `/`, `/de`, `/advisory`, `/speaking`, `/speaking-examples` (redirect),
  `/due-diligence`, `/tech-events`, `/swiss-vcs`, `/raas-calculator`, `/gza-robotics`,
  `/ai-agents-strategy`, four `/resources/swiss-tech-pulse/*` routes, `*` (404).
- Directories fetch Google Sheets client-side (`gviz/tq?tqx=out:json`) in
  `src/pages/TechEvents.tsx`, `SwissVCs.tsx` and `GZARobotics.tsx`. The MCP tools in
  `src/lib/mcp/tools/list-tech-events.ts` and `list-swiss-vcs.ts` read the same sheets and need
  the same fix.
- `src/components/Footer.tsx`: the "Privacy Policy" and "Terms of Service" buttons have no action.
- `index.html`: canonical, hreflang, OG and JSON-LD URLs all point to `jmiseikis.lovable.app`,
  not `jmiseikis.com`. JSON-LD and the FAQ call GZA and Swisscom Ventures "partner
  organisations", which is wrong (see OWNER_FACTS.md).
- `scripts/prerender-meta.mjs` runs after `vite build`. `public/sitemap.xml` has 11 URLs.
- Swiss Tech Pulse: `src/components/swiss-tech-pulse/*` plus its pages. Backend tables
  `items`, `item_sources`, `item_investors`, `companies`, `investors`, `digests`,
  `digest_subscribers`, `user_roles`.

## Pull requests, in order

Each PR is self-contained and mergeable on its own. Do them in this order. Stop after each one
and let the owner merge before starting the next, rebasing on the new `main`.

### PR 1: Fix the events sheet adapter

Bug: the adapter skips the first data row (drops the WEF event), and the columns after
Official URL are mapped to the wrong fields. Map columns by header name, hide the price
filter (the sheet has no price column), keep error states when required columns are missing,
and use Zurich calendar dates for upcoming and archive. Apply the same header-based mapping in
the MCP tool. Port `reference/implementation/google-sheets-adapter.mjs` and
`test-sheets.mjs` into the project's own types and vitest. No visual redesign in this PR.
Check: all source events appear, including WEF. Two identical Swiss AI Summit rows are combined
only in the display.

### PR 2: Confirmed facts, legal pages, canonical domain

**Partly done already** in Lovable commit `a3f7a73` (11 Oct): job titles and Sony parent
organisation in `index.html`, partner wording removed (index.html, llms.txt, Resources.tsx,
GZARobotics.tsx), all TechDrive links now `techdrive.tv`, and `jmiseikis.com` in `index.html`,
`sitemap.xml` and `prerender-meta.mjs`. Verify those, then do what remains:
- `jmiseikis.lovable.app` is still used in the per-page canonical, OG and JSON-LD URLs in
  `src/pages/*`, in `src/lib/ogImage.ts`, `src/lib/mcp/tools/*`, `public/llms.txt`,
  `public/robots.txt` (sitemap line), and the `og-image` and `mcp` edge functions. Switch them
  all to `https://jmiseikis.com`. The edge-function edits are URL strings only.
- The `/privacy` and `/terms` pages and the footer links (below).

Full scope, for reference:

- Apply OWNER_FACTS.md: job titles (Sony AI and Sony), counts, LinkedIn, and remove every
  "partner" claim about GZA and Swisscom Ventures (JSON-LD `affiliation`, FAQ answers, noscript
  block, `keywords` meta, page copy).
- Replace all 12 `techdrivezurich.lovable.app` links with `https://techdrive.tv` (`index.html`,
  `public/llms.txt`, `src/components/Speaking.tsx`, `src/pages/SpeakingPage.tsx`).
- Add `/privacy` and `/terms` pages from `handoff/legal/` in the current site style, with the
  publication date filled in. Wire the footer buttons to them as real links. (The Pulse
  subscriber table is already confirmed empty, so there is no merge precondition.)
- Switch canonical, hreflang, OG and JSON-LD URLs from `jmiseikis.lovable.app` to
  `https://jmiseikis.com`, in `index.html` and `scripts/prerender-meta.mjs`.

### PR 3: Shared design system, navigation and footer

Implement the page shell from `DESIGN_SPEC.txt`: tokens, typography, nav (Advisory, Speaking,
Resources, Publications, About, Discuss a project), mobile menu, footer with deeper routes and
the legal links, both themes. Keep the homepage hero and portrait. Keep the old home anchors
(`#about`, `#advisory`, `#services`, `#speaking`, `#resources`, `#publications`, `#contact`)
working.

### PR 4: Pages and routes

Rebuild existing pages and add `/about`, `/resources`, `/publications`,
`/swiss-ai-robotics-ecosystem` and `/swiss-baltic-market-entry` using `FULL_SITE_COPY.json`
with OWNER_FACTS.md applied. Add the four worksheets as `public/downloads/*.txt`. Keep the live
YouTube feed and the production contact form (with its real success and error states). If this
PR gets too large to review, split it into "existing pages" and "new pages".

### PR 5: RaaS calculator model

Follow `DATA_AND_CALCULATOR_CHANGES.txt` and port `reference/implementation/calculator.mjs` with
its tests. This changes visible results, so the PR description must list exactly which formulas
changed, with before and after values for the default scenario.

### PR 6: Retire Swiss Tech Pulse

Remove the Pulse routes, components, links, sitemap entries and unused imports. Old Pulse URLs
must fall through to the 404 route, not redirect elsewhere. **Do not** delete or migrate any
backend table, data, role or policy. (The subscriber table is already empty.) In the PR description, list any remaining Pulse-only
backend pieces (functions, cron jobs, tables) for the owner to decide on.

### PR 7: SEO and prerender pass

Unique title, description, canonical, OG/Twitter and JSON-LD per public route
(`reference/implementation/route-metadata.json` is a proposal). Update `prerender-meta.mjs` and
`sitemap.xml` together. Exclude the 404, Pulse and the redirect alias. Keep hreflang only for `/`
and `/de`. Check the built HTML for duplicate canonical or robots tags.

## Report back, but do not change

- `supabase/functions/send-contact-email` sends from `onboarding@resend.dev`, Resend's shared
  test sender, which is a deliverability risk. The real fix is verifying `jmiseikis.com` in Resend
  and changing the sender, which needs the owner's Resend account.
- The recipient address is hard-coded in that function, so it is visible in this public repo.
  Moving it to a secret (for example `CONTACT_TO`) needs the owner to add the secret in Lovable.

## Visual QA for PRs 3 to 7

Check 320, 360, 390, 480, 640, 768, 1024 and 1280 px widths in both themes. On phones, the
third child of each service row must span the text column. Check direct loads of every route,
the old anchors, directory filters and counts (157 robotics, 66 VCs, all event rows), the
calculator boundary cases from the tests, and the contact form's validation and error states
without sending.
