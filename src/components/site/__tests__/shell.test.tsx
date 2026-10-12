import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import SiteShell from "@/components/site/SiteShell";
import Advisory from "@/components/Advisory";

const renderShell = (path = "/", content: React.ReactNode = <p>Page body</p>) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <SiteShell>{content}</SiteShell>
      </MemoryRouter>
    </HelmetProvider>,
  );

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

describe("Site header", () => {
  it("links the five sections and the contact call to action", () => {
    renderShell();
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    const links = within(nav).getAllByRole("link").map((a) => [a.textContent?.trim(), a.getAttribute("href")]);
    expect(links).toEqual([
      ["Advisory", "/advisory"],
      ["Speaking", "/speaking"],
      ["Resources", "/#resources"],
      ["Publications", "/#publications"],
      ["About", "/#about"],
      ["Discuss a project ↗", "/#contact"],
    ]);
  });

  it("marks the section of the current page", () => {
    renderShell("/due-diligence");
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    expect(within(nav).getByRole("link", { name: "Advisory" })).toHaveClass("text-primary");
    expect(within(nav).getByRole("link", { name: "Speaking" })).not.toHaveClass("text-primary");
  });

  it("opens the mobile menu and closes it with Escape, returning focus to the button", () => {
    renderShell();
    const button = screen.getByRole("button", { name: "Menu" });
    const panel = document.getElementById("mobile-navigation")!;
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(panel).not.toBeVisible();

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(panel).toBeVisible();
    expect(within(panel).getByRole("link", { name: "Advisory" })).toHaveAttribute("href", "/advisory");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveFocus();
  });

  it("closes the mobile menu after following a link", () => {
    renderShell();
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    const panel = document.getElementById("mobile-navigation")!;
    fireEvent.click(within(panel).getByRole("link", { name: "Speaking" }));
    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-expanded", "false");
  });
});

describe("Theme", () => {
  it("starts light and switches to dark with the header toggle", () => {
    renderShell();
    const [toggle] = screen.getAllByRole("button", { name: "Dark theme" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(document.documentElement).not.toHaveClass("dark");

    fireEvent.click(toggle);
    expect(document.documentElement).toHaveClass("dark");
    expect(screen.getAllByRole("button", { name: "Dark theme" })[0]).toHaveAttribute("aria-pressed", "true");
    expect(localStorage.getItem("jm-theme")).toBe("dark");
  });

  it("keeps pages that are not yet built for dark mode in the light theme", () => {
    localStorage.setItem("jm-theme", "dark");
    renderShell("/raas-calculator");
    expect(document.documentElement).not.toHaveClass("dark");
    expect(screen.queryByRole("button", { name: "Dark theme" })).not.toBeInTheDocument();
  });

  it("matches light-only routes regardless of case, as the router does", () => {
    localStorage.setItem("jm-theme", "dark");
    renderShell("/RaaS-Calculator");
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("applies a stored dark preference on other pages", () => {
    localStorage.setItem("jm-theme", "dark");
    renderShell("/advisory");
    expect(document.documentElement).toHaveClass("dark");
  });
});

describe("Site footer", () => {
  it("links the deeper routes and the legal pages", () => {
    renderShell();
    const footer = screen.getByRole("contentinfo");
    const href = (name: string) => within(footer).getByRole("link", { name }).getAttribute("href");
    expect(href("Due diligence")).toBe("/due-diligence");
    expect(href("Swiss tech events")).toBe("/tech-events");
    expect(href("Swiss VCs & funds")).toBe("/swiss-vcs");
    expect(href("GZA robotics")).toBe("/gza-robotics");
    expect(href("RaaS calculator")).toBe("/raas-calculator");
    expect(href("Internal AI & workflows")).toBe("/ai-agents-strategy");
    expect(href("Deutsch")).toBe("/de");
    expect(href("Privacy Policy")).toBe("/privacy");
    expect(href("Terms of Use")).toBe("/terms");
    expect(footer.textContent).not.toMatch(/@|\u2014/);
  });

  it("offers English instead of Deutsch on the German page", () => {
    renderShell("/de");
    const footer = screen.getByRole("contentinfo");
    expect(within(footer).getByRole("link", { name: "English" })).toHaveAttribute("href", "/");
    expect(within(footer).queryByRole("link", { name: "Deutsch" })).not.toBeInTheDocument();
  });
});

describe("Old home anchors", () => {
  it("keeps #services next to #advisory", () => {
    renderShell("/", <Advisory />);
    const advisory = document.getElementById("advisory")!;
    expect(advisory).toBeInTheDocument();
    expect(advisory.querySelector("#services")).toBeInTheDocument();
  });

  it("has a skip link to the main landmark", () => {
    renderShell();
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main");
    expect(screen.getByRole("main")).toHaveAttribute("id", "main");
  });
});
