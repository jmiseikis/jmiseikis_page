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
const SITE = "https://jmiseikis.com";
// Dynamic OG image edge function. If the project id isn't available at build
// time, fall back to the static /og-image.png bundled in /public.
const SUPA_PROJECT_ID = process.env.VITE_SUPABASE_PROJECT_ID || "uwdastthzqjbiyrxucci";
const FALLBACK_OG = `${SITE}/og-image.png`;
function ogUrl({ title, subtitle, image }) {
  if (!SUPA_PROJECT_ID) return FALLBACK_OG;
  const p = new URLSearchParams({ title });
  if (subtitle) p.set("subtitle", subtitle);
  if (image) p.set("image", image);
  return `https://${SUPA_PROJECT_ID}.supabase.co/functions/v1/og-image?${p.toString()}`;
}
const baseHtml = readFileSync(indexPath, "utf8");

/** @type {{path:string,title:string,description:string,ogTitle?:string,ogSubtitle?:string,ogImage?:string}[]} */
const routes = [
  {
    path: "/de",
    title: "Dr. Justinas Mišeikis - KI-Keynote-Speaker & Strategieberater | Zürich, DACH",
    description:
      "KI- und Robotik-Keynote-Speaker, VC Due Diligence und Forschungskommerzialisierung. Beratung für Unternehmen und Investoren in der Schweiz, Deutschland und Österreich.",
    ogTitle: "Dr. Justinas Mišeikis",
    ogSubtitle: "KI-KEYNOTE-SPEAKER · STRATEGIEBERATER",
  },
  {
    path: "/advisory",
    title: "AI & robotics advisory | Dr. Justinas Mišeikis",
    description:
      "Technology scouting, AI and robotics diligence, Swiss partnerships and local representation for international companies and investors.",
    ogTitle: "AI & robotics advisory",
    ogSubtitle: "DR. JUSTINAS MIŠEIKIS · ADVISORY",
  },
  {
    path: "/speaking",
    title: "AI Keynote Speaker & TechDrive Zürich Host | Dr. Justinas Mišeikis",
    description:
      "Book Dr. Justinas Mišeikis as an AI and robotics keynote speaker, and host of TechDrive Zürich. Featured at Davos 2026, GenAI Zürich and Sony AI.",
    ogTitle: "AI Keynote Speaker & TechDrive Zürich Host",
    ogSubtitle: "DR. JUSTINAS MIŠEIKIS · SPEAKING",
  },
  {
    path: "/due-diligence",
    title: "AI & robotics due diligence | Dr. Justinas Mišeikis",
    description:
      "Technical and commercial assessment of AI, robotics and deep tech opportunities for investors, acquirers and corporate strategy teams.",
    ogTitle: "AI & robotics due diligence",
    ogSubtitle: "DR. JUSTINAS MIŠEIKIS · DUE DILIGENCE",
  },
  {
    path: "/tech-events",
    title: "Tech Events Switzerland 2026 | AI and Robotics",
    description:
      "Curated calendar of the best AI, robotics, deep tech and startup events in Switzerland and the DACH region for 2026. Filter by topic, city and month.",
    ogTitle: "Tech Events Switzerland 2026",
    ogSubtitle: "AI · ROBOTICS · DEEP TECH · STARTUPS",
  },
  {
    path: "/swiss-vcs",
    title: "Swiss VCs Directory - 66+ Venture Capital Firms in Switzerland",
    description:
      "Directory of 66+ Swiss venture capital firms investing in AI, robotics, deep tech, SaaS and climate. Filter by sector, stage and ticket size to find the right investor.",
    ogTitle: "Swiss VCs & Funds Directory",
    ogSubtitle: "66+ FIRMS · SORTED BY SECTOR & STAGE",
    ogImage: `${SITE}/og-swiss-vcs.png`,
  },
  {
    path: "/raas-calculator",
    title: "RaaS ROI Calculator | Robotics Automation Costs",
    description:
      "Free RaaS ROI calculator: compare upfront robot purchase vs Robotics-as-a-Service over 5 years. Charts, payback period and total cost of ownership.",
    ogTitle: "RaaS ROI Calculator",
    ogSubtitle: "ROBOT AS A SERVICE · COST ANALYSIS",
    ogImage: `${SITE}/og-raas-calculator.png`,
  },
  {
    path: "/gza-robotics",
    title: "Robotics in the Greater Zurich Area - 150+ Companies",
    description:
      "Open resource mapping 150+ robotics companies, labs and startups across the Greater Zurich Area, listed with the agreement of Greater Zurich Area (GZA).",
    ogTitle: "Robotics in the Greater Zurich Area",
    ogSubtitle: "DIRECTORY · 150+ COMPANIES",
  },
  {
    path: "/ai-agents-strategy",
    title: "AI for internal data & workflows | Dr. Justinas Mišeikis",
    description:
      "Assess AI for internal knowledge, support, proposals and operations. Map company data, processes and permissions, then define a measurable pilot.",
    ogTitle: "AI for internal data & workflows",
    ogSubtitle: "DR. JUSTINAS MIŠEIKIS · PRACTICAL GUIDE",
  },
  {
    path: "/about",
    title: "About | Dr. Justinas Mišeikis",
    description:
      "Background in Sony technology scouting, Sony AI strategy and partnerships, robotics leadership, research and business education.",
    ogTitle: "About",
    ogSubtitle: "DR. JUSTINAS MIŠEIKIS · ABOUT",
  },
  {
    path: "/publications",
    title: "Publications & patents | Dr. Justinas Mišeikis",
    description:
      "Selected papers in robotics, computer vision and human-robot interaction, with links to the full publication and patent records.",
    ogTitle: "Publications & patents",
    ogSubtitle: "DR. JUSTINAS MIŠEIKIS · RESEARCH",
  },
  {
    path: "/resources",
    title: "Resources for Swiss technology & AI decisions | Dr. Justinas Mišeikis",
    description:
      "Guides, directories and templates for Swiss technology scouting, market entry, AI adoption and investor due diligence.",
    ogTitle: "Resources",
    ogSubtitle: "DR. JUSTINAS MIŠEIKIS · RESOURCES",
  },
  {
    path: "/swiss-ai-robotics-ecosystem",
    title: "Swiss AI & robotics ecosystem guide | Dr. Justinas Mišeikis",
    description:
      "Navigate Swiss AI and robotics research, startups and scale-ups. Public sources, investor questions and a downloadable technology scouting brief.",
    ogTitle: "Swiss AI & robotics ecosystem guide",
    ogSubtitle: "DR. JUSTINAS MIŠEIKIS · FIELD GUIDE",
  },
  {
    path: "/swiss-baltic-market-entry",
    title: "Swiss & Baltic technology market-entry guide | Dr. Justinas Mišeikis",
    description:
      "Plan technology market entry into Switzerland and international growth for Swiss startups, with Baltic ecosystem sources and a reusable brief.",
    ogTitle: "Swiss & Baltic market-entry guide",
    ogSubtitle: "DR. JUSTINAS MIŠEIKIS · FIELD GUIDE",
  },
  {
    path: "/privacy",
    title: "Privacy Policy | Dr. Justinas Mišeikis",
    description:
      "How jmiseikis.com handles personal data: the contact form, content loaded from third parties, service providers and your rights under Swiss and EU law.",
    ogTitle: "Privacy Policy",
    ogSubtitle: "DR. JUSTINAS MIŠEIKIS · LEGAL",
  },
  {
    path: "/terms",
    title: "Terms of Use | Dr. Justinas Mišeikis",
    description:
      "Terms for using jmiseikis.com: general information only, the RaaS ROI calculator, directories, external links, intellectual property, liability and Swiss law.",
    ogTitle: "Terms of Use",
    ogSubtitle: "DR. JUSTINAS MIŠEIKIS · LEGAL",
  },
  {
    path: "/resources/swiss-tech-pulse",
    title: "Swiss Tech Pulse — Live Swiss startup signal feed",
    description:
      "Foundings, spin-offs, funding rounds, exits and new VC funds across Switzerland — updated automatically.",
    ogTitle: "Swiss Tech Pulse",
    ogSubtitle: "LIVE SIGNAL FEED · SWITZERLAND",
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
  const og = ogUrl({
    title: r.ogTitle || r.title,
    subtitle: r.ogSubtitle,
    image: r.ogImage,
  });
  html = setOrInjectMeta(html, "property", "og:image", og);
  html = setOrInjectMeta(html, "property", "og:image:width", "1200");
  html = setOrInjectMeta(html, "property", "og:image:height", "630");
  html = setOrInjectMeta(html, "name", "twitter:image", og);
  html = setOrInjectMeta(html, "name", "twitter:card", "summary_large_image");
  html = setCanonical(html, url);

  const outDir = join(distDir, r.path.replace(/^\//, ""));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), html);
  count++;
}
console.log(`[prerender] wrote ${count} per-route HTML files`);