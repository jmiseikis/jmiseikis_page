import PageMeta from "@/components/site/PageMeta";
import { EditorialMeta, Worksheet } from "@/components/site/guide";
import { Actions, ButtonLink, ContactCta, Eyebrow, PageHero, SectionHead, TextLink } from "@/components/site/primitives";

// Selective, source-linked starting points checked on 6 October 2026. Not a ranking,
// a complete map or a list of relationships.
const NODES = [
  {
    eyebrow: "01 / Research & emerging capabilities",
    question: "What technical expertise or new approach could matter to us?",
    source: { label: "ETH AI Center", href: "https://ai.ethz.ch/" },
    text: "An entry point for ETH's AI research activity and events.",
    next: "Identify the relevant research group, then check publications, capabilities and the route for an industry enquiry.",
  },
  {
    eyebrow: "02 / University startup discovery",
    question: "Which companies are emerging from research?",
    source: { label: "EPFL Startup Launchpad", href: "https://www.epfl.ch/innovation/startup/" },
    text: "A university startup hub with a public community and startup directory.",
    next: "Screen for your use case and stage. A university origin is a research signal, not proof of commercial readiness.",
  },
  {
    eyebrow: "03 / Applied R&D & collaboration",
    question: "Where could a company find a relevant research environment?",
    source: { label: "Switzerland Innovation", href: "https://www.switzerland-innovation.com/" },
    text: "A national network connecting companies, researchers and academic partners.",
    next: "Match a specific technical need to a park or specialist facility; verify capabilities, terms and available capacity.",
  },
  {
    eyebrow: "04 / Innovation support",
    question: "Which support route might fit a collaborative project?",
    source: { label: "Innosuisse", href: "https://www.innosuisse.admin.ch/en" },
    text: "The Swiss Innovation Agency supports innovation projects, collaboration and startup development.",
    next: "Check the current programme and eligibility with the agency before building it into a funding or market-entry plan.",
  },
];

const SHORTLIST = [
  {
    title: "Companies & labs",
    text: "Filter the existing GZA directory by technology, organisation type and size. Recheck operating status, product and fit before outreach.",
    link: { label: "Explore robotics organisations", href: "/gza-robotics" },
  },
  {
    title: "Investor landscape",
    text: "Use sector and stage filters to identify potentially relevant investors. Confirm the current mandate and investment activity directly.",
    link: { label: "Explore Swiss VCs", href: "/swiss-vcs" },
  },
  {
    title: "Ecosystem meetings",
    text: "Use the event calendar to plan a visit around a clear meeting objective, relevant attendees and an achievable follow-up.",
    link: { label: "Explore Swiss events", href: "/tech-events" },
  },
];

const EVIDENCE = [
  {
    title: "Early stage: test the technical thesis",
    points: [
      "What works beyond a controlled demo?",
      "Which data, IP and specialist skills are essential?",
      "What experiment would reduce the largest uncertainty?",
      "Which customer problem justifies the next milestone?",
    ],
  },
  {
    title: "Scale-up: test repeatability",
    points: [
      "Can performance repeat across customer deployments?",
      "How much custom engineering does each sale require?",
      "What are the support, infrastructure and hardware costs?",
      "Can the team sustain delivery, reliability and growth?",
    ],
  },
];

const SwissEcosystemGuide = () => (
  <>
    <PageMeta path="/swiss-ai-robotics-ecosystem" />
    <PageHero
      breadcrumb={{ to: "/resources", label: "Resources" }}
      eyebrow="Field guide | Investors & corporate teams"
      title="Navigate the Swiss AI & robotics ecosystem."
      lead="Start with the capability you need, then distinguish research, emerging companies and deployment partners. This guide connects useful public entry points with the questions to ask next."
    >
      <Actions>
        <ButtonLink href="#ecosystem-map">Explore the ecosystem</ButtonLink>
        <ButtonLink href="#scouting-brief" variant="secondary">
          Get the scouting brief
        </ButtonLink>
      </Actions>
    </PageHero>
    <EditorialMeta topic="Sources linked throughout" />

    <section className="site-wrap section-y" aria-labelledby="map-title">
      <SectionHead
        id="map-title"
        eyebrow="A map by purpose"
        title="Who helps with which question?"
        intro="This is a selective navigation guide, not a ranking or a complete company database. Zurich is one entry point; EPFL and the national innovation network broaden the view beyond one region."
      />
      <div id="ecosystem-map" className="mt-8">
        {NODES.map((node) => (
          <article
            key={node.source.href}
            className="grid grid-cols-1 gap-5 border-t border-border py-7 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.2fr)] md:gap-9 lg:gap-16"
          >
            <div className="min-w-0">
              <Eyebrow className="text-[10px]">{node.eyebrow}</Eyebrow>
              <h3 className="text-[23px] leading-tight md:max-w-[24ch] md:text-[25px]">{node.question}</h3>
            </div>
            <div className="min-w-0 text-[15px] text-muted-foreground">
              <TextLink href={node.source.href}>{node.source.label}</TextLink>
              <p className="mt-4">{node.text}</p>
              <p className="mt-3">
                <strong className="text-foreground">Your next step:</strong> {node.next}
              </p>
            </div>
          </article>
        ))}
      </div>
      <p className="fine mt-4">
        Public sources checked on 6 October 2026. Inclusion does not imply a relationship, endorsement, access or programme
        eligibility.
      </p>
    </section>

    <section className="section-y bg-muted" aria-labelledby="shortlist-title">
      <div className="site-wrap">
        <SectionHead id="shortlist-title" eyebrow="Move from the map to a shortlist" title="Companies, capital and conversations." />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
          {SHORTLIST.map((item) => (
            <article key={item.title} className="min-w-0">
              <h3 className="text-[21px] leading-tight">{item.title}</h3>
              <p className="mb-4 mt-3 text-[15px] text-muted-foreground">{item.text}</p>
              <TextLink href={item.link.href}>{item.link.label}</TextLink>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="site-wrap section-y" aria-labelledby="evidence-title">
      <SectionHead id="evidence-title" eyebrow="For venture investors" title="Early stage and scale-up need different evidence." />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
        {EVIDENCE.map((group) => (
          <article key={group.title} className="min-w-0 border-t-2 border-primary pt-6">
            <h3 className="text-[23px] leading-tight md:text-2xl">{group.title}</h3>
            <ul className="mt-4 list-disc space-y-1.5 pl-5 text-[15px] text-muted-foreground">
              {group.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <Actions>
        <TextLink href="/due-diligence">Explore technical due diligence</TextLink>
      </Actions>
    </section>

    <Worksheet
      id="scouting-brief"
      title="Start with your investment or partnership thesis."
      intro="Define the application, stage, evidence threshold and exclusions before collecting names. A smaller, relevant shortlist is easier to act on."
      items={[
        "Technical capability and customer problem",
        "Stage, geography and commercial maturity",
        "Evidence required and questions to resolve",
        "Partner role or investment fit",
        "Reason to approach and next decision",
      ]}
      slug="technology-scouting-brief"
    />

    <ContactCta
      title="Looking for Swiss startups that fit your thesis?"
      lead="I help investors and corporate teams define a scouting brief, assess early-stage and scale-up companies, and prepare the technical questions behind a partnership or investment decision."
      intent="scouting"
      label="Discuss a Swiss scouting brief"
    />
  </>
);

export default SwissEcosystemGuide;
