import { useCallback, useEffect, useRef, useState, type FocusEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { CONTACT_PATH, NAV_LINKS, type NavLinkConfig } from "@/lib/site";
import ThemeToggle from "@/components/site/ThemeToggle";

const Navigation = () => {
  const { pathname, key } = useLocation();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback((returnFocus = false) => {
    setOpen(false);
    if (returnFocus) toggleRef.current?.focus({ preventScroll: true });
  }, []);

  // Close the mobile menu after any navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname, key]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(true);
    };
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !toggleRef.current?.contains(target)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open, close]);

  // The page's scroll padding keeps anchors and focused content clear of this sticky header, but it also
  // makes the browser treat the header's own controls as hidden and scroll when one of them gets focus.
  // That scroll is set up before focus events fire. Scroll events arrive a frame later, so lastScrollY
  // still holds the position from before the focus change: go back to it, which also cancels a smooth
  // scroll that has not started moving yet.
  const lastScrollY = useRef(0);
  useEffect(() => {
    lastScrollY.current = window.scrollY;
    const onScroll = () => {
      lastScrollY.current = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const onFocus = () => {
    window.scrollTo({ top: lastScrollY.current, left: window.scrollX, behavior: "instant" as ScrollBehavior });
  };

  // Keyboard focus leaving the open panel must not land on something the panel covers.
  const onBlur = (event: FocusEvent<HTMLElement>) => {
    const next = event.relatedTarget as Node | null;
    if (open && next && !event.currentTarget.contains(next)) setOpen(false);
  };

  const isCurrent = (link: NavLinkConfig) => pathname === link.to;
  const inSection = (link: NavLinkConfig) => isCurrent(link) || link.section.includes(pathname);
  const currentState = (link: NavLinkConfig) => (isCurrent(link) ? "page" : inSection(link) ? "true" : undefined);

  return (
    <header lang="en" onFocus={onFocus} onBlur={onBlur} className="site-header sticky top-0 z-50 border-b border-border bg-background">
      <div className="site-wrap flex h-[calc(var(--header-h)-1px)] items-center justify-between gap-3 nav:gap-6">
        <Link
          to="/"
          className="whitespace-nowrap text-[14px] tracking-[-0.04em] text-foreground xs:text-[15px] md:text-base"
        >
          Dr. Justinas <strong className="font-extrabold">Mišeikis</strong>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-4 nav:flex xl:gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              aria-current={currentState(link)}
              className={cn(
                "text-[13px] font-semibold underline-offset-[6px] transition-colors hover:text-primary",
                inSection(link) ? "text-primary underline" : "text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
          <Link
            to={CONTACT_PATH}
            className="inline-flex min-h-11 items-center gap-3 border border-primary bg-primary px-4 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-foreground hover:border-foreground hover:text-background"
          >
            Discuss a project <span aria-hidden="true">↗</span>
          </Link>
        </nav>

        <div className="flex items-center gap-1 nav:hidden">
          <ThemeToggle compact />
          <button
            ref={toggleRef}
            type="button"
            className="min-h-11 min-w-11 px-2 text-[13px] font-semibold text-foreground"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen((value) => !value)}
          >
            Menu
          </button>
        </div>
      </div>

      <div
        ref={panelRef}
        id="mobile-navigation"
        hidden={!open}
        className="absolute inset-x-0 top-full max-h-[calc(100dvh-var(--header-h))] overflow-y-auto border-b border-border bg-background nav:hidden"
      >
        <nav aria-label="Mobile navigation" className="site-wrap flex flex-col gap-1 py-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              aria-current={currentState(link)}
              className={cn(
                "flex min-h-11 items-center text-base font-semibold",
                inSection(link) ? "text-primary underline underline-offset-[6px]" : "text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to={CONTACT_PATH}
            className="mt-3 inline-flex min-h-12 items-center justify-between gap-4 border border-primary bg-primary px-5 text-sm font-semibold text-primary-foreground"
          >
            Discuss a project <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navigation;
