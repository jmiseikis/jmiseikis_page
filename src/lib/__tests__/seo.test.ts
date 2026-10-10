import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { NOT_FOUND_ROUTE, ROUTES, canonicalUrl, getRoute, headTags, structuredData } from "@/lib/seo/routes.mjs";

const root = resolve(__dirname, "../../..");
const read = (path: string) => readFileSync(join(root, path), "utf8");

const walk = (dir: string): string[] =>
  readdirSync(join(root, dir)).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(join(root, path)).isDirectory()) return name === "ui" || name === "__tests__" ? [] : walk(path);
    return /\.(tsx?|mjs|txt|xml|html)$/.test(name) ? [path] : [];
  });

// Authored copy: pages, content, site components, SEO registry, downloads, index.html and llms.txt.
const AUTHORED = [
  ...walk("src/pages"),
  ...walk("src/content"),
  ...walk("src/components/site"),
  "src/components/Contact.tsx",
  "src/components/Footer.tsx",
  "src/components/Navigation.tsx",
  "src/lib/seo/routes.mjs",
  ...walk("public/downloads"),
  "index.html",
  "public/llms.txt",
];

describe("route metadata", () => {
  it("has unique titles and descriptions within search snippet length", () => {
    const titles = ROUTES.map((r) => r.title);
    const descriptions = ROUTES.map((r) => r.description);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
    for (const route of ROUTES) expect(route.description.length, route.path).toBeLessThanOrEqual(160);
  });

  it("uses the jmiseikis.com canonical origin with exactly one canonical per page", () => {
    for (const route of ROUTES) {
      const canonicals = headTags(route, "project").filter((t) => t.tag === "link" && t.attrs.rel === "canonical");
      expect(canonicals, route.path).toHaveLength(1);
      expect(canonicals[0].attrs.href.startsWith("https://jmiseikis.com/")).toBe(true);
    }
  });

  it("only offers language alternates for / and /de", () => {
    const withAlternates = ROUTES.filter((r) => headTags(r, "p").some((t) => t.attrs.rel === "alternate")).map((r) => r.path);
    expect(withAlternates.sort()).toEqual(["/", "/de"]);
  });

  it("keeps the 404 page out of the index", () => {
    const tags = headTags(NOT_FOUND_ROUTE, "p");
    expect(tags.find((t) => t.attrs.name === "robots")?.attrs.content).toContain("noindex");
    expect(tags.some((t) => t.attrs.rel === "canonical")).toBe(false);
    expect(getRoute("/resources/swiss-tech-pulse").noindex).toBe(true);
    expect(getRoute("/speaking-examples").noindex).toBe(true);
  });

  it("matches public/sitemap.xml", () => {
    const listed = [...read("public/sitemap.xml").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
    const expected = ROUTES.filter((r) => r.sitemap).map(canonicalUrl).sort();
    expect(listed).toEqual(expected);
    expect(listed.some((u) => /swiss-tech-pulse|speaking-examples|lovable\.app/.test(u))).toBe(false);
  });

  it("keeps structured data free of email, job title and unverified counts", () => {
    for (const route of [...ROUTES, NOT_FOUND_ROUTE]) {
      const json = JSON.stringify(structuredData(route));
      expect(json).not.toMatch(/@[a-z0-9-]+\.[a-z]{2,}/i);
      expect(json).not.toMatch(/jobTitle|FAQPage|aggregateRating|"price"|700\+|40\+|15\+/);
    }
  });
});

describe("editorial rules", () => {
  it("contains no em dashes in authored copy", () => {
    for (const file of AUTHORED) expect(read(file).includes("\u2014"), file).toBe(false);
  });

  it("never exposes an email address or mailto link", () => {
    for (const file of AUTHORED) {
      const text = read(file);
      expect(text, file).not.toMatch(/mailto:/i);
      expect(text, file).not.toMatch(/[a-z0-9._%+-]+@[a-z0-9-]+\.(com|ch|net|org|io)\b/i);
    }
  });

  it("spells Dr. Mišeikis with the diacritic", () => {
    for (const file of AUTHORED) expect(read(file), file).not.toMatch(/Dr\.? Justinas Miseikis/);
  });

  it("no longer references the retired Swiss Tech Pulse", () => {
    for (const file of AUTHORED) expect(read(file), file).not.toMatch(/swiss-tech-pulse|Swiss Tech Pulse/i);
  });
});
