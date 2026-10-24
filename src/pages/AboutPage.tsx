import PageMeta from "@/components/site/PageMeta";
import Portrait from "@/components/site/Portrait";
import { Actions, ButtonLink, ContactCta, Eyebrow, PageHero, RuleBlock, SectionHead, TextLink } from "@/components/site/primitives";
import { TECHDRIVE_URL, contactPath } from "@/lib/site";

// Titles and dates as confirmed by the owner (handoff/OWNER_FACTS.md). No end date for the current role.
const TIMELINE = [
  {
    period: "2024 - present",
    org: "Sony AI",
    role: "Strategy and Partnerships Manager",
    text: "Research commercialisation strategy, project direction, budgets and external partnerships across four R&D teams.",
  },
  {
    period: "2021 - 2024",
    org: "Sony",
    role: "Principal Technology Analyst",
    text: "Technology scouting and analysis for Sony's AI initiatives and emerging technology opportunities.",
  },
  {
    period: "2020 - 2021",
    org: "F&P Robotics AG",
    role: "Head of Artificial Intelligence",
    text: "AI solutions for human-robot interaction, perception and manipulation, including production-oriented software and hardware.",
  },
];

const ORGANISATIONS = [
  "University of Reading",
  "ETH Zurich",
  "TU Graz",
  "University of Oslo",
  "CSIRO",
  "Hewlett-Packard",
  "EMT",
  "Melga",
  "Hocoma",
  "YouRehab",
  "VELTRU AG",
  "Pixevia",
  "F&P Robotics",
  "Sony",
  "Sony AI",
];

const COUNTRIES = ["Lithuania", "the United Kingdom", "Switzerland", "Australia", "Norway", "Austria", "Spain", "Germany"];

const AboutPage = () => (
  <>
    <PageMeta
      path="/about"
      title="About | Dr. Justinas Mišeikis"
      description="Background in Sony technology scouting, Sony AI strategy and partnerships, robotics leadership, research and business education."
      ogTitle="About"
      ogSubtitle="DR. JUSTINAS MIŠEIKIS · ABOUT"
    />

    <PageHero
      eyebrow="About | Research, strategy & commercialisation"
      title="Technical depth. Commercial perspective."
      lead="My work connects AI and robotics research with product direction, commercial opportunities and partnerships."
    >
      <Actions>
        <ButtonLink href={contactPath("advisory")}>Discuss a project</ButtonLink>
        <ButtonLink href="/publications" variant="secondary">
          Explore research
        </ButtonLink>
      </Actions>
    </PageHero>

    <section
      className="site-wrap grid grid-cols-1 gap-8 pb-10 pt-10 md:grid-cols-2 md:gap-16 md:pb-20"
      aria-labelledby="about-intro-title"
    >
      <figure className="min-w-0">
        <Portrait imgClassName="aspect-square max-md:max-h-[360px] max-md:object-[center_32%]" />
        <figcaption className="mt-3 border-t-2 border-primary pt-3 text-[11px] text-foreground">
          Dr. Justinas Mišeikis | Zurich, Switzerland
        </figcaption>
      </figure>
      <div className="min-w-0">
        <h2 id="about-intro-title" className="h2">
          Research, strategy and the work between them.
        </h2>
        <div className="mt-5 space-y-4 text-muted-foreground">
          <p>
            I am Strategy and Partnerships Manager at Sony AI. My background combines technology scouting at Sony,
            strategy and partnerships at Sony AI, and AI leadership at F&P Robotics, alongside a PhD in robotics and
            computer vision and an Executive MBA.
          </p>
          <p>
            That combination shapes how I approach a technical claim, a partnership opportunity or a research-to-market
            decision: understand the evidence, connect it to the business context and define a practical next step.
          </p>
          <p>
            Based in Switzerland, I work with international teams in English. I am also the Founder and Host of TechDrive
            Zürich, speaking with founders, researchers and operators across the Swiss technology ecosystem.
          </p>
        </div>
        <div className="mt-6">
          <TextLink href={TECHDRIVE_URL}>Explore TechDrive Zürich</TextLink>
        </div>
      </div>
    </section>

    <section className="site-wrap section-y border-t border-border" aria-labelledby="journey-title">
      <SectionHead id="journey-title" eyebrow="Professional journey" title="Experience across research and industry." />
      <ol className="list-none p-0">
        {TIMELINE.map((item) => (
          <li
            key={item.org}
            className="grid grid-cols-1 gap-1.5 border-t border-border py-6 md:grid-cols-[200px_minmax(0,1fr)] md:gap-8 md:py-7"
          >
            <p className="eyebrow mb-1 md:mb-0">{item.period}</p>
            <div className="min-w-0">
              <h3 className="text-[21px] leading-tight">{item.org}</h3>
              <p className="my-1.5 font-semibold text-foreground">{item.role}</p>
              <p className="max-w-[65ch] text-muted-foreground">{item.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="fine mt-4">
        Selected experience. Professional experience and named organisations do not imply endorsement of independent
        services.
      </p>
    </section>

    <section className="section-y bg-muted" aria-labelledby="education-title">
      <div className="site-wrap">
        <h2 id="education-title" className="eyebrow mb-4">
          Education
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          <article>
            <h3 className="text-[21px] leading-tight">PhD in Robotics & Computer Vision</h3>
            <p className="mt-2 text-muted-foreground">University of Oslo</p>
          </article>
          <article>
            <h3 className="text-[21px] leading-tight">Executive MBA</h3>
            <p className="mt-2 text-muted-foreground">Quantic School of Business and Technology</p>
          </article>
        </div>

        <div className="mt-10 border-t border-border pt-9">
          <h2 className="eyebrow mb-4">Wider professional background</h2>
          <p className="text-muted-foreground">Organisations represented in my research, innovation and leadership journey.</p>
          <ul className="mt-7 grid list-none grid-cols-1 border-t border-border p-0 xs:grid-cols-2 md:grid-cols-3">
            {ORGANISATIONS.map((name) => (
              <li
                key={name}
                className="min-w-0 border-b border-border py-4 pr-4 text-[13px] text-foreground [overflow-wrap:anywhere] md:text-sm"
              >
                {name}
              </li>
            ))}
          </ul>
          <p className="fine mt-4">This is professional background, not a client or endorsement list.</p>
        </div>
      </div>
    </section>

    <section className="site-wrap section-y" aria-labelledby="international-title">
      <SectionHead
        id="international-title"
        eyebrow="International perspective"
        title="Global experience. A Swiss base."
        intro={`Professional and academic experience across ${COUNTRIES.slice(0, -1).join(", ")} and ${COUNTRIES[COUNTRIES.length - 1]}.`}
      />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
        <RuleBlock title="Advisory">
          <p>Technology scouting, diligence, strategy and local support.</p>
        </RuleBlock>
        <RuleBlock title="Speaking">
          <p>Keynotes, panels and workshops connecting technical depth with business context.</p>
        </RuleBlock>
        <RuleBlock title="Research & media">
          <p>Published research, patented work and conversations through TechDrive Zürich.</p>
        </RuleBlock>
      </div>
    </section>

    <ContactCta
      title="Let's start with the question."
      lead="Share the decision, project or event you have in mind."
      intent="advisory"
      label="Discuss a project"
    />
  </>
);

export default AboutPage;
