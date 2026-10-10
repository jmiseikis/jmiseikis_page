import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ServiceRow } from "@/components/site/primitives";
import { SERVICES, SIGNATURE_TOPICS, WIDER_TOPICS, PAST_ENGAGEMENTS } from "@/content/services";
import { contactPath, isEnquiryIntent, safeExternalUrl } from "@/lib/site";
import { mergeVideos, normaliseVideo, TECHDRIVE_FALLBACK } from "@/content/media";

describe("ServiceRow", () => {
  it("places the third child in the text column on phones, whatever element it is", () => {
    const { container } = render(
      <MemoryRouter>
        <ServiceRow number="01" title="Title">
          <p>Detail</p>
        </ServiceRow>
      </MemoryRouter>,
    );
    const row = container.querySelector("article")!;
    expect(row.children).toHaveLength(3);
    // Mobile grid: narrow number track + shrinkable text track; the third child starts in column 2.
    expect(row.className).toContain("grid-cols-[25px_minmax(0,1fr)]");
    expect(row.className).toContain("[&>*:nth-child(3)]:col-start-2");
    expect(row.className).toContain("md:[&>*:nth-child(3)]:col-start-auto");
  });
});

describe("content preservation", () => {
  it("keeps all four advisory offers", () => {
    expect(SERVICES.map((s) => s.number)).toEqual(["01", "02", "03", "04"]);
  });

  it("keeps the eight speaking subjects as three signature topics and a wider catalogue", () => {
    expect(SIGNATURE_TOPICS).toHaveLength(3);
    expect(WIDER_TOPICS).toHaveLength(5);
  });

  it("keeps the seven confirmed past engagements and the Davos distinction", () => {
    expect(PAST_ENGAGEMENTS).toHaveLength(7);
    expect(PAST_ENGAGEMENTS[0]).toContain("independently organised during WEF week");
  });
});

describe("enquiry links", () => {
  it("only allows known intents and keeps personal data out of the URL", () => {
    expect(contactPath("speaking")).toBe("/?enquiry=speaking#contact");
    expect(isEnquiryIntent("diligence")).toBe(true);
    expect(isEnquiryIntent("<script>")).toBe(false);
    expect(isEnquiryIntent(null)).toBe(false);
  });
});

describe("safeExternalUrl", () => {
  it("accepts http(s) and rejects script or data URLs", () => {
    expect(safeExternalUrl("https://verve.vc")).toBe("https://verve.vc/");
    expect(safeExternalUrl("www.example.ch")).toBe("https://www.example.ch/");
    expect(safeExternalUrl("javascript:alert(1)")).toBeNull();
    expect(safeExternalUrl("data:text/html,hi")).toBeNull();
    expect(safeExternalUrl("[URL]")).toBeNull();
    expect(safeExternalUrl("")).toBeNull();
  });
});

describe("media", () => {
  it("corrects the truncated short title from the feed", () => {
    const fixed = normaliseVideo({ ...TECHDRIVE_FALLBACK[0], id: "c1O3IAmZ83I", title: "he Secret to Corporate-Startup Collaborations" });
    expect(fixed.title).toBe("The Secret to Corporate-Startup Collaborations");
  });

  it("merges live episodes with the back catalogue without duplicates, newest first", () => {
    const live = [{ ...TECHDRIVE_FALLBACK[1], title: "Live title" }];
    const merged = mergeVideos(live, TECHDRIVE_FALLBACK);
    expect(merged).toHaveLength(TECHDRIVE_FALLBACK.length);
    expect(merged.find((v) => v.id === TECHDRIVE_FALLBACK[1].id)?.title).toBe("Live title");
    expect(merged[0].publishedAt >= merged[merged.length - 1].publishedAt).toBe(true);
  });
});

describe("render smoke test", () => {
  it("renders a service row heading", () => {
    render(
      <MemoryRouter>
        <ServiceRow number="02" title="Startup scouting">
          <p>Body</p>
        </ServiceRow>
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: "Startup scouting" })).toBeInTheDocument();
  });
});
