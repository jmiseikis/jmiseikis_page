import { beforeEach, describe, expect, it, vi } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import AboutPage from "../AboutPage";
import PublicationsPage from "../PublicationsPage";
import ResourcesPage from "../ResourcesPage";
import SwissEcosystemGuide from "../SwissEcosystemGuide";
import MarketEntryGuide from "../MarketEntryGuide";
import { ENQUIRY_INTENTS } from "@/lib/site";

const ROOT = process.cwd();
const appSource = readFileSync(join(ROOT, "src/App.tsx"), "utf8");
const ROUTES = new Set([...appSource.matchAll(/path="([^"*:]+)"/g)].map((m) => m[1]));
const prerender = readFileSync(join(ROOT, "scripts/prerender-meta.mjs"), "utf8");
const sitemap = readFileSync(join(ROOT, "public/sitemap.xml"), "utf8");

const renderPage = (Page: () => JSX.Element, path: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Page />
      </MemoryRouter>
    </HelmetProvider>,
  );

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

const PAGES = [
  ["/about", AboutPage, "Technical depth. Commercial perspective."],
  ["/publications", PublicationsPage, "Publications & patents."],
  ["/resources", ResourcesPage, "Explore an ecosystem. Shape a decision."],
  ["/swiss-ai-robotics-ecosystem", SwissEcosystemGuide, "Navigate the Swiss AI & robotics ecosystem."],
  ["/swiss-baltic-market-entry", MarketEntryGuide, "Build your route into a new market."],
] as const;

describe.each(PAGES)("%s", (path, Page, heading) => {
  it("is routed, prerendered and in the sitemap", () => {
    expect(ROUTES.has(path)).toBe(true);
    expect(prerender).toContain(`path: "${path}"`);
    expect(sitemap).toContain(`<loc>https://jmiseikis.com${path}</loc>`);
  });

  it("renders one H1 and the same title and description as the prerendered HTML", async () => {
    renderPage(Page, path);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(heading);
    await waitFor(() => expect(document.title).toContain("Dr. Justinas Mišeikis"));
    expect(prerender).toContain(`title: "${document.title}"`);
    const description = document.querySelector('meta[name="description"]')?.getAttribute("content");
    expect(description && prerender.includes(description)).toBe(true);
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute("href", `https://jmiseikis.com${path}`);
  });

  it("links only to real routes, shipped files and safe external pages", () => {
    const { container } = renderPage(Page, path);
    for (const a of Array.from(container.querySelectorAll("a"))) {
      const href = a.getAttribute("href") ?? "";
      if (/^https?:\/\//.test(href)) {
        expect(href.startsWith("https://")).toBe(true);
        expect(a).toHaveAttribute("target", "_blank");
        expect(a.getAttribute("rel")).toContain("noopener");
      } else if (href.startsWith("/downloads/")) {
        expect(existsSync(join(ROOT, "public", href))).toBe(true);
        expect(a).toHaveAttribute("download");
      } else if (href.startsWith("/?enquiry=")) {
        const intent = new URLSearchParams(href.slice(1).split("#")[0]).get("enquiry");
        expect(ENQUIRY_INTENTS).toContain(intent);
        expect(href.endsWith("#contact")).toBe(true);
      } else if (href.startsWith("#")) {
        expect(container.querySelector(href)).not.toBeNull();
      } else {
        expect(ROUTES.has(href.split("#")[0])).toBe(true);
      }
    }
  });

  it("follows the copy rules: no em dash, no email address or mailto", () => {
    const { container } = renderPage(Page, path);
    expect(container.textContent).not.toMatch(/\u2014/);
    expect(container.innerHTML).not.toMatch(/mailto:|[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
  });
});

describe("About page facts", () => {
  it("uses the confirmed titles and the TechDrive Zürich link", () => {
    renderPage(AboutPage, "/about");
    expect(screen.getByText("Strategy and Partnerships Manager")).toBeInTheDocument();
    expect(screen.getByText(/Founder and Host of TechDrive\s+Zürich/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Explore TechDrive Zürich/ })).toHaveAttribute("href", "https://techdrive.tv/");
  });
});

describe("Publications page", () => {
  it("shows the confirmed counts next to the records that evidence them", () => {
    renderPage(PublicationsPage, "/publications");
    const record = screen.getByRole("region", { name: "Research record" });
    expect(within(record).getByText("700+")).toBeInTheDocument();
    expect(within(record).getByText("15+")).toBeInTheDocument();
    expect(within(record).getByText("40+")).toBeInTheDocument();
    expect(within(record).getByRole("link", { name: /Google Patents/ })).toHaveAttribute(
      "href",
      expect.stringContaining("patents.google.com"),
    );
  });

  it("filters the selected papers and recovers from an empty result", () => {
    renderPage(PublicationsPage, "/publications");
    const search = screen.getByRole("searchbox", { name: /Search papers/ });
    fireEvent.change(search, { target: { value: "charging" } });
    expect(screen.getByRole("status")).toHaveTextContent("1 of 3 selected publications");

    fireEvent.change(search, { target: { value: "no such paper" } });
    expect(screen.getByText("No matching papers.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByRole("status")).toHaveTextContent("3 of 3 selected publications");
  });
});

describe("Resources page", () => {
  it("offers all four blank worksheets as downloads", () => {
    renderPage(ResourcesPage, "/resources");
    const templates = screen.getByRole("region", { name: "Blank briefs to use with your team." });
    const files = within(templates)
      .getAllByRole("link")
      .map((a) => a.getAttribute("href"));
    expect(files).toEqual([
      "/downloads/technology-scouting-brief.txt",
      "/downloads/market-entry-brief.txt",
      "/downloads/ai-workflow-pilot-brief.txt",
      "/downloads/technical-diligence-checklist.txt",
    ]);
  });
});
