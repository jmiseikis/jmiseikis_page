import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import seo from "@/content/seo.json";
import { SERVICES } from "@/content/services";
import { GZA_URL, LINKEDIN_URL, PATENTS_URL, SCHOLAR_URL, TECHDRIVE_URL } from "@/lib/site";
// @ts-expect-error plain ES module shared with the build scripts
import { renderRoute, routeHead } from "../../../scripts/seo-head.mjs";
// @ts-expect-error plain ES module shared with the build scripts
import { ADVISORY_SERVICES, structuredData } from "../../../scripts/structured-data.mjs";

const ROOT = process.cwd();
const read = (file: string) => readFileSync(join(ROOT, file), "utf8");
const indexHtml = read("index.html");
const PATHS = Object.keys(seo.routes) as (keyof typeof seo.routes)[];
const PROJECT_ID = "uwdastthzqjbiyrxucci";
const ALTERNATES = ["/", "/de"];

type Node = Record<string, unknown> & { "@type"?: string; "@id"?: string };
const graphOf = (path: string) => (structuredData(seo, path)["@graph"] as Node[]);
const byType = (graph: Node[], type: string) => graph.filter((n) => n["@type"] === type);

const parse = (html: string) => new DOMParser().parseFromString(html, "text/html");
const count = (doc: Document, selector: string) => doc.head.querySelectorAll(selector).length;
const content = (doc: Document, selector: string) => doc.head.querySelector(selector)?.getAttribute("content");

describe("Route list", () => {
  it("covers every routed public page, and only those", () => {
    const routed = [...read("src/App.tsx").matchAll(/path="([^"*:]+)"/g)].map((m) => m[1]);
    // The redirect alias is not canonicalised on its own.
    expect(routed.filter((p) => p !== "/speaking-examples").sort()).toEqual([...PATHS].sort());
  });

  it("gives every page a unique title and description, with no em dash or email address", () => {
    const titles = PATHS.map((p) => seo.routes[p].title);
    const descriptions = PATHS.map((p) => seo.routes[p].description);
    expect(new Set(titles).size).toBe(PATHS.length);
    expect(new Set(descriptions).size).toBe(PATHS.length);
    for (const text of [...titles, ...descriptions]) {
      expect(text).not.toMatch(/—|@|mailto:/);
    }
    for (const description of descriptions) expect(description.length).toBeLessThanOrEqual(160);
  });

  it("matches the home block in index.html, so the template and the build agree", () => {
    expect(renderRoute(indexHtml, seo, "/", { projectId: PROJECT_ID, jsonLd: false })).toBe(indexHtml);
    expect(indexHtml).toContain(routeHead(seo, "/", { projectId: PROJECT_ID, jsonLd: false }));
  });
});

