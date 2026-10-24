// Regenerates the blank worksheet PDFs in public/downloads/ from the worksheet pages' print layout, so the PDF and
// the fillable page always match. Run after changing src/content/worksheets.ts or the print styles:
//
//   npm run build && npx vite preview --port 4173 &
//   node scripts/build-worksheet-pdfs.mjs            (needs Playwright with Chromium installed)
//
// Not part of the normal build: the hosting build has no browser, so the PDFs are committed.
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const { chromium } = await import("playwright").catch(() => import("playwright-core"));

const SLUGS = ["technology-scouting-brief", "market-entry-brief", "ai-workflow-pilot-brief", "technical-diligence-checklist"];
const base = process.env.PREVIEW_URL || "http://127.0.0.1:4173";
const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "downloads");
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage();
// Only the local preview: no fonts or feeds from elsewhere, so the output does not depend on the network.
await page.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, (route) => route.abort());
for (const slug of SLUGS) {
  await page.goto(`${base}/worksheets/${slug}`, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: join(outDir, `${slug}.pdf`),
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: "<span></span>",
    footerTemplate:
      '<div style="width:100%;font-size:8px;color:#666;padding:0 14mm;display:flex;justify-content:space-between">' +
      `<span>jmiseikis.com/worksheets/${slug}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
  });
  console.log(`[worksheets] wrote public/downloads/${slug}.pdf`);
}
await browser.close();
