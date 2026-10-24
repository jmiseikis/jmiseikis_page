import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SpeakingPage from "../SpeakingPage";
import { supabase } from "@/integrations/supabase/client";
import { PERSONAL_FALLBACK, TECHDRIVE_FALLBACK } from "@/content/media";

vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke: vi.fn() } } }));
const invoke = supabase.functions.invoke as unknown as ReturnType<typeof vi.fn>;

const item = (id: string, title: string, publishedAt: string, isShort = false) => ({
  id,
  title,
  description: "",
  url: isShort ? `https://www.youtube.com/shorts/${id}` : `https://www.youtube.com/watch?v=${id}`,
  thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  publishedAt,
  isShort,
  views: 0,
});

const renderPage = () =>
  render(
    <HelmetProvider>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MemoryRouter initialEntries={["/speaking"]}>
          <SpeakingPage />
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  );

beforeEach(() => {
  invoke.mockReset();
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

describe("Speaking page", () => {
  it("shows the live feed, fixes the truncated title and keeps the TechDrive back catalogue", async () => {
    invoke.mockResolvedValue({
      data: {
        videos: [
          item("live-talk-01", "A brand new talk", "2026-10-20"),
          item("c1O3IAmZ83I", "he Secret to Corporate-Startup Collaborations", "2026-04-02", true),
        ],
        techdrive: { episodes: [item("newepisode1", "Newest TechDrive episode", "2026-10-21")] },
      },
      error: null,
    });
    renderPage();
    const talks = await screen.findByRole("region", { name: "Watch the work." });
    expect(await within(talks).findByText("A brand new talk")).toBeInTheDocument();
    expect(within(talks).getByText("The Secret to Corporate-Startup Collaborations")).toBeInTheDocument();
    expect(within(talks).queryByText(/live video feed is unavailable/)).not.toBeInTheDocument();

    const techdrive = screen.getByRole("region", { name: "TechDrive Zürich" });
    expect(within(techdrive).getByText("Newest TechDrive episode")).toBeInTheDocument();
    // Older episodes from the curated list stay reachable even though the feed only returns recent ones.
    const oldest = TECHDRIVE_FALLBACK[TECHDRIVE_FALLBACK.length - 1];
    expect(within(techdrive).getByText(oldest.title)).toBeInTheDocument();
  });

  it("falls back to the dated snapshot, and says so, when the feed fails", async () => {
    invoke.mockResolvedValue({ data: null, error: new Error("feed down") });
    renderPage();
    expect(await screen.findByText(/live video feed is unavailable/)).toBeInTheDocument();
    const talks = screen.getByRole("region", { name: "Watch the work." });
    const firstTalk = PERSONAL_FALLBACK.find((v) => !v.isShort)!;
    expect(within(talks).getByText(firstTalk.title)).toBeInTheDocument();
  });

  it("keeps the speaking catalogue, past engagements and booking routes", async () => {
    invoke.mockResolvedValue({ data: { videos: [] }, error: null });
    const { container } = renderPage();
    for (const topic of [
      "Physical AI: from demonstration to deployment",
      "Corporate-startup collaboration that moves forward",
      "Evaluating AI and robotics beyond the pitch",
      "AI commercialisation & ethics",
      "The future of human-robot interaction",
    ]) {
      expect(screen.getByText(topic)).toBeInTheDocument();
    }
    expect(screen.getByText("Wisdom House @ Davos 2026 - independently organised during WEF week")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Book via Premium Speakers/ })).toHaveAttribute(
      "href",
      "https://premium-speakers.com/en/speaker-presenter/justinas-miseikis/",
    );
    expect(container.textContent).toContain("As Founder and Host of TechDrive Zürich");
    expect(container.textContent).not.toMatch(/\u2014/);
    expect(container.innerHTML).not.toMatch(/mailto:|[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
  });
});
