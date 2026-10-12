import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollManager from "@/components/site/ScrollManager";
import { isLightOnlyRoute } from "@/lib/site";

/**
 * Shared page shell: theme, skip link, sticky header, main landmark and footer around every route.
 * The site starts in the light theme; the header switch stores the visitor's choice.
 */
const SiteShell = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="jm-theme"
      disableTransitionOnChange
      forcedTheme={isLightOnlyRoute(pathname) ? "light" : undefined}
    >
      <ScrollManager />
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <a
          href="#main"
          className="sr-only z-[100] bg-background px-4 py-3 text-sm font-semibold text-foreground focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
        >
          Skip to content
        </a>
        <Navigation />
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default SiteShell;
