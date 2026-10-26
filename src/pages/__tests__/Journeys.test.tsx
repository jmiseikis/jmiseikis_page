import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "../Index";
import AdvisoryPage from "../AdvisoryPage";
import SpeakingPage from "../SpeakingPage";
import PublicationsPage from "../PublicationsPage";

vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke: vi.fn().mockResolvedValue({ data: { videos: [] }, error: null }) } } }));

const renderPage = (Page: () => JSX.Element) =>
  render(
    <HelmetProvider>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MemoryRouter>
          <Page />
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  );

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

describe("Visitor journeys", () => {
  it("lets home page visitors start from their task", () => {
    renderPage(Index);
    const tasks = screen.getByRole("navigation", { name: "Start with your task" });
    expect(within(tasks).getAllByRole("link").map((a) => a.getAttribute("href"))).toEqual([
      "/due-diligence",
      "/swiss-ai-robotics-ecosystem",
      "/ai-agents-strategy",
      "/speaking",
    ]);
  });

  it("labels the advisory work examples as illustrative and links each to its worksheet", () => {
    renderPage(AdvisoryPage);
    const examples = screen.getByRole("region", { name: "Examples of typical outputs." });
    expect(examples).toHaveTextContent("They are not client work: names and figures are invented.");
    expect(within(examples).getAllByRole("link").map((a) => a.getAttribute("href"))).toEqual([
      "/worksheets/technical-diligence-checklist",
      "/worksheets/technology-scouting-brief",
      "/worksheets/ai-workflow-pilot-brief",
    ]);
  });

  it("gives event organisers accurate biographies, a headshot and a speaking enquiry", () => {
    renderPage(SpeakingPage);
    const kit = screen.getByRole("region", { name: "Speaker kit." });
    expect(kit).toHaveTextContent("Strategy and Partnerships Manager at Sony AI and Founder and Host of TechDrive Zürich");
    expect(kit).toHaveTextContent("15+ peer-reviewed papers, 700+ citations and 40+ patents");
    expect(within(kit).getByRole("link", { name: "Download headshot" })).toHaveAttribute("download");
    expect(within(kit).getByRole("link", { name: /Enquire with date, audience and format/ })).toHaveAttribute(
      "href",
      "/?enquiry=speaking#contact",
    );
    expect(kit.textContent).not.toMatch(/—|@[\w-]+\./);
  });

  it("explains why each selected paper matters", () => {
    renderPage(PublicationsPage);
    expect(screen.getAllByText("Why it matters:")).toHaveLength(3);
  });
});
