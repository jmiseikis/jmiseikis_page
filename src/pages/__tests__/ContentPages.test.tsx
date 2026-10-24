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
import AdvisoryPage from "../AdvisoryPage";
import DueDiligencePage from "../DueDiligencePage";
import AiAgentsStrategy from "../AiAgentsStrategy";
import De from "../De";
import RaasCalculator from "../RaasCalculator";
import { ENQUIRY_INTENTS } from "@/lib/site";
import seo from "@/content/seo.json";

const ROOT = process.cwd();
const appSource = readFileSync(join(ROOT, "src/App.tsx"), "utf8");
const ROUTES = new Set([...appSource.matchAll(/path="([^"*:]+)"/g)].map((m) => m[1]));
const sitemap = readFileSync(join(ROOT, "public/sitemap.xml"), "utf8");
// The owner works and speaks in English only (the German page says so).
const GERMAN_DELIVERY = /auf Deutsch|in German\b|German-speaking (?:advisor|speaker)|deutschsprachige[rn]? (?:Beratung|Vortr)|bilingual/i;

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
  ["/advisory", AdvisoryPage, "Turn technical possibilities into informed decisions."],
  ["/due-diligence", DueDiligencePage, "AI & robotics due diligence."],
  ["/ai-agents-strategy", AiAgentsStrategy, "Make AI useful inside your business."],
  ["/de", De, "KI- und Robotikstrategie. Schweizer Ökosystem."],
  ["/raas-calculator", RaasCalculator, "RaaS ROI calculator."],
] as const;

describe.each(PAGES)("%s", (path, Page, heading) => {
  it("is routed, prerendered and in the sitemap", () => {
    expect(ROUTES.has(path)).toBe(true);
    expect(seo.routes).toHaveProperty([path]);
    expect(sitemap).toContain(`<loc>https://jmiseikis.com${path}</loc>`);
  });

  it("renders one H1 and the same title and description as the prerendered HTML", async () => {
    renderPage(Page, path);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(heading);
    // Helmet applies tags asynchronously; wait until this page's own canonical is in place.
    await waitFor(() =>
      expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute("href", `https://jmiseikis.com${path}`),
    );
    expect(document.title).toBe(seo.routes[path].title);
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute("content", seo.routes[path].description);
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
    expect(container.textContent).not.toMatch(GERMAN_DELIVERY);
  });
});

describe("Language of delivery", () => {
  it("never claims work or talks in German, in the static HTML or llms.txt either", () => {
    for (const file of ["index.html", "public/llms.txt"]) {
      expect(readFileSync(join(ROOT, file), "utf8"), file).not.toMatch(GERMAN_DELIVERY);
    }
  });
});

describe("Advisory page", () => {
  it("anchors every offer, so guides and the Speaking page can link to one", () => {
    renderPage(AdvisoryPage, "/advisory");
    for (const id of ["market-entry", "scouting-diligence", "swiss-presence", "internal-ai"]) {
      expect(document.getElementById(id), `#${id}`).not.toBeNull();
    }
  });
});

describe("Due diligence page", () => {
  it("has the stage section the Resources page links to, with the checklist download", () => {
    renderPage(DueDiligencePage, "/due-diligence");
    const stage = document.getElementById("stage")!;
    expect(within(stage).getByRole("link", { name: /Fill in the diligence checklist/ })).toHaveAttribute(
      "href",
      "/worksheets/technical-diligence-checklist",
    );
    expect(within(stage).getByRole("link", { name: /Download checklist \(PDF\)/ })).toHaveAttribute(
      "href",
      "/downloads/technical-diligence-checklist.pdf",
    );
  });
});

describe("German page", () => {
  it("states English delivery and keeps the confirmed facts", () => {
    const { container } = renderPage(De, "/de");
    expect(container.textContent).toContain("Beratung, Workshops und Vorträge ausschliesslich auf Englisch.");
    expect(container.textContent).toContain("Beratung, Due Diligence, Workshops und Vorträge erfolgen ausschliesslich auf Englisch.");
    expect(container.textContent).toContain("Gründer und Host von");
    expect(screen.getByRole("link", { name: /TechDrive Zürich/ })).toHaveAttribute("href", "https://techdrive.tv/");
    expect(container.textContent).toContain("15+ begutachtete Publikationen, 700+ Zitierungen und 40+ Patente");
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
  it("offers all four worksheets to fill in online or download as PDF", () => {
    renderPage(ResourcesPage, "/resources");
    const templates = screen.getByRole("region", { name: "Blank briefs to use with your team." });
    const files = within(templates)
      .getAllByRole("link")
      .map((a) => a.getAttribute("href"));
    expect(files).toEqual([
      "/worksheets/technology-scouting-brief",
      "/downloads/technology-scouting-brief.pdf",
      "/worksheets/market-entry-brief",
      "/downloads/market-entry-brief.pdf",
      "/worksheets/ai-workflow-pilot-brief",
      "/downloads/ai-workflow-pilot-brief.pdf",
      "/worksheets/technical-diligence-checklist",
      "/downloads/technical-diligence-checklist.pdf",
    ]);
  });
});
