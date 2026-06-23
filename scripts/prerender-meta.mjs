// Post-build: emit per-route static HTML with route-specific <title>, description,
// canonical, og:* and twitter:* tags so social-preview crawlers (LinkedIn, Slack,
// Facebook, X) and search bots that don't execute JS see correct metadata for
// every page on the site, not just "/".
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, "..", "dist");
const indexPath = join(distDir, "index.html");
if (!existsSync(indexPath)) {
  console.error("[prerender] dist/index.html not found - skipping");
  process.exit(0);
}
const SITE = "https://jmiseikis.lovable.app";
const baseHtml = readFileSync(indexPath, "utf8");

/** @type {{path:string,title:string,description:string,image?:string}[]} */
const routes = [
  {
    path: "/de",
    title: "Dr. Justinas Mišeikis - KI-Keynote-Speaker & Strategieberater | Zürich, DACH",
    description:
      "KI- und Robotik-Keynote-Speaker, VC Due Diligence und Forschungskommerzialisierung. Beratung für Unternehmen und Investoren in der Schweiz, Deutschland und Österreich.",
  },
  {
    path: "/advisory",
    title: "AI Strategy Advisory | Dr. Justinas Mišeikis",
    description:
      "Independent AI and robotics advisory for corporates and startups: strategy, partnerships, R&D-to-market and computer vision programs across Zurich, DACH and Europe.",
  },
  {
    path: "/speaking",
    title: "AI Keynote Speaker & TechDrive Zürich Host | Dr. Justinas Mišeikis",
    description:
      "Book Dr. Justinas Mišeikis as an AI and robotics keynote speaker, and host of TechDrive Zürich. Featured at Davos 2026, GenAI Zürich and Sony AI.",
  },
  {
    path: "/due-diligence",
    title: "VC Due Diligence - AI & Robotics Deep Tech | Dr. Justinas Mišeikis",
    description:
      "Independent technical due diligence for VCs and corporate investors evaluating AI, robotics, computer vision and deep tech ventures. Zurich, Switzerland.",
  },
  {
    path: "/tech-events",
    title: "Tech Events Switzerland 2026 | AI and Robotics",
    description:
      "Curated calendar of the best AI, robotics, deep tech and startup events in Switzerland and the DACH region for 2026. Filter by topic, city and month.",
  },
  {
    path: "/swiss-vcs",
    title: "Swiss VCs Directory - 66+ Venture Capital Firms in Switzerland",
    description:
      "Directory of 66+ Swiss venture capital firms investing in AI, robotics, deep tech, SaaS and climate. Filter by sector, stage and ticket size to find the right investor.",
  },
  {
    path: "/raas-calculator",
    title: "RaaS ROI Calculator | Robotics Automation Costs",
    description:
      "Free RaaS ROI calculator: compare upfront robot purchase vs Robotics-as-a-Service over 5 years. Charts, payback period and total cost of ownership.",
  },
  {
    path: "/gza-robotics",
    title: "Robotics in the Greater Zurich Area - 150+ Companies (with GZA)",
    description:
      "Open resource mapping 150+ robotics companies, labs and startups across the Greater Zurich Area, produced with Greater Zurich Area (GZA).",
  },
];

function setOrInjectMeta(html, attr, value, content) {
  const re = new RegExp(`<meta\\s+${attr}=["']${value}["'][^>]*>`, "i");
  const tag = `<meta ${attr}="${value}" content="${escapeAttr(content)}" />`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}
function setTitle(html, title) {
  return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
}
function setCanonical(html, url) {
  const re = /<link\s+rel=["']canonical["'][^>]*>/i;
  const tag = `<link rel="canonical" href="${escapeAttr(url)}" />`;
  return re.test(html) ? html.replace(re, tag) : html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}
function escapeHtml(s) {
  return String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}
function escapeAttr(s) {
  return String(s).replace(/["&<>]/g, (c) => ({ '"': "&quot;", "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

let count = 0;
for (const r of routes) {
  const url = SITE + r.path;
  let html = baseHtml;
  html = setTitle(html, r.title);
  html = setOrInjectMeta(html, "name", "description", r.description);
  html = setOrInjectMeta(html, "property", "og:title", r.title);
  html = setOrInjectMeta(html, "property", "og:description", r.description);
  html = setOrInjectMeta(html, "property", "og:url", url);
  html = setOrInjectMeta(html, "name", "twitter:title", r.title);
  html = setOrInjectMeta(html, "name", "twitter:description", r.description);
  html = setCanonical(html, url);

  const outDir = join(distDir, r.path.replace(/^\//, ""));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), html);
  count++;
}
console.log(`[prerender] wrote ${count} per-route HTML files`);