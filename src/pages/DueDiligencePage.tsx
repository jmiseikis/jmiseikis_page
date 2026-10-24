import PageMeta from "@/components/site/PageMeta";
import {
  Actions,
  ButtonLink,
  ContactCta,
  Note,
  PageHero,
  RuleBlock,
  SectionHead,
  ServiceRow,
  TextLink,
} from "@/components/site/primitives";
import { contactPath } from "@/lib/site";

const AREAS = [
  {
    title: "Technology",
    text: "AI and ML models, robotics systems, computer vision pipelines, data infrastructure, scalability and defensibility.",
  },
  {
    title: "Commercial context",
    text: "Product-market assumptions, competitive positioning, go-to-market plans and the route from research to revenue.",
  },
  {
    title: "Team & research",
    text: "Technical capabilities, execution dependencies, research quality and the evidence behind claims. Review patent portfolios for technical context.",
  },
  {
    title: "Decision brief",
    text: "A concise assessment of evidence, material risks, open questions and recommended validation steps relevant to your decision.",
  },
];

const COVERAGE = [
  "AI & machine learning",
  "Robotics & automation",
  "Computer vision & perception",
  "Healthcare technology",
  "Industrial automation",
  "Autonomous systems",
  "Human-robot interaction",
  "Deep tech hardware & software",
];

const STAGES = [
  {
    title: "Early stage",
    text: "Understand the technical thesis, the quality of the evidence and the work needed to reach the next milestone.",
    points: [
      "Reproducible demo and evaluation method",
      "Data access, dependencies and IP provenance",
      "Team capability and critical hiring gaps",
      "Validation plan and commercial assumptions",
    ],
  },
  {
    title: "Scale-up stage",
    text: "Assess repeatable delivery, deployment economics and the constraints that emerge as the business grows.",
    points: [
      "Performance across real customer environments",
      "Integration effort and customer-specific work",
      "Support, reliability and operating costs",
      "Technical roadmap and scaling bottlenecks",
    ],
  },
];

const DueDiligencePage = () => (
  <>
    <PageMeta path="/due-diligence" />
    <PageHero
      breadcrumb={{ to: "/advisory", label: "Advisory" }}
      eyebrow="Advisory | Investors, acquirers & strategy teams"
      title="AI & robotics due diligence."
      lead="Assess the technical substance, deployment readiness and commercial assumptions behind an opportunity."
    >
      <Actions>
        <ButtonLink href={contactPath("diligence")}>Discuss an assessment</ButtonLink>
      </Actions>
    </PageHero>

    <section className="site-wrap pb-12 pt-10 md:pb-20" aria-labelledby="areas-title">
      <SectionHead id="areas-title" eyebrow="Assessment areas" title="What needs to be true?" />
      {AREAS.map((area, index) => (
        <ServiceRow key={area.title} number={`0${index + 1}`} title={area.title}>
          <p>{area.text}</p>
        </ServiceRow>
      ))}
    </section>

    <section className="section-y bg-muted" aria-labelledby="outputs-title">
      <div className="site-wrap">
        <SectionHead id="outputs-title" eyebrow="Typical outputs" title="Evidence you can use in the decision." />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
          <RuleBlock title="Technical assessment">
            <p>Capabilities, deployment constraints, evidence gaps and technical risks.</p>
          </RuleBlock>
          <RuleBlock title="Management questions">
            <p>A focused set of questions and validation activities for the company and its technical team.</p>
          </RuleBlock>
          <RuleBlock title="Decision brief">
            <p>Findings connected to commercial assumptions and the next steps in your assessment.</p>
          </RuleBlock>
        </div>
      </div>
    </section>

    <section className="site-wrap section-y" aria-labelledby="coverage-title">
      <SectionHead id="coverage-title" eyebrow="Technical coverage" title="AI, robotics and their real-world use." />
      <ul className="grid list-none grid-cols-1 border-t border-border p-0 xs:grid-cols-2 md:grid-cols-3">
        {COVERAGE.map((item) => (
          <li key={item} className="min-w-0 border-b border-border py-4 pr-4 text-[13px] text-foreground md:text-sm">
            {item}
          </li>
        ))}
      </ul>
      <Note title="Scope the assessment around your decision.">
        <p>
          Agree the depth, access to evidence, timetable and deliverables before work begins. Technical review of IP does not
          replace a legal opinion; specialist reviews can be defined as part of the broader process.
        </p>
      </Note>
    </section>

    <section id="stage" className="section-y bg-muted" aria-labelledby="stage-title">
      <div className="site-wrap">
        <SectionHead id="stage-title" eyebrow="For venture investors" title="Match the diligence to the company's stage." />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
          {STAGES.map((stage) => (
            <article key={stage.title} className="min-w-0 border-t-2 border-primary pt-6">
              <h3 className="text-[23px] leading-tight md:text-2xl">{stage.title}</h3>
              <p className="mt-3 text-[15px] text-muted-foreground">{stage.text}</p>
              <ul className="mt-4 list-disc space-y-1.5 pl-5 text-[15px] text-muted-foreground">
                {stage.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <Actions>
          <ButtonLink href="/downloads/technical-diligence-checklist.txt" download variant="secondary">
            Download diligence checklist (TXT)
          </ButtonLink>
          <TextLink href="/swiss-ai-robotics-ecosystem">Explore Swiss startup scouting</TextLink>
        </Actions>
        <p className="fine mt-5 max-w-[70ch]">
          Use the checklist to define scope and evidence requests. A public checklist is not an assessment of a specific
          company.
        </p>
      </div>
    </section>

    <ContactCta
      title="What do you need to understand before committing?"
      lead="Share the opportunity, decision timeline and the technical questions you want to resolve."
      intent="diligence"
      label="Discuss an assessment"
    />
  </>
);

export default DueDiligencePage;
