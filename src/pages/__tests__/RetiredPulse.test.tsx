import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import App from "@/App";

vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke: vi.fn() } } }));

const ROOT = process.cwd();

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  window.history.pushState({}, "", "/");
});

describe("Retired Swiss Tech Pulse", () => {
  it.each([
    "/resources/swiss-tech-pulse",
    "/resources/swiss-tech-pulse/about",
    "/resources/swiss-tech-pulse/digest/2026-W40",
    "/resources/swiss-tech-pulse/review",
  ])("%s falls through to the 404 page without a redirect", async (path) => {
    window.history.pushState({}, "", path);
    render(<App />);
    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent("Let's get you to the right place.");
    expect(window.location.pathname).toBe(path);
  });

  it("is gone from the routes, the prerendered pages, the sitemap and the source", () => {
    for (const file of ["src/App.tsx", "scripts/prerender-meta.mjs", "public/sitemap.xml", "public/llms.txt", "index.html"]) {
      expect(readFileSync(join(ROOT, file), "utf8"), file).not.toMatch(/swiss-tech-pulse|Swiss Tech Pulse/i);
    }
    expect(readdirSync(join(ROOT, "src/components"))).not.toContain("swiss-tech-pulse");
  });
});
