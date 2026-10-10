import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Scrolls to the top on route changes and to the target of a hash once it has rendered,
 * so cross-route links such as /?enquiry=speaking#contact and old anchors like /#about work.
 */
const ScrollManager = () => {
  const { pathname, hash } = useLocation();
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    const pathChanged = previousPath.current !== pathname;
    previousPath.current = pathname;

    if (!hash) {
      // "instant" overrides the CSS smooth scrolling used for in-page jumps.
      if (pathChanged) window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      return;
    }

    let id: string;
    try {
      id = decodeURIComponent(hash.slice(1));
    } catch {
      return;
    }

    let attempts = 0;
    let timer: number | undefined;
    const tryScroll = () => {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ block: "start", behavior: (pathChanged || prefersReducedMotion() ? "instant" : "smooth") as ScrollBehavior });
        return;
      }
      // Content such as the contact section may render after data loads; retry briefly.
      if (attempts++ < 30) timer = window.setTimeout(tryScroll, 100);
    };
    tryScroll();
    return () => window.clearTimeout(timer);
  }, [pathname, hash]);

  return null;
};

export default ScrollManager;
