import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import PageMeta, { type RoutePath } from "@/components/site/PageMeta";
import NotFound from "@/pages/NotFound";
import seo from "@/content/seo.json";
// @ts-expect-error plain ES module shared with the build scripts
import { routeHead } from "../../../../scripts/seo-head.mjs";

// The tags react-helmet-async manages on every public page.
const MANAGED = [
  'meta[name="description"]',
  'meta[name="robots"]',
  'link[rel="canonical"]',
  'meta[property="og:type"]',
  'meta[property="og:locale"]',
  'meta[property="og:title"]',
  'meta[property="og:description"]',
  'meta[property="og:url"]',
  'meta[property="og:image"]',
  'meta[property="og:image:width"]',
  'meta[property="og:image:height"]',
  'meta[name="twitter:card"]',
  'meta[name="twitter:title"]',
  'meta[name="twitter:description"]',
  'meta[name="twitter:image"]',
  'script[type="application/ld+json"]',
];

/** Put a route's prerendered tags into <head>, as the static HTML would on first load. */
const loadStaticHead = (path: RoutePath) => {
  document.head.innerHTML = routeHead(seo, path, {
    projectId: import.meta.env.VITE_SUPABASE_PROJECT_ID,
  }).replace(/<!--[^>]*-->/g, "");
  document.documentElement.lang = seo.routes[path]["language" as never] ?? "en";
  // A placeholder title, so the tests can tell when react-helmet-async has applied its update.
  document.title = "Loading";
};

const renderMeta = (node: React.ReactNode) =>
  render(
    <HelmetProvider>
      <MemoryRouter>{node}</MemoryRouter>
    </HelmetProvider>,
  );

const settle = () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));

beforeEach(() => {
  document.head.innerHTML = "";
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("PageMeta", () => {
  it.each(Object.keys(seo.routes) as RoutePath[])("adopts the prerendered tags on %s without adding copies", async (path) => {
    loadStaticHead(path);
    const before = MANAGED.map((selector) => document.head.querySelector(selector));
    renderMeta(<PageMeta path={path} />);
    await waitFor(() => expect(document.title).toBe(seo.routes[path].title));
    await settle();
    for (const [index, selector] of MANAGED.entries()) {
      expect(document.head.querySelectorAll(selector), selector).toHaveLength(1);
      // The same element is kept, so nothing flickers or reorders on load.
      expect(document.head.querySelector(selector), selector).toBe(before[index]);
    }
  });

  it("drops the language alternates when moving from /de to another page", async () => {
    loadStaticHead("/de");
    expect(document.head.querySelectorAll('link[hreflang]')).toHaveLength(3);
    const { rerender } = renderMeta(<PageMeta path="/de" />);
    await waitFor(() => expect(document.documentElement.lang).toBe("de"));

    rerender(
      <HelmetProvider>
        <MemoryRouter>
          <PageMeta path="/advisory" />
        </MemoryRouter>
      </HelmetProvider>,
    );
    await waitFor(() => expect(document.title).toBe(seo.routes["/advisory"].title));
    await settle();
    expect(document.head.querySelectorAll('link[hreflang]')).toHaveLength(0);
    expect(document.head.querySelectorAll('meta[property="og:locale:alternate"]')).toHaveLength(0);
    expect(document.documentElement.lang).toBe("en");
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
  });

  it("swaps the structured data on client navigation instead of keeping the previous page's graph", async () => {
    // The 25 October audit found the home page's WebPage and PodcastSeries graph surviving a move to /advisory.
    loadStaticHead("/");
    const graph = () => {
      const scripts = document.head.querySelectorAll('script[type="application/ld+json"]');
      expect(scripts).toHaveLength(1);
      return JSON.parse(scripts[0].textContent ?? "")["@graph"] as { "@type": string; "@id"?: string }[];
    };
    expect(graph().map((n) => n["@type"])).toContain("PodcastSeries");
    const { rerender } = renderMeta(<PageMeta path="/" />);
    await waitFor(() => expect(document.title).toBe(seo.routes["/"].title));

    rerender(
      <HelmetProvider>
        <MemoryRouter>
          <PageMeta path="/advisory" />
        </MemoryRouter>
      </HelmetProvider>,
    );
    await waitFor(() => expect(document.title).toBe(seo.routes["/advisory"].title));
    await settle();
    const types = graph().map((n) => n["@type"]);
    expect(types).not.toContain("PodcastSeries");
    expect(types).toContain("Service");
    expect(graph().find((n) => n["@id"] === "https://jmiseikis.com/advisory#webpage")).toBeTruthy();
  });

  it("leaves the 404 page with one noindex robots tag and no canonical", async () => {
    // Unknown URLs are served the home page HTML before the app renders the 404 page.
    loadStaticHead("/");
    renderMeta(<NotFound />);
    await waitFor(() => expect(document.title).toBe("Page not found | Dr. Justinas Mišeikis"));
    await settle();
    const robots = document.head.querySelectorAll('meta[name="robots"]');
    expect(robots).toHaveLength(1);
    expect(robots[0]).toHaveAttribute("content", "noindex, nofollow");
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(0);
    expect(document.head.querySelectorAll('link[hreflang]')).toHaveLength(0);
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
  });
});
