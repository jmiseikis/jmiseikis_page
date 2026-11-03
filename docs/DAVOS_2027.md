# Davos 2027 directory (`/davos-2027`)

Last updated 3 November 2026. Integrates the v4 handover package. The page is **noindex, not in the sitemap, not in
`llms.txt` and not linked** from the site until the owner approves release.

## Source of truth

The owner's existing Google Sheet, read anonymously in the visitor's browser:

- Document: `https://docs.google.com/spreadsheets/d/10LwgzJqUyUVuL-JI7DU2-oY29Qxbh7sgnbQFRdYU0YU/edit?usp=sharing`
- Feed (default in `src/features/davos/sheets-config.mjs`):
  `https://docs.google.com/spreadsheets/d/10LwgzJqUyUVuL-JI7DU2-oY29Qxbh7sgnbQFRdYU0YU/gviz/tq?tqx=out%3Acsv&headers=1&sheet=Events`
- Optional build-time override: `VITE_DAVOS_EVENTS_CSV_URL` (a tab-specific Google CSV URL or a same-origin CSV path).
  Not needed for the default.

Nothing in the build reads, writes or bundles event rows. `tests/davos/fixtures/` holds the package's offline
snapshot for tests only.

## What was verified, and how (3 November 2026)

| Check | Result | Evidence |
| --- | --- | --- |
| Tab and header | **Verified** | Read through the owner's authorised Google Drive connector: the `Events` tab is the first sheet, range A1:AF16, row 1 holds the 32 machine field names, identical in name and order to `COLUMNS` in `core.mjs`. Other tabs: Directory view, Review queue, Schema, Sources (not read by the page). |
| Rows | **Read, not machine-validated** | 15 data rows, all `published=TRUE`, all `verified_at` 2026-11-03. Visible values fit the schema (statuses, Europe/Zurich, Davos, empty price for "Not disclosed", empty dates for "To be announced"). The connector returned the CSV as base64 that could not be passed to the validator reliably, so `validateEvents` has **not** been run on the live rows. |
| Sharing | **Verified** | Drive permissions: "anyone with the link" reader, plus the owner. Every tab in the document is therefore public; keep private material out of it. Not changed. |
| `npm run check:sheet` | **Failed (environment)** | The build environment's network policy denies `docs.google.com` (proxy 403; Node `ENOTFOUND`). Not evidence of a private sheet or bad data. |
| Browser feed from staging | **Not done** | No staging deployment is reachable from the build environment, and Google is blocked there. In a local browser the page requested exactly the feed URL above and showed the labelled error state with no fallback rows. |

## Integration

- `src/features/davos/`: the package modules. `core.mjs`, `sheets-config.mjs`, `sheets-feed.mjs` and
  `directory.css` are unchanged. Two changes in `directory.mjs`: the filter URL update keeps React Router's
  `history.state`, and the error text adds a full stop after a browser message such as "Failed to fetch".
- `src/features/davos/site-theme.css`: maps the directory's `--dd-*` tokens to the site's colours (light and dark),
  square corners, page width and minimum text sizes.
- `src/pages/Davos2027.tsx`: route page. Prerendered with a static H1 and introduction (removed once the live
  directory mounts), PageMeta, and the directory mounted in live mode. `destroy()` runs on unmount.
- `src/content/seo.json`: `/davos-2027` with `"robots": "noindex, nofollow"`. A per-route `robots` value is now
  supported by `scripts/seo-head.mjs` and `PageMeta`; `verify:static` and the SEO tests require noindex routes to
  stay out of the sitemap. JSON-LD is the generic CollectionPage and breadcrumb only, with no ItemList or Event data.
- `src/features/davos/server/davos-events.mjs`: the package's optional fixed-source CSV handler. **Not deployed or
  wired.** Use it only if the direct browser read fails on CORS and the host can run it.
- `scripts/check-davos-sheet.mjs` (`npm run check:sheet`): the package's read-only preflight.
- `tests/davos/` (`npm run test:davos`): the package's 61 Node tests. The test of the standalone preview HTML (not
  shipped) now checks the host page instead.
- `src/pages/__tests__/Davos2027.test.tsx`: page behaviour against fixture responses (source URL, replace-on-refresh
  with unpublished and deleted rows, access denied, labelled cache, unmount cleanup, noindex).

Runtime behaviour, from the package: read on load, every five minutes while visible, on return to a stale page and
on Refresh; each successful read replaces the list; header-only clears events and cache; access denied clears the
cache; a transient failure shows a local copy under 24 hours old, labelled as such; 2 MB and 15 second limits.

## Before release

1. **Browser read from a real origin.** Open the deployed page (or a local build with network access) logged out of
   Google; in the Network panel confirm the request above returns CSV (HTTP 200) and the 15 rows render with no
   "invalid row(s) withheld" note. This is also the CORS check. If it fails on CORS only, decide on the proxy.
2. **Run `npm run check:sheet`** from a machine that can reach Google; expect `"status": "passed"`.
3. **Propagation test**, with the owner's permission: change one description, then set one row's `published` to
   FALSE; after Refresh the text changes and the card disappears without a redeploy. Restore both.
4. **gviz typing.** The feed uses Google's gviz CSV export, which formats cells by type. Confirm dates arrive as
   `YYYY-MM-DD`, times as `HH:MM`, `published` as TRUE/FALSE and `edition` as `2027` (step 1 shows this: any
   mismatch withholds rows with a visible warning). Keep these columns as plain text in the sheet if needed.
5. **Hosting.** Lovable builds from `main`, so there is no branch preview: merging publishes the route (still
   noindex and unlinked). Recheck organiser evidence near launch; reading the sheet does not re-verify organisers.
6. On release: remove `robots` from the route, add it to `public/sitemap.xml`, link it, and consider `llms.txt`.
