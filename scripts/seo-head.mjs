// Builds the per-route <head> tags from src/content/seo.json. scripts/prerender-meta.mjs writes them into each
// route's static HTML; src/components/site/PageMeta.tsx renders the same tags at runtime.
// The tags carry data-rh="true" so react-helmet-async adopts them on load instead of adding a second copy.
import { structuredData } from "./structured-data.mjs";

export const SEO_START = "<!-- seo:start -->";
export const SEO_END = "<!-- seo:end -->";

const escapeHtml = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
const escapeAttr = (s) =>
  String(s).replace(/["&<>]/g, (c) => ({ '"': "&quot;", "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
// JSON inside <script>: stop "</script>" or "<!--" in a string from ending the element early.
const scriptJson = (value) => JSON.stringify(value).replace(/</g, "\\u003c");

/** Same URL as src/lib/ogImage.ts builds: the og-image edge function, or the static image without a project id. */
export function ogImageUrl({ site, projectId, title, subtitle, image }) {
  if (!projectId) return `${site}/og-image.png`;
  const params = new URLSearchParams();
  params.set("title", title);
  if (subtitle) params.set("subtitle", subtitle);
  if (image) params.set("image", image.startsWith("http") ? image : `${site}${image.startsWith("/") ? "" : "/"}${image}`);
  return `https://${projectId}.supabase.co/functions/v1/og-image?${params.toString()}`;
}

/** hreflang alternates exist only for the English home page and the German page. */
export const hasAlternates = (seo, path) => Object.values(seo.alternates).includes(path);

/** The tags for one route, as [tagName, attributes] pairs in a fixed order (the title is separate). */
export function routeTags(seo, path, { projectId } = {}) {
  const route = seo.routes[path];
  if (!route) throw new Error(`No SEO entry for ${path}`);
  const url = `${seo.site}${path}`;
  const language = route.language ?? "en";
  const image = ogImageUrl({ site: seo.site, projectId, title: route.ogTitle, subtitle: route.ogSubtitle, image: route.ogImage });
  const alternates = hasAlternates(seo, path);
  const otherLocales = Object.entries(seo.locales)
    .filter(([lang]) => lang !== language)
    .map(([, locale]) => locale);

  return [
    ["meta", { name: "description", content: route.description }],
    ["meta", { name: "robots", content: seo.robots }],
    ["link", { rel: "canonical", href: url }],
    ...(alternates
      ? Object.entries(seo.alternates).map(([hreflang, href]) => ["link", { rel: "alternate", hreflang, href: `${seo.site}${href}` }])
      : []),
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:locale", content: seo.locales[language] }],
    ...(alternates ? otherLocales.map((locale) => ["meta", { property: "og:locale:alternate", content: locale }]) : []),
    ["meta", { property: "og:title", content: route.title }],
    ["meta", { property: "og:description", content: route.description }],
    ["meta", { property: "og:url", content: url }],
    ["meta", { property: "og:image", content: image }],
    ["meta", { property: "og:image:width", content: "1200" }],
    ["meta", { property: "og:image:height", content: "630" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:title", content: route.title }],
    ["meta", { name: "twitter:description", content: route.description }],
    ["meta", { name: "twitter:image", content: image }],
  ];
}

/** The managed block between the seo markers in index.html, for one route. */
export function routeHead(seo, path, { projectId, jsonLd = true, indent = "    " } = {}) {
  const tags = routeTags(seo, path, { projectId }).map(([name, attrs]) => {
    const attributes = Object.entries(attrs)
      .map(([key, value]) => `${key}="${escapeAttr(value)}"`)
      .join(" ");
    return `<${name} ${attributes} data-rh="true" />`;
  });
  const lines = [`<title>${escapeHtml(seo.routes[path].title)}</title>`, ...tags];
  if (jsonLd) lines.push(`<script type="application/ld+json">${scriptJson(structuredData(seo, path))}</script>`);
  return [SEO_START, ...lines, SEO_END].map((line) => indent + line).join("\n");
}

/** Replace the managed block and the page language in the built index.html for one route. */
export function renderRoute(baseHtml, seo, path, options = {}) {
  const start = baseHtml.indexOf(SEO_START);
  const end = baseHtml.indexOf(SEO_END);
  if (start === -1 || end === -1 || end < start) throw new Error("index.html is missing the seo:start / seo:end markers");
  const lineStart = baseHtml.lastIndexOf("\n", start) + 1;
  const language = seo.routes[path].language ?? "en";
  const html =
    baseHtml.slice(0, lineStart) + routeHead(seo, path, options) + baseHtml.slice(end + SEO_END.length);
  return html.replace(/<html lang="[^"]*">/, `<html lang="${language}">`);
}
