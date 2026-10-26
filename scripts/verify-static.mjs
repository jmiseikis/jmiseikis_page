// Checks the built site in dist/ after `npm run build`: every public route has its own static HTML with the page
// content, one of each head tag, valid JSON-LD and the right language; plus the 404 page and the retired alias.
// Usage: npm run build && npm run verify:static
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const seo = JSON.parse(readFileSync(join(root, "src", "content", "seo.json"), "utf8"));
const problems = [];
const fail = (path, message) => problems.push(`${path}: ${message}`);
const count = (html, pattern) => (html.match(pattern) ?? []).length;
const bodyWords = (html) => {
  const start = html.indexOf('<div id="root"');
  const end = html.lastIndexOf("</div>", html.lastIndexOf("</body>"));
  const body = html.slice(start, end).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<svg[\s\S]*?<\/svg>/g, "");
  return body.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
};

for (const path of Object.keys(seo.routes)) {
  const file = path === "/" ? join(dist, "index.html") : join(dist, path.slice(1), "index.html");
  if (!existsSync(file)) {
    fail(path, "no static HTML");
    continue;
  }
  const html = readFileSync(file, "utf8");
  const head = html.slice(0, html.indexOf("</head>"));
  const route = seo.routes[path];
  for (const [label, pattern] of [
    ["title", /<title>/g],
    ["description", /<meta name="description"/g],
    ["robots", /<meta name="robots"/g],
    ["canonical", /<link rel="canonical"/g],
    ["og:title", /<meta property="og:title"/g],
    ["JSON-LD", /<script type="application\/ld\+json"/g],
  ]) {
    if (count(head, pattern) !== 1) fail(path, `expected one ${label}, found ${count(head, pattern)}`);
  }
  if (!head.includes(`<link rel="canonical" href="${seo.site}${path}"`)) fail(path, "canonical is not this page");
  const hreflang = count(head, /hreflang=/g);
  if (hreflang !== (Object.values(seo.alternates).includes(path) ? 3 : 0)) fail(path, `unexpected hreflang count ${hreflang}`);
  if (!html.includes(`<html lang="${route.language ?? "en"}"`)) fail(path, "wrong html lang");
  if (!html.includes(`data-route="${path}"`)) fail(path, "page content not rendered");
  if (!/<h1[\s>]/.test(html.slice(html.indexOf('<div id="root"')))) fail(path, "no H1 in the page content");
  const words = bodyWords(html);
  if (words < 100) fail(path, `only ${words} words of page content`);
  try {
    const json = head.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)[1];
    const graph = JSON.parse(json)["@graph"];
    if (!graph.some((node) => node["@id"] === `${seo.site}${path}#webpage`)) fail(path, "JSON-LD has no node for this page");
  } catch (error) {
    fail(path, `JSON-LD does not parse (${error.message})`);
  }
  if (/gmail\.com/.test(html) && !["/privacy", "/terms"].includes(path)) fail(path, "contains the privacy email address");
  if (/lovable\.app|—/.test(head)) fail(path, "stale lovable.app URL or em dash in the head");
}

const notFound = join(dist, "404.html");
if (!existsSync(notFound) || !readFileSync(notFound, "utf8").includes('content="noindex, nofollow"')) fail("404.html", "missing or indexable");
const alias = join(dist, "speaking-examples", "index.html");
if (!existsSync(alias) || !readFileSync(alias, "utf8").includes(`rel="canonical" href="${seo.site}/speaking"`)) {
  fail("/speaking-examples", "fallback page missing or not pointing at /speaking");
}
const sitemap = readFileSync(join(dist, "sitemap.xml"), "utf8");
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const expected = Object.keys(seo.routes).map((path) => `${seo.site}${path}`);
if (JSON.stringify(locs) !== JSON.stringify(expected)) fail("sitemap.xml", "does not list exactly the public routes");
if (existsSync(join(dist, ".vite"))) fail("dist/.vite", "build manifest would be published");

if (problems.length) {
  console.error(`[verify:static] ${problems.length} problem(s):\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(`[verify:static] ${Object.keys(seo.routes).length} routes, 404 page, alias fallback and sitemap OK`);
