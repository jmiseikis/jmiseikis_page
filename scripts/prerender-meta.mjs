// Post-build: emit per-route static HTML with route-specific <title>, description,
// canonical, robots, hreflang, og:*, twitter:* and JSON-LD so social-preview crawlers
// (LinkedIn, Slack, Facebook, X) and search bots that don't execute JS see correct
// metadata for every public page. This is metadata-only prerendering: page bodies
// still render client-side, apart from a short <noscript> summary per route.
//
// Route metadata lives in src/lib/seo/routes.mjs, shared with the React <Seo> component.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_SUPABASE_PROJECT_ID,
  NOT_FOUND_ROUTE,
  ROUTES,
  SITE_URL,
  canonicalUrl,
  headTags,
} from "../src/lib/seo/routes.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const distDir = join(root, "dist");
const indexPath = join(distDir, "index.html");
if (!existsSync(indexPath)) {
  console.error("[prerender] dist/index.html not found - skipping");
  process.exit(0);
}

const PROJECT_ID = process.env.VITE_SUPABASE_PROJECT_ID || DEFAULT_SUPABASE_PROJECT_ID;
const baseHtml = readFileSync(indexPath, "utf8");
const SEO_BLOCK = /<!-- seo:start -->[\s\S]*?<!-- seo:end -->/;
if (!SEO_BLOCK.test(baseHtml)) {
  console.error("[prerender] index.html is missing the <!-- seo:start --> ... <!-- seo:end --> block");
  process.exit(1);
}

const escapeHtml = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
const escapeAttr = (s) => String(s).replace(/["&<>]/g, (c) => ({ '"': "&quot;", "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);

function renderTags(route) {
  return headTags(route, PROJECT_ID)
    .map(({ tag, attrs, content }) => {
      const attrString = Object.entries(attrs)
        .map(([key, value]) => `${key}="${escapeAttr(value)}"`)
        .join(" ");
      // data-seo marks static tags that main.tsx removes before Helmet takes over.
      if (tag === "script") return `<script ${attrString} data-seo>${content}</script>`;
      return `<${tag} ${attrString} data-seo />`;
    })
    .map((line) => `    ${line}`)
    .join("\n");
}

const NAV = [
  ["/", "Home"],
  ["/advisory", "Advisory"],
  ["/due-diligence", "Due diligence"],
  ["/speaking", "Speaking"],
  ["/resources", "Resources"],
  ["/publications", "Publications & patents"],
  ["/about", "About"],
  ["/de", "Deutsch"],
];

function renderNoscript(route) {
  const links = NAV.map(([path, label]) => `<li><a href="${path}">${escapeHtml(label)}</a></li>`).join("");
  return `<noscript>
      <article>
        <h1>${escapeHtml(route.title)}</h1>
        <p>${escapeHtml(route.description)}</p>
        <p>Dr. Justinas Mišeikis is based in Zurich, Switzerland, and works internationally in English. Please enable JavaScript to use the contact form and interactive directories.</p>
        <nav aria-label="Site"><ul>${links}</ul></nav>
      </article>
    </noscript>`;
}

function renderPage(route) {
  let html = baseHtml.replace(SEO_BLOCK, `<!-- seo:start -->\n${renderTags(route)}\n    <!-- seo:end -->`);
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(route.title)}</title>`);
  html = html.replace(/<html lang="[^"]*"/i, `<html lang="${route.lang}"`);
  html = html.replace(/<noscript>[\s\S]*?<\/noscript>/i, renderNoscript(route));
  return html;
}

let count = 0;
for (const route of ROUTES) {
  const outDir = route.path === "/" ? distDir : join(distDir, route.path.replace(/^\//, ""));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), renderPage(route));
  count++;
}

// Hosts that support a custom 404 page serve this with a 404 status. It boots the same app,
// which renders the NotFound route for the requested path. Retired Swiss Tech Pulse URLs
// (/resources/swiss-tech-pulse/...) have no prerendered file and fall through to it.
writeFileSync(join(distDir, "404.html"), renderPage(NOT_FOUND_ROUTE));
console.log(`[prerender] wrote ${count} per-route HTML files and 404.html`);

// Guard against sitemap drift: every indexable route must be listed, and nothing else.
const sitemapPath = join(distDir, "sitemap.xml");
if (existsSync(sitemapPath)) {
  const listed = [...readFileSync(sitemapPath, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
  const expected = ROUTES.filter((r) => r.sitemap).map(canonicalUrl).sort();
  const missing = expected.filter((u) => !listed.includes(u));
  const extra = listed.filter((u) => !expected.includes(u));
  if (missing.length || extra.length) {
    console.warn(`[prerender] public/sitemap.xml is out of date. Missing: ${missing.join(", ") || "none"}. Unexpected: ${extra.join(", ") || "none"}.`);
  } else {
    console.log(`[prerender] sitemap.xml lists all ${expected.length} routes on ${SITE_URL}`);
  }
}
