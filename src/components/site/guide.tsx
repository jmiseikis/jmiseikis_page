import type { ReactNode } from "react";
import { Actions, ButtonLink, Eyebrow } from "@/components/site/primitives";
import { worksheetPath, worksheetPdf, type WorksheetSlug } from "@/content/worksheets";

/** Visible authorship and review date for a guide. The sources on the page were checked on this date. */
export const EditorialMeta = ({ topic }: { topic: string }) => (
  <p className="site-wrap mt-4 text-[11px] text-muted-foreground md:text-xs">
    By Dr. Justinas Mišeikis · Updated <time dateTime="2026-10-06">6 October 2026</time> · {topic}
  </p>
);

/** "On this page" links for a long guide, shown under its date line. */
export const GuideContents = ({ sections }: { sections: { id: string; label: string }[] }) => (
  <nav aria-label="On this page" className="site-wrap mt-6">
    <p className="eyebrow mb-2">On this page</p>
    <ol className="flex list-none flex-col gap-x-6 gap-y-1 p-0 md:flex-row md:flex-wrap">
      {sections.map((section) => (
        <li key={section.id}>
          <a
            href={`#${section.id}`}
            className="inline-flex min-h-11 items-center text-sm text-foreground underline decoration-border underline-offset-4 hover:text-primary hover:decoration-primary"
          >
            {section.label}
          </a>
        </li>
      ))}
    </ol>
  </nav>
);

export const StepList = ({
  steps,
  className,
}: {
  steps: { eyebrow?: string; title: string; text: ReactNode; decision?: string }[];
  className?: string;
}) => (
  <ol className={className ? `list-none p-0 ${className}` : "list-none p-0"}>
    {steps.map((step, index) => (
      <li key={step.title} className="relative border-t border-border py-5 pl-11">
        <span aria-hidden="true" className="absolute left-0 top-6 text-xs text-primary">
          0{index + 1}
        </span>
        {step.eyebrow && <Eyebrow className="mb-2">{step.eyebrow}</Eyebrow>}
        <h3 className="text-[19px] leading-tight">{step.title}</h3>
        <div className="mt-2 text-[15px] text-muted-foreground">{step.text}</div>
        {step.decision && (
          <p className="mt-2 text-[15px] text-muted-foreground">
            <strong className="text-foreground">Decision:</strong> {step.decision}
          </p>
        )}
      </li>
    ))}
  </ol>
);

/** Blank worksheet teaser: the key questions in HTML, plus the plain-text template to download. */
export const Worksheet = ({
  id,
  title,
  intro,
  items,
  slug,
  muted = true,
}: {
  id: string;
  title: string;
  intro: ReactNode;
  items: string[];
  /** The worksheet to fill in online or download as a PDF. */
  slug: WorksheetSlug;
  muted?: boolean;
}) => (
  <section id={id} className={muted ? "section-y bg-muted" : "section-y"} aria-labelledby={`${id}-title`}>
    <div className="site-wrap grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-20">
      <div>
        <Eyebrow>Reusable worksheet</Eyebrow>
        <h2 id={`${id}-title`} className="h2">
          {title}
        </h2>
        <p className="mt-4 max-w-[50ch] text-muted-foreground">{intro}</p>
      </div>
      <div>
        <ol className="mb-7 list-decimal space-y-1 pl-5 text-[15px] text-muted-foreground">
          {items.map((item) => (
            <li key={item} className="py-1">
              {item}
            </li>
          ))}
        </ol>
        <Actions className="mt-0">
          <ButtonLink href={worksheetPath(slug)}>Fill it in online</ButtonLink>
          <ButtonLink href={worksheetPdf(slug)} download variant="secondary">
            Download PDF
          </ButtonLink>
        </Actions>
        <p className="fine mt-4">Answers you type stay in your browser; nothing is sent to the website.</p>
      </div>
    </div>
  </section>
);
