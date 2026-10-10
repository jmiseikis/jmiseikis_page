import type { ReactNode } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Seo from "@/components/site/Seo";

/** Shared page shell: skip link, header, main landmark, footer and per-route metadata. */
const SiteLayout = ({ path, children }: { path: string; children: ReactNode }) => (
  <div className="flex min-h-screen flex-col bg-background text-foreground">
    <Seo path={path} />
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
);

export default SiteLayout;
