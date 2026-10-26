// Post-build: write each public route's static HTML with
// - route-specific <title>, description, robots, canonical, og:*, twitter:*, hreflang (home and /de only) and
//   JSON-LD, from src/content/seo.json (the same file PageMeta reads), and
// - the page itself, rendered from the same React components by src/entry-server.tsx, so the first response
//   contains the heading, text and links people see. The browser hydrates it (src/main.tsx).
// A route that fails to render keeps its head-only HTML and the build reports it, so a rendering problem never
// blocks a deploy; scripts/verify-static.mjs and the tests catch it before release.
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderRoute } from "./seo-head.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(root, "dist");
const indexPath = join(distDir, "index.html");
if (!existsSync(indexPath)) {
  console.error("[prerender] dist/index.html not found - skipping");
  process.exit(0);
}
const seo = JSON.parse(readFileSync(join(root, "src", "content", "seo.json"), "utf8"));
// Dynamic OG image edge function. Without a project id the pages fall back to the static /og-image.png.
const projectId = process.env.VITE_SUPABASE_PROJECT_ID || "uwdastthzqjbiyrxucci";
const baseHtml = readFileSync(indexPath, "utf8");

// Page modules, so each route's own stylesheet can be linked before its code loads.
const PAGE_MODULES = {
  "/de": "De",
  "/advisory": "AdvisoryPage",
  "/speaking": "SpeakingPage",
  "/due-diligence": "DueDiligencePage",
  "/ai-agents-strategy": "AiAgentsStrategy",
  "/about": "AboutPage",
  "/publications": "PublicationsPage",
  "/resources": "ResourcesPage",
  "/swiss-ai-robotics-ecosystem": "SwissEcosystemGuide",
  "/swiss-baltic-market-entry": "MarketEntryGuide",
  "/raas-calculator": "RaasCalculator",
  "/tech-events": "TechEvents",
  "/swiss-vcs": "SwissVCs",
  "/gza-robotics": "GZARobotics",
  "/privacy": "PrivacyPolicy",
  "/terms": "TermsOfUse",
};
const manifestPath = join(distDir, ".vite", "manifest.json");
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : {};
const cssFor = (key, seen = new Set()) => {
  const entry = manifest[key];
  if (!entry || seen.has(key)) return [];
  seen.add(key);
  return [...(entry.css ?? []), ...(entry.imports ?? []).flatMap((child) => cssFor(child, seen))];
};
const pageModule = (path) =>
  path.startsWith("/worksheets/") ? "WorksheetPage" : PAGE_MODULES[path];

let render = null;
const ssrEntry = join(root, ".ssr", "entry-server.js");
if (existsSync(ssrEntry)) ({ render } = await import(ssrEntry));
else console.warn("[prerender] .ssr/entry-server.js missing: writing head-only HTML");

/** Put the rendered page into #root and record which route it belongs to. */
async function withBody(html, path) {
  if (!render) return html;
  if (!html.includes('<div id="root"></div>')) throw new Error("index.html is missing <div id=\"root\"></div>");
  try {
    const body = await render(path);
    if (!body.includes("<h1")) throw new Error("no <h1> in the rendered page");
    return html.replace('<div id="root"></div>', `<div id="root" data-route="${path}">${body}</div>`);
  } catch (error) {
    console.warn(`[prerender] ${path}: page body not rendered (${error.message}); head only`);
    failures.push(path);
    return html;
  }
}

const failures = [];
let count = 0;
for (const path of Object.keys(seo.routes)) {
  let html = renderRoute(baseHtml, seo, path, { projectId });
  const module = pageModule(path);
  const css = module ? cssFor(`src/pages/${module}.tsx`) : [];
  if (css.length) html = html.replace("</head>", `${css.map((file) => `    <link rel="stylesheet" href="/${file}">`).join("\n")}\n  </head>`);
  html = await withBody(html, path);
  // "/" rewrites dist/index.html itself, which the host also serves for unknown URLs; main.tsx only hydrates
  // when the URL matches data-route, and otherwise renders the requested page from scratch.
  const outDir = path === "/" ? distDir : join(distDir, path.replace(/^\//, ""));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), html);
  count++;
}

// For hosts that serve 404.html with a real 404 status. Not proof that the current host does.
const notFoundHead = baseHtml
  .replace(
    /<!-- seo:start -->[\s\S]*?<!-- seo:end -->/,
    `<!-- seo:start -->
    <title>Page not found | Dr. Justinas Mišeikis</title>
    <meta name="description" content="Find the right page on the website of Dr. Justinas Mišeikis." data-rh="true" />
    <meta name="robots" content="noindex, nofollow" data-rh="true" />
    <!-- seo:end -->`,
  );
writeFileSync(join(distDir, "404.html"), await withBody(notFoundHead, "/404"));

// Portable fallback for the retired alias, pointing at its replacement. The app also redirects it in the browser;
// a host-level 301/308 is the proper fix (see docs/DELIVERY.md).
mkdirSync(join(distDir, "speaking-examples"), { recursive: true });
writeFileSync(
  join(distDir, "speaking-examples", "index.html"),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Speaking | Dr. Justinas Mišeikis</title><meta name="robots" content="noindex, follow"><link rel="canonical" href="${seo.site}/speaking"><meta http-equiv="refresh" content="0;url=/speaking"></head><body><p>This page has moved to <a href="/speaking">Speaking</a>.</p></body></html>`,
);

// The build manifest was only needed to link route stylesheets; do not publish it.
rmSync(join(distDir, ".vite"), { recursive: true, force: true });
console.log(`[prerender] wrote ${count} per-route HTML files${render ? `, ${count - failures.length} with page content` : ""}`);
if (failures.length) console.warn(`[prerender] head only: ${failures.join(", ")}`);
