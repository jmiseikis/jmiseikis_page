import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { contactPath } from "@/lib/site";
import ThemeToggle from "@/components/site/ThemeToggle";

const NAV_LINKS = [
  { label: "Advisory", to: "/advisory", section: ["/advisory", "/due-diligence"] },
  { label: "Speaking", to: "/speaking", section: ["/speaking"] },
  {
    label: "Resources",
    to: "/resources",
    section: [
      "/resources",
      "/swiss-ai-robotics-ecosystem",
      "/swiss-baltic-market-entry",
      "/ai-agents-strategy",
      "/gza-robotics",
      "/swiss-vcs",
      "/tech-events",
      "/raas-calculator",
    ],
  },
  { label: "Publications", to: "/publications", section: ["/publications"] },
  { label: "About", to: "/about", section: ["/about"] },
];

const Navigation = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback((returnFocus = false) => {
    setOpen(false);
    if (returnFocus) toggleRef.current?.focus();
  }, []);

  // Close the mobile menu on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(true);
    };
    const onClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !toggleRef.current?.contains(target)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, close]);

  const linkState = (link: (typeof NAV_LINKS)[number]) => ({
    current: pathname === link.to,
    inSection: link.section.includes(pathname),
  });

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="site-wrap flex min-h-[68px] items-center justify-between gap-3 md:min-h-20 lg:gap-6">
        <Link
          to="/"
          className="whitespace-nowrap text-[14px] tracking-[-0.04em] text-foreground no-underline min-[375px]:text-[15px] md:text-base"
        >
          Dr. Justinas <strong className="font-extrabold">Mišeikis</strong>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-5 lg:flex xl:gap-6">
          {NAV_LINKS.map((link) => {
            const { current, inSection } = linkState(link);
            return (
              <Link
                key={link.to}
                to={link.to}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "text-[13px] font-semibold no-underline underline-offset-[6px] transition-colors hover:text-primary",
                  inSection ? "text-primary underline" : "text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <ThemeToggle />
          <Link
            to={contactPath("advisory")}
            className="inline-flex min-h-11 items-center gap-3 border border-primary bg-primary px-4 text-[13px] font-semibold text-primary-foreground no-underline hover:brightness-90"
          >
            Discuss a project <span aria-hidden="true">↗</span>
          </Link>
        </nav>

        <div className="flex items-center gap-1 lg:hidden">
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
        className="absolute inset-x-0 top-full border-b border-border bg-background lg:hidden"
      >
        <nav aria-label="Mobile navigation" className="site-wrap flex flex-col gap-1 py-4">
          {NAV_LINKS.map((link) => {
            const { current, inSection } = linkState(link);
            return (
              <Link
                key={link.to}
                to={link.to}
                aria-current={current ? "page" : undefined}
                onClick={() => close()}
                className={cn(
                  "flex min-h-11 items-center text-base font-semibold no-underline",
                  inSection ? "text-primary" : "text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            to={contactPath("advisory")}
            onClick={() => close()}
            className="mt-3 inline-flex min-h-12 items-center justify-between gap-4 border border-primary bg-primary px-5 text-sm font-semibold text-primary-foreground no-underline"
          >
            Discuss a project <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navigation;
