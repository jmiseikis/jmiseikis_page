import { SectionHead, TextLink } from "@/components/site/primitives";

// Synthetic samples that show the shape and level of detail of typical outputs. They are not client work: the
// organisations, products and figures are invented, and the page says so.
const EXAMPLES = [
  {
    id: "evidence-matrix",
    eyebrow: "Diligence output",
    title: "Technical evidence matrix",
    intro: "Each claim, the evidence behind it and what would settle it.",
    columns: ["Claim", "Evidence", "Status", "Next validation"],
    rows: [
      ["Picks 600 items an hour", "Supplier video, one product type, lab setting", "Reported", "Timed trial on the customer's product mix"],
      ["Integrates with the existing warehouse system", "API documentation; no live integration yet", "Unverified", "Sandbox integration test with sample orders"],
      ["Running at a first customer site", "Reference call with the site manager", "Demonstrated", "Review uptime and manual intervention logs"],
    ],
    link: { href: "/worksheets/technical-diligence-checklist", label: "Start from the diligence checklist" },
  },
  {
    id: "partner-shortlist",
    eyebrow: "Scouting output",
    title: "Swiss partner shortlist",
    intro: "Why each candidate fits, the evidence and where the relationship stands.",
    columns: ["Candidate", "Why it fits", "Evidence", "Status"],
    rows: [
      ["University spin-off, perception software", "Complements the client's hardware", "Publication and public demo", "Public lead"],
      ["System integrator, logistics", "Existing Swiss warehouse customers", "Case studies on its website", "Introduction to be agreed"],
      ["Food producer with an automation programme", "Stated plan to automate packing lines", "Annual report", "Public lead"],
    ],
    link: { href: "/worksheets/technology-scouting-brief", label: "Start from the scouting brief" },
  },
  {
    id: "pilot-brief",
    eyebrow: "Internal AI output",
    title: "Bounded AI pilot brief",
    intro: "One process, its baseline and the test that decides whether to continue.",
    columns: ["Item", "Example"],
    rows: [
      ["Process", "Answering supplier invoice queries"],
      ["Baseline", "1,200 queries a month, about 9 minutes each"],
      ["Proposed help", "Draft replies from the finance system and contracts; a person approves each one"],
      ["Decision test", "Share of drafts usable without major edits on held-out cases, no access beyond the finance team's rights"],
    ],
    link: { href: "/worksheets/ai-workflow-pilot-brief", label: "Start from the pilot brief" },
  },
];

/** Three illustrative outputs, so visitors can see what the work produces before they get in touch. */
const WorkExamples = () => (
  <section id="examples" className="site-wrap section-y" aria-labelledby="examples-title">
    <SectionHead
      id="examples-title"
      eyebrow="What the work produces"
      title="Examples of typical outputs."
      intro="Illustrative examples built for this page. They are not client work: names and figures are invented."
    />
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-8">
      {EXAMPLES.map((example) => (
        <article key={example.id} className="min-w-0 border-t-2 border-primary pt-5" aria-labelledby={`${example.id}-title`}>
          <p className="eyebrow mb-2">{example.eyebrow}</p>
          <h3 id={`${example.id}-title`} className="text-[21px] leading-tight">
            {example.title}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">{example.intro}</p>
          <dl className="mt-4 space-y-3">
            {example.rows.map((row) => (
              <div key={row[0]} className="border border-border bg-muted px-3 py-2.5 text-[13px]">
                {row.map((cell, index) => (
                  <div key={example.columns[index]} className={index ? "mt-1" : ""}>
                    <dt className="inline font-semibold text-foreground">{example.columns[index]}: </dt>
                    <dd className="inline text-muted-foreground">{cell}</dd>
                  </div>
                ))}
              </div>
            ))}
          </dl>
          <div className="mt-4">
            <TextLink href={example.link.href}>{example.link.label}</TextLink>
          </div>
        </article>
      ))}
    </div>
  </section>
);

export default WorkExamples;
