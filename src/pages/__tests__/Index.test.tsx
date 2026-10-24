import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "../Index";
import { ENQUIRY_INTENTS } from "@/lib/site";

vi.mock("@marsidev/react-turnstile", () => ({ Turnstile: () => <div data-testid="turnstile" /> }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke: vi.fn() } } }));

const renderHome = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={["/"]}>
        <Index />
      </MemoryRouter>
    </HelmetProvider>,
  );

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

describe("Home page", () => {
  it("keeps every old section anchor working", () => {
    renderHome();
    for (const id of ["about", "advisory", "services", "speaking", "resources", "publications", "contact"]) {
      expect(document.getElementById(id), `#${id}`).not.toBeNull();
    }
  });

  it("leads with the approved hero, three service rows and the real contact form", () => {
    renderHome();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "AI & robotics strategy.Swiss ecosystem expertise.",
    );
    const services = document.getElementById("services")!;
    expect(within(services).getAllByRole("article")).toHaveLength(3);
    for (const link of within(services).getAllByRole("link")) {
      const href = link.getAttribute("href")!;
      if (href.startsWith("/?enquiry=")) {
        expect(ENQUIRY_INTENTS).toContain(new URLSearchParams(href.slice(1).split("#")[0]).get("enquiry"));
      }
    }
    expect(screen.getByRole("form", { name: "Contact form" })).toBeInTheDocument();
    expect(screen.getByTestId("turnstile")).toBeInTheDocument();
  });

  it("uses the confirmed TechDrive Zürich role and follows the copy rules", () => {
    const { container } = renderHome();
    expect(container.textContent).toContain("Founder and Host of TechDrive Zürich");
    expect(container.textContent).not.toMatch(/\u2014/);
    expect(container.innerHTML).not.toMatch(/mailto:|[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
  });
});