describe.each(PATHS)("Prerendered head for %s", (path) => {
  const route = seo.routes[path] as (typeof seo.routes)[typeof path] & { language?: string };
  const url = `${seo.site}${path}`;
  const doc = parse(renderRoute(indexHtml, seo, path, { projectId: PROJECT_ID }));

  it("has exactly one of each tag, all describing this page", () => {
    expect(doc.querySelectorAll("title")).toHaveLength(1);
    expect(doc.title).toBe(route.title);
    expect(doc.documentElement.lang).toBe(route.language ?? "en");
    for (const selector of [
      'meta[name="description"]',
      'meta[name="robots"]',
      'link[rel="canonical"]',
      'meta[property="og:title"]',
      'meta[property="og:description"]',
      'meta[property="og:url"]',
      'meta[property="og:image"]',
      'meta[property="og:locale"]',
      'meta[name="twitter:card"]',
      'meta[name="twitter:title"]',
      'meta[name="twitter:description"]',
      'meta[name="twitter:image"]',
    ]) {
      expect(count(doc, selector), selector).toBe(1);
    }
    expect(doc.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(url);
    expect(content(doc, 'meta[property="og:url"]')).toBe(url);
    expect(content(doc, 'meta[name="robots"]')).toMatch(/^index, follow/);
    expect(content(doc, 'meta[name="description"]')).toBe(route.description);
    expect(content(doc, 'meta[property="og:title"]')).toBe(route.title);
    expect(content(doc, 'meta[name="twitter:title"]')).toBe(route.title);
    expect(content(doc, 'meta[property="og:description"]')).toBe(route.description);
    expect(content(doc, 'meta[name="twitter:image"]')).toBe(content(doc, 'meta[property="og:image"]'));
    expect(content(doc, 'meta[property="og:locale"]')).toBe(route.language === "de" ? "de_CH" : "en_GB");
  });

  it("has hreflang alternates only on the home page and /de", () => {
    const links = [...doc.head.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => [
      l.getAttribute("hreflang"),
      l.getAttribute("href"),
    ]);
    if (ALTERNATES.includes(path)) {
      expect(links).toEqual([
        ["en", "https://jmiseikis.com/"],
        ["de", "https://jmiseikis.com/de"],
        ["x-default", "https://jmiseikis.com/"],
      ]);
    } else {
      expect(links).toEqual([]);
      expect(count(doc, 'meta[property="og:locale:alternate"]')).toBe(0);
    }
  });

  it("has one JSON-LD graph with the shared site and person and this page", () => {
    const scripts = doc.head.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts).toHaveLength(1);
    const data = JSON.parse(scripts[0].textContent ?? "");
    expect(data).toEqual(structuredData(seo, path));
    const graph = data["@graph"] as Node[];
    expect(byType(graph, "WebSite")).toHaveLength(1);
    expect(byType(graph, "Person")).toHaveLength(1);
    expect(graph.find((n) => n["@id"] === `${url}#webpage`)).toMatchObject({ "@type": route.type, url, name: route.title });
    expect(byType(graph, "FAQPage")).toHaveLength(0);
  });

  it("keeps the structured data to confirmed facts: no email, prices, partners or affiliations", () => {
    const json = doc.head.querySelector('script[type="application/ld+json"]')?.textContent ?? "";
    expect(json).not.toMatch(/@[\w-]+\.[a-z]{2,}|mailto:|"price|priceRange|partner of|"affiliation"|—/i);
    expect(doc.head.innerHTML).not.toMatch(/mailto:|lovable\.app/);
  });
});

describe("Structured data", () => {
  const person = byType(graphOf("/"), "Person")[0];

  it("describes the owner with the confirmed roles and records", () => {
    expect(person).toMatchObject({
      name: "Dr. Justinas Mišeikis",
      jobTitle: ["Strategy and Partnerships Manager at Sony AI", "Founder and Host of TechDrive Zürich"],
      worksFor: { name: "Sony AI", parentOrganization: { name: "Sony" } },
    });
    expect(person.sameAs).toEqual(expect.arrayContaining([LINKEDIN_URL, SCHOLAR_URL, PATENTS_URL]));
    // TechDrive Zürich is a show he hosts, not another profile of the same person.
    expect(person.sameAs).not.toContain(TECHDRIVE_URL);
    expect(byType(graphOf("/"), "PodcastSeries")[0]).toMatchObject({ url: TECHDRIVE_URL, author: { "@id": person["@id"] } });
  });

  it("lists the four advisory offers as they appear on /advisory, without prices", () => {
    expect(ADVISORY_SERVICES.map((s: { id: string; name: string; description: string }) => [s.id, s.name, s.description])).toEqual(
      SERVICES.map((s) => [s.id, s.title, s.description]),
    );
    const services = byType(graphOf("/advisory"), "Service");
    expect(services.map((s) => s.url)).toEqual(SERVICES.map((s) => `https://jmiseikis.com/advisory#${s.id}`));
  });

  it("adds page-specific nodes only where they belong", () => {
    expect(byType(graphOf("/raas-calculator"), "SoftwareApplication")).toHaveLength(1);
    expect(byType(graphOf("/gza-robotics"), "Dataset")[0]).toMatchObject({ creator: { url: GZA_URL } });
    expect(byType(graphOf("/swiss-vcs"), "Dataset")).toHaveLength(1);
    expect(byType(graphOf("/swiss-ai-robotics-ecosystem"), "Article")).toHaveLength(1);
    expect(byType(graphOf("/advisory"), "Article")).toHaveLength(0);
    const speakingPerson = byType(graphOf("/speaking"), "Person")[0] as Node & { performerIn: Node[] };
    expect(speakingPerson.performerIn.map((e) => e.name)).toContain("Wisdom House @ Davos 2026");
    expect(speakingPerson.performerIn[0].description).toBe("Independently organised during WEF week");
    expect(person).not.toHaveProperty("performerIn");
  });
});

describe("Sitemap and robots.txt", () => {
  const sitemap = read("public/sitemap.xml");

  it("lists exactly the public pages, with language alternates only for / and /de", () => {
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toEqual(PATHS.map((p) => `${seo.site}${p}`));
    for (const block of sitemap.split("<url>").slice(1)) {
      const loc = block.match(/<loc>([^<]+)<\/loc>/)![1];
      const alternates = (block.match(/xhtml:link/g) ?? []).length;
      expect(alternates, loc).toBe(ALTERNATES.map((p) => `${seo.site}${p}`).includes(loc) ? 3 : 0);
      expect(block, loc).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
    }
  });

  it("points crawlers at the sitemap", () => {
    expect(read("public/robots.txt")).toContain("Sitemap: https://jmiseikis.com/sitemap.xml");
  });
});
