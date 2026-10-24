import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

/**
 * React Router does not scroll on navigation. This scrolls to the top on every navigation
 * without a hash, and to the hash target once it has rendered (old home anchors such as
 * /#about and cross-page links such as /#contact). location.key changes on every click,
 * so following the same link twice still scrolls.
 *
 * Within a page the scroll is smooth. Arriving from another page it jumps, then follows the
 * target while images and sheet data above it settle: Chromium mishandles a jump issued
 * during a smooth scroll, so the two are never mixed.
 */
const ScrollManager = () => {
  const { pathname, hash, key } = useLocation();
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    const samePage = previousPath.current === pathname;
    previousPath.current = pathname;

    // A new page always starts at the top, so a hash that never resolves does not leave the visitor at the
    // previous page's scroll position.
    if (!hash || !samePage) window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    if (!hash) return;

    let id: string;
    try {
      id = decodeURIComponent(hash.slice(1));
    } catch {
      return;
    }

    let attempts = 0;
    let timer: number | undefined;
    let follow: number | undefined;
    let visitorScrolled = false;
    const onInput = () => {
      visitorScrolled = true;
    };
    const inputs = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    inputs.forEach((type) => window.addEventListener(type, onInput, { passive: true }));

    const pageTop = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;

    // Scrolling alone leaves keyboard focus on the link that was used, so the next Tab would go back
    // to the header or footer. Move focus to the section, as a native fragment link does.
    const focusTarget = (el: HTMLElement) => {
      if (!el.hasAttribute("tabindex")) {
        el.setAttribute("tabindex", "-1");
        el.addEventListener("blur", () => el.removeAttribute("tabindex"), { once: true });
      }
      el.focus({ preventScroll: true });
    };

    const tryScroll = () => {
      const target = document.getElementById(id);
      if (!target) {
        // Sections can render a moment after navigation; retry briefly.
        if (attempts++ < 30) timer = window.setTimeout(tryScroll, 100);
        return;
      }
      if (samePage) {
        target.scrollIntoView({ block: "start", behavior: reducedMotion() ? "auto" : "smooth" });
        focusTarget(target);
        return;
      }
      target.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior });
      focusTarget(target);

      // Follow the target for two seconds, unless the visitor scrolls first.
      let last = pageTop(target);
      let checks = 0;
      follow = window.setInterval(() => {
        if (visitorScrolled || !target.isConnected || checks++ >= 10) {
          window.clearInterval(follow);
          return;
        }
        const now = pageTop(target);
        if (Math.abs(now - last) > 2) {
          last = now;
          target.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior });
        }
      }, 200);
    };
    tryScroll();
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(follow);
      inputs.forEach((type) => window.removeEventListener(type, onInput));
    };
  }, [pathname, hash, key]);

  return null;
};

export default ScrollManager;
