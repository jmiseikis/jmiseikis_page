import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Speaking from "@/components/Speaking";

/**
 * Visual regression / structural test for the Speaking section.
 *
 * Guards the alignment fix: every topic card must use the SAME class string
 * (no `md:col-span-2` outlier on the last card). If someone reintroduces a
 * conditional width, this test fails.
 */
describe("Speaking section — topic card alignment", () => {
  it("renders all topic cards with identical width classes (no col-span outlier)", () => {
    const { container } = render(
      <MemoryRouter>
        <Speaking />
      </MemoryRouter>
    );

    // The grid lives directly inside the "Speaking Topics" wrapper.
    const grid = container.querySelector("#speaking .grid");
    expect(grid).not.toBeNull();

    const cards = Array.from(grid!.children) as HTMLElement[];
    expect(cards.length).toBeGreaterThanOrEqual(8);

    const classSet = new Set(cards.map((c) => c.className));
    // All cards must share one class string → uniform alignment.
    expect(classSet.size).toBe(1);

    // No card should opt into spanning two columns.
    cards.forEach((c) => {
      expect(c.className).not.toMatch(/col-span-2/);
    });
  });

  it("matches the topic-grid snapshot", () => {
    const { container } = render(
      <MemoryRouter>
        <Speaking />
      </MemoryRouter>
    );
    const grid = container.querySelector("#speaking .grid");
    expect(grid?.outerHTML).toMatchSnapshot();
  });
});
