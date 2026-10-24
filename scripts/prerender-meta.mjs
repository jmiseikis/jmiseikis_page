// Post-build: emit per-route static HTML with route-specific <title>, description, robots, canonical, og:*,
// twitter:*, hreflang (home and /de only) and JSON-LD, so social-preview crawlers (LinkedIn, Slack, Facebook, X)
// and search bots that don't execute JS see the right metadata for every page. Only the <head> differs per
// route; the page body is still rendered in the browser.
// Values come from src/content/seo.json, the same file PageMeta reads, so the two cannot drift apart.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderRoute } from "./seo-head.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, "..", "dist");
const indexPath = join(distDir, "index.html");
if (!existsSync(indexPath)) {
  console.error("[prerender] dist/index.html not found - skipping");
  process.exit(0);
}
const seo = JSON.parse(readFileSync(join(__dirname, "..", "src", "content", "seo.json"), "utf8"));
// Dynamic OG image edge function. Without a project id the pages fall back to the static /og-image.png.
const projectId = process.env.VITE_SUPABASE_PROJECT_ID || "uwdastthzqjbiyrxucci";
const baseHtml = readFileSync(indexPath, "utf8");

let count = 0;
for (const path of Object.keys(seo.routes)) {
  const html = renderRoute(baseHtml, seo, path, { projectId });
  // "/" rewrites dist/index.html itself, which the host also serves for unknown URLs before the 404 page loads.
  const outDir = path === "/" ? distDir : join(distDir, path.replace(/^\//, ""));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), html);
  count++;
}
console.log(`[prerender] wrote ${count} per-route HTML files`);
