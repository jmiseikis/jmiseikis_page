import Contact from "@/components/Contact";
import PageMeta from "@/components/site/PageMeta";
import Portrait from "@/components/site/Portrait";
import { Actions, ButtonLink, Eyebrow, SectionHead, ServiceRow, TextLink } from "@/components/site/primitives";
import { SERVICES, SIGNATURE_TOPICS } from "@/content/services";
import { contactPath } from "@/lib/site";

// Professional experience labels, not client logos or endorsements.
const PROOF = [
  { org: "Sony", label: "Technology scouting" },
  { org: "Sony AI", label: "Strategy & partnerships" },
  { org: "PhD + EMBA", label: "Technical and business perspective" },
];

const EXPERIENCE = [
  {
    org: "Sony",
    title: "Technology scouting",
    text: "Technology scouting and analysis of emerging technologies, informed by research and engineering experience.",
  },
  {
    org: "Sony AI",
    title: "Strategy & partnerships",
    text: "As Strategy and Partnerships Manager: research commercialisation strategy, project direction and external partnerships.",
  },
  {
    org: "F&P Robotics",
    title: "AI leadership",
    text: "AI leadership spanning human-robot interaction, perception, manipulation and production-oriented robotics.",
  },
];

const RESOURCE_TEASERS = [
  {
    title: "Robotics in the Greater Zurich Area",
    text: "Explore robotics companies, research groups and autonomous systems activity.",
    href: "/gza-robotics",
  },
  {
    title: "Swiss technology events",
    text: "Find conferences and ecosystem events relevant to your interests.",
    href: "/tech-events",
  },
  {
    title: "Swiss VCs and funds",
    text: "Explore investors and the areas they focus on.",
    href: "/swiss-vcs",
  },
];

