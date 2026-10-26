/**
 * Build one offline HTML file from the production calculator page and engine.
 * Run from the repository: node scripts/build-calculator-preview.mjs
 * Output: dist-calculator/RaaS_Calculator_V2.html (no runtime CDN dependencies).
 * The static body includes the same methodology and FAQ as the interactive page.
 */
import { build } from "vite";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "dist-calculator");
const staging = path.join(outDir, ".build");
const configFile = path.join(root, "vite.calculator.config.ts");

await build({ configFile, mode: "production" });
await build({ configFile, mode: "calculator-preview-ssr" });

const { CalculatorPreview } = await import(pathToFileURL(path.join(staging, "server/preview-server.js")).href);
const markup = renderToString(createElement(CalculatorPreview, { staticRender: true }), { identifierPrefix: "raas-preview-" });
const htmlPath = path.join(staging, "client/calculator-preview/index.html");
let html = await readFile(htmlPath, "utf8");
if (!html.includes("<!-- CALCULATOR_PREVIEW_MARKUP -->")) throw new Error("Preview markup placeholder is missing.");
html = html.replace("<!-- CALCULATOR_PREVIEW_MARKUP -->", () => markup);

// Resolve only assets emitted into this build. Absolute or traversal paths fail.
const readAsset = async (reference) => {
  if (/^(?:[a-z]+:|\/\/)/i.test(reference)) throw new Error(`Unexpected external preview dependency: ${reference}`);
  const assetPath = path.resolve(path.dirname(htmlPath), reference);
  const clientDir = path.join(staging, "client") + path.sep;
  if (!assetPath.startsWith(clientDir)) throw new Error("Preview asset escapes the build directory.");
  return readFile(assetPath, "utf8");
};

for (const match of [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>\s*<\/script>/g)]) {
  const code = (await readAsset(match[1])).replace(/<\/script/gi, "<\\/script");
  html = html.replace(match[0], () => `<script type="module">${code}</script>`);
}
for (const match of [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)]) {
  const css = (await readAsset(match[1])).replace(/<\/style/gi, "<\\/style");
  html = html.replace(match[0], () => `<style>${css}</style>`);
}
if (/<script\b[^>]*\bsrc=|<link\b[^>]*rel="(?:stylesheet|modulepreload)"/i.test(html)) {
  throw new Error("An external script or stylesheet remains in the preview.");
}
if (!html.includes('name="robots" content="noindex, nofollow"')) throw new Error("Preview must remain noindex.");
if (!html.includes("https://jmiseikis.com/raas-calculator")) throw new Error("Preview canonical is missing.");
await mkdir(outDir, { recursive: true });
const output = path.join(outDir, "RaaS_Calculator_V2.html");
await writeFile(output, html, "utf8");
await rm(staging, { recursive: true, force: true });
console.log(`Standalone calculator: ${output} (${Buffer.byteLength(html)} bytes)`);
