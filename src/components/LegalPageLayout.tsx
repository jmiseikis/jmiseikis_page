import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PageMeta, { type RoutePath } from "@/components/site/PageMeta";

interface LegalPageLayoutProps {
  /** Visible H1. The title, description and preview image come from src/content/seo.json. */
  heading: string;
  /** Route path, e.g. "/privacy". */
  path: RoutePath;
  lastUpdated: { iso: string; label: string };
  children: ReactNode;
}

// Long-form layout for /privacy and /terms inside the shared site shell (back link, eyebrow + H1 header).
const LegalPageLayout = ({ heading, path, lastUpdated, children }: LegalPageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <PageMeta path={path} />

      <div className="pt-12 md:pt-16 pb-16">
        <article className="container px-4 max-w-3xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <header className="mb-12">
            <span className="text-primary font-medium tracking-wider uppercase text-sm">Legal</span>
            <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-6">{heading}</h1>
            <p className="text-sm text-muted-foreground">
              Last updated: <time dateTime={lastUpdated.iso}>{lastUpdated.label}</time>
            </p>
          </header>

          <div className="space-y-12 text-muted-foreground leading-relaxed">{children}</div>
        </article>
      </div>

    </div>
  );
};

export const LegalSection = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="space-y-4">
    <h2 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
    {children}
  </section>
);

export const LegalSubsection = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="space-y-4 pt-2">
    <h3 className="text-xl font-bold text-foreground">{title}</h3>
    {children}
  </div>
);

// Same bullet as the "Typical Engagements" list in src/pages/AdvisoryPage.tsx.
export const LegalList = ({ items }: { items: ReactNode[] }) => (
  <ul className="space-y-3">
    {items.map((item, index) => (
      <li key={index} className="flex items-start gap-3">
        <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" aria-hidden="true" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

export default LegalPageLayout;
