import { beforeEach, describe, expect, it, vi } from "vitest";
import { lazy, Suspense } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { Link, MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Footer from "@/components/Footer";
import RouteErrorBoundary from "@/components/RouteErrorBoundary";
import { lazyRoute } from "@/components/LazyRoute";
import PrivacyPolicy from "../PrivacyPolicy";
import TermsOfUse from "../TermsOfUse";

// The only place the owner's email may appear (OWNER_FACTS.md): plain text on /privacy and /terms.
const PRIVACY_CONTACT = "dr.miseikis@gmail.com";

const renderWithProviders = (ui: React.ReactElement, path = "/") =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>
    </HelmetProvider>,
  );

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

describe.each([
  ["Privacy Policy", PrivacyPolicy, "12 October 2026", "2026-10-12"],
  ["Terms of Use", TermsOfUse, "24 October 2026", "2026-10-24"],
])("%s page", (heading, Page, label, iso) => {
  it("renders one H1 and the publication date", () => {
    renderWithProviders(<Page />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(heading);
    expect(screen.getByText(label).closest("time")).toHaveAttribute("datetime", iso);
  });

  it("shows the privacy contact as plain text, never as a link", () => {
    const { container } = renderWithProviders(<Page />);
    expect(container.textContent).toContain(PRIVACY_CONTACT);
    expect(container.querySelector('a[href^="mailto:"]')).toBeNull();
    const links = Array.from(container.querySelectorAll("a"));
    expect(links.some((a) => a.textContent?.includes("@"))).toBe(false);
  });

  it("has no em dashes or unfilled placeholders in the copy", () => {
    const { container } = renderWithProviders(<Page />);
    expect(container.textContent).not.toMatch(/\u2014/);
    expect(container.textContent).not.toMatch(/\[publication date\]/i);
  });
});

describe("Privacy Policy", () => {
  it("names every third party the browser contacts", () => {
    renderWithProviders(<PrivacyPolicy />);
    for (const service of ["Google Fonts", "Google Sheets", "YouTube image servers", "Cloudflare Turnstile"]) {
      expect(screen.getByText(service)).toBeInTheDocument();
    }
  });
});

describe("Terms of Use", () => {
  it("links to the Privacy Policy from its Privacy section", () => {
    renderWithProviders(<TermsOfUse />);
    // Scope to the section: the footer on the same page has its own Privacy Policy link.
    const section = screen.getByRole("heading", { level: 2, name: "Privacy" }).closest("section")!;
    expect(within(section).getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy");
  });
});

describe("Footer", () => {
  it("links to the legal pages and shows no email address", () => {
    const { container } = renderWithProviders(<Footer />);
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: "Terms of Use" })).toHaveAttribute("href", "/terms");
    expect(container.textContent).not.toContain("@");
  });

  it("sends the footer Contact link to the home page form when used on another page", () => {
    const Where = () => {
      const location = useLocation();
      return <span data-testid="where">{location.pathname + location.hash}</span>;
    };
    renderWithProviders(
      <Routes>
        <Route path="*" element={<><Footer /><Where /></>} />
      </Routes>,
      "/privacy",
    );
    const contact = screen.getByRole("link", { name: "Contact" });
    expect(contact).toHaveAttribute("href", "/#contact");
    fireEvent.click(contact);
    expect(screen.getByTestId("where")).toHaveTextContent("/#contact");
  });
});

describe("Lazy legal routes", () => {
  it("offer a reload instead of a blank page when the page fails to load", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const Broken = lazy(() => Promise.reject(new Error("Failed to fetch dynamically imported module")));
    render(
      <RouteErrorBoundary>
        <Suspense fallback={null}>
          <Broken />
        </Suspense>
      </RouteErrorBoundary>,
    );
    expect(await screen.findByText("This page could not be loaded.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reload the page" })).toBeInTheDocument();
  });

  it("do not carry one page's load failure over to the next lazy page", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const Broken = lazy(() => Promise.reject(new Error("Failed to fetch dynamically imported module")));
    const Working = lazy(() => Promise.resolve({ default: () => <p>Working page</p> }));
    render(
      <MemoryRouter initialEntries={["/broken"]}>
        <Link to="/working">Go on</Link>
        <Routes>
          <Route path="/broken" element={lazyRoute("/broken", <Broken />)} />
          <Route path="/working" element={lazyRoute("/working", <Working />)} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByText("This page could not be loaded.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "Go on" }));
    expect(await screen.findByText("Working page")).toBeInTheDocument();
    expect(screen.queryByText("This page could not be loaded.")).not.toBeInTheDocument();
  });
});
