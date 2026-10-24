import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Link, MemoryRouter } from "react-router-dom";
import ScrollManager from "@/components/site/ScrollManager";

const renderAt = (path: string, target?: HTMLElement) => {
  if (target) document.body.appendChild(target);
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ScrollManager />
    </MemoryRouter>,
  );
};

const section = (id: string, top: () => number) => {
  const el = document.createElement("section");
  el.id = id;
  el.scrollIntoView = vi.fn();
  el.getBoundingClientRect = () => ({ top: top() }) as DOMRect;
  return el;
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
});

describe("ScrollManager", () => {
  it("scrolls to the top when the URL has no hash", () => {
    renderAt("/advisory");
    expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
  });

  it("scrolls to a hash target that renders after navigation", () => {
    const el = section("contact", () => 500);
    renderAt("/#contact");
    expect(el.scrollIntoView).not.toHaveBeenCalled();
    document.body.appendChild(el);
    act(() => vi.advanceTimersByTime(100));
    expect(el.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("starts a new page at the top even when its hash target never appears", () => {
    renderAt("/advisory#does-not-exist");
    expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
    act(() => vi.advanceTimersByTime(4000));
  });

  it("moves keyboard focus to the target so the next Tab continues from there", () => {
    const el = section("contact", () => 500);
    renderAt("/#contact", el);
    expect(el).toHaveFocus();
    expect(el).toHaveAttribute("tabindex", "-1");
    act(() => el.blur());
    expect(el).not.toHaveAttribute("tabindex");
  });

  it("scrolls again when content above the target changes height", () => {
    let top = 2000;
    const el = section("company-list", () => top);
    renderAt("/gza-robotics#company-list", el);
    expect(el.scrollIntoView).toHaveBeenCalledTimes(1);

    top = 1870;
    act(() => vi.advanceTimersByTime(200));
    expect(el.scrollIntoView).toHaveBeenCalledTimes(2);

    act(() => vi.advanceTimersByTime(2000));
    expect(el.scrollIntoView).toHaveBeenCalledTimes(2);
  });

  it("jumps when arriving from another page and scrolls smoothly within the page", () => {
    const el = section("contact", () => 500);
    document.body.appendChild(el);
    render(
      <MemoryRouter initialEntries={["/advisory"]}>
        <ScrollManager />
        <Link to="/#contact">Home contact</Link>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText("Home contact"));
    expect(el.scrollIntoView).toHaveBeenLastCalledWith(expect.objectContaining({ behavior: "instant" }));

    fireEvent.click(screen.getByText("Home contact"));
    expect(el.scrollIntoView).toHaveBeenLastCalledWith(expect.objectContaining({ behavior: "smooth" }));
  });

  it("stops following once the visitor scrolls", () => {
    let top = 2000;
    const el = section("company-list", () => top);
    renderAt("/gza-robotics#company-list", el);
    window.dispatchEvent(new Event("wheel"));
    top = 1870;
    act(() => vi.advanceTimersByTime(400));
    expect(el.scrollIntoView).toHaveBeenCalledTimes(1);
  });
});