const Index = () => (
  <>
    <PageMeta path="/" />

    {/* Hero */}
    <section className="site-wrap grid grid-cols-1 items-center gap-7 py-9 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:gap-10 md:py-16 lg:gap-16">
      <div className="min-w-0">
        <Eyebrow>Dr. Justinas Mišeikis | Zurich, Switzerland</Eyebrow>
        <h1 className="max-w-[16ch] text-[34px] leading-[1.08] tracking-[-0.035em] [overflow-wrap:break-word] xs:text-[38px] md:max-w-[14ch] md:text-[clamp(2.7rem,5vw,3.5rem)] lg:text-[clamp(3rem,4.6vw,4rem)]">
          AI & robotics strategy.
          <br />
          <span className="text-primary">Swiss ecosystem expertise.</span>
        </h1>
        <p className="lead mt-5 max-w-[46ch]">
          I help technology companies enter markets and build Swiss partnerships, and investors scout and assess Swiss AI
          and robotics startups from early stage to scale-up.
        </p>
        <Actions>
          <ButtonLink href={contactPath("advisory")}>Discuss a project</ButtonLink>
          <ButtonLink href="/speaking" variant="secondary">
            Explore speaking
          </ButtonLink>
        </Actions>
        <p className="mt-6 text-xs text-muted-foreground">Based in Switzerland. Working internationally in English.</p>
      </div>
      <figure className="min-w-0 md:mt-4">
        <Portrait
          eager
          sizes="(min-width: 768px) 42vw, 100vw"
          imgClassName="h-[260px] object-[center_33%] md:aspect-square md:h-auto md:object-[center_35%]"
        />
        <figcaption className="mt-3 flex justify-between gap-3 border-t-2 border-primary pt-3 text-[10px] leading-normal text-foreground md:text-[11px]">
          Dr. Justinas Mišeikis
          <span className="text-muted-foreground">Research | Strategy | Commercialisation</span>
        </figcaption>
      </figure>
    </section>

    <div className="site-wrap grid grid-cols-3 gap-3 border-y border-border py-4 md:gap-8 md:py-6">
      {PROOF.map((item) => (
        <div key={item.org} className="flex min-w-0 flex-col gap-1">
          <b className="text-[13px] text-foreground md:text-[15px]">{item.org}</b>
          <span className="text-[10px] leading-snug text-muted-foreground md:text-xs">{item.label}</span>
        </div>
      ))}
    </div>

    {/* Old links to /#advisory and /#services both land on the advisory section. */}
    <span id="advisory" className="block" aria-hidden="true" />
    <section id="services" className="site-wrap section-y" aria-labelledby="home-advisory-title">
      <SectionHead
        id="home-advisory-title"
        eyebrow="01 / Advisory"
        title="A clear brief. Useful answers."
        intro="Focused support for the decisions, partnerships and local activities ahead."
      />
      {SERVICES.slice(0, 3).map((service) => (
        <ServiceRow key={service.id} number={service.number} title={service.title} fine={service.audience}>
          <p>{service.description}</p>
          <p className="mt-4 text-sm">
            <b className="text-foreground">Typical output:</b> {service.typicalOutput}
          </p>
          <div className="mt-4">
            <TextLink href={contactPath(service.cta.intent)}>{service.cta.label}</TextLink>
          </div>
        </ServiceRow>
      ))}
      <Actions>
        <ButtonLink href="/advisory" variant="secondary">
          Explore advisory services
        </ButtonLink>
      </Actions>
    </section>

    <section id="about" className="section-y bg-muted" aria-labelledby="home-experience-title">
      <div className="site-wrap">
        <SectionHead
          id="home-experience-title"
          eyebrow="02 / Relevant experience"
          title="Technical depth. Commercial perspective."
        />
        <div className="grid grid-cols-1 gap-7 md:grid-cols-3 md:gap-10">
          {EXPERIENCE.map((item) => (
            <article key={item.org} className="min-w-0 max-w-[60ch] border-l-2 border-primary pl-5 md:pl-6">
              <Eyebrow>{item.org}</Eyebrow>
              <h3 className="text-[21px] leading-tight">{item.title}</h3>
              <p className="mt-3 text-[15px] text-muted-foreground">{item.text}</p>
            </article>
          ))}
        </div>
        <Actions>
          <TextLink href="/about">Explore my background</TextLink>
        </Actions>
        <p className="mt-8 border-t border-border pt-6 text-[11px] leading-loose text-muted-foreground md:text-xs">
          PhD in robotics and computer vision | Executive MBA | Founder and Host of TechDrive Zürich
        </p>
      </div>
    </section>

    <section
      id="speaking"
      className="site-wrap section-y grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-20"
      aria-labelledby="home-speaking-title"
    >
      <div>
        <Eyebrow>03 / Speaking</Eyebrow>
        <h2 id="home-speaking-title" className="h2">
          Ideas your audience can put to work.
        </h2>
        <p className="mt-4 max-w-[50ch] text-muted-foreground">
          Keynotes, panels and workshops on physical AI, commercialisation and technology partnerships.
        </p>
        <Actions>
          <ButtonLink href="/speaking">Explore speaking</ButtonLink>
        </Actions>
      </div>
      <ol className="list-none p-0" aria-label="Signature topics">
        {SIGNATURE_TOPICS.map((topic, index) => (
          <li key={topic.title} className="grid grid-cols-[28px_minmax(0,1fr)] gap-4 border-b border-border py-5 first:pt-0">
            <span className="pt-1 text-xs font-semibold text-primary" aria-hidden="true">
              0{index + 1}
            </span>
            <h3 className="text-[19px] leading-tight md:text-xl">{topic.title}</h3>
          </li>
        ))}
      </ol>
    </section>

    <section id="resources" className="site-wrap section-y border-t border-border" aria-labelledby="home-resources-title">
      <SectionHead id="home-resources-title" eyebrow="04 / Resources" title="Explore the Swiss ecosystem." />
      <div className="grid grid-cols-1 gap-7 md:grid-cols-3 md:gap-10">
        {RESOURCE_TEASERS.map((item) => (
          <article key={item.href} className="min-w-0">
            <h3 className="text-[21px] leading-tight">{item.title}</h3>
            <p className="mb-4 mt-3 text-[15px] text-muted-foreground">{item.text}</p>
            <TextLink href={item.href}>
              Explore resource<span className="sr-only">: {item.title}</span>
            </TextLink>
          </article>
        ))}
      </div>
      <Actions>
        <TextLink href="/resources">View all resources</TextLink>
      </Actions>
    </section>

    <section id="publications" className="site-wrap section-y border-t border-border" aria-labelledby="home-research-title">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-20">
        <div>
          <Eyebrow>05 / Research & innovation</Eyebrow>
          <h2 id="home-research-title" className="h2">
            Ideas grounded in research.
          </h2>
        </div>
        <div>
          <p className="max-w-[50ch] text-muted-foreground">
            Published work in robotics, computer vision and human-robot interaction supports my technical perspective.
            Explore selected papers and the full publication and patent records.
          </p>
          <div className="mt-5">
            <TextLink href="/publications">Explore publications & patents</TextLink>
          </div>
        </div>
      </div>
    </section>

    <Contact />
  </>
);

export default Index;
