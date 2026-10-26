import { Link } from "react-router-dom";
import PageMeta from "@/components/site/PageMeta";
import { WORKSHEET_LIST, worksheetPath, worksheetPdf } from "@/content/worksheets";
import { ContactCta, Eyebrow, PageHero, SectionHead, TextLink } from "@/components/site/primitives";
import { SWISS_HACK_EVENTS_URL, SWISS_ROBOTICS_STARTUPS_URL, TECHDRIVE_URL } from "@/lib/site";

const GUIDES = [
  {
    eyebrow: "01 / Swiss technology",
    title: "Find the right part of the ecosystem",
    text: "A guide to research, startups, scale-ups and partnership routes, with questions for investors and corporate teams.",
    href: "/swiss-ai-robotics-ecosystem",
  },
  {
    eyebrow: "02 / Market entry",
    title: "Build a route between markets",
    text: "A Swiss and Baltic starting point for customer discovery, partner selection and a focused go-to-market plan.",
    href: "/swiss-baltic-market-entry",
  },
  {
    eyebrow: "03 / Internal AI",
    title: "Put your data and workflows to work",
    text: "Explore four concrete internal use cases and take away a blank pilot brief for your team.",
    href: "/ai-agents-strategy",
  },
];

// The directories load live data, so no record counts are quoted here.
const TOOLS = [
  {
    title: "Robotics in the Greater Zurich Area",
    text: "Find robotics companies, research labs and autonomous systems organisations.",
    meta: "Live directory | Data curated by Greater Zurich Area",
    href: "/gza-robotics",
  },
  {
    title: "Swiss VCs & funds",
    text: "Research investors by sector, stage, geography and audience.",
    meta: "Live directory | Links to original investor information",
    href: "/swiss-vcs",
  },
  {
    title: "Swiss technology events",
    text: "Plan conferences, ecosystem visits and potential conversations.",
    meta: "2026 calendar and archive | Original event links",
    href: "/tech-events",
  },
  {
    title: "Robotics cost & ROI calculator",
    text: "Compare manual work, buying a robot system and robots-as-a-service: cash flow, NPV and payback.",
    meta: "Interactive tool | Illustrative scenarios",
    href: "/raas-calculator",
  },
  {
    title: "AI & robotics diligence checklist",
    text: "Define the evidence to request at early stage and at scale-up stage.",
    meta: "Assessment guide | Fillable checklist and PDF",
    href: "/due-diligence#stage",
  },
];


const ELSEWHERE = [
  { title: "Swiss Robotics Startups", text: "A directory curated by Swisscom Ventures.", href: SWISS_ROBOTICS_STARTUPS_URL },
  { title: "Swiss Hack Events", text: "Swiss technology events curated by Rockstar Recruiting.", href: SWISS_HACK_EVENTS_URL },
  { title: "TechDrive Zürich", text: "Conversations with founders, researchers and operators.", href: TECHDRIVE_URL },
];

const ResourcesPage = () => (
  <>
    <PageMeta path="/resources" />

    <PageHero
      eyebrow="Resources | Evidence for the next decision"
      title="Explore an ecosystem. Shape a decision."
      lead="Practical guides, directories and working templates for AI adoption, Swiss technology scouting and international growth."
    />

    <section className="site-wrap pb-10 pt-10 md:pb-16" aria-label="Decision guides">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-7 lg:gap-8">
        {GUIDES.map((guide) => (
          <article key={guide.href} className="flex min-w-0 flex-col items-start border-t-[3px] border-primary pt-6">
            <Eyebrow className="text-[10px]">{guide.eyebrow}</Eyebrow>
            <h2 className="text-[26px] leading-tight tracking-[-0.03em] md:text-[24px] lg:text-[29px]">{guide.title}</h2>
            <p className="mb-5 mt-3 text-[15px] text-muted-foreground">{guide.text}</p>
            <div className="mt-auto">
              <TextLink href={guide.href}>
                Open the guide<span className="sr-only">: {guide.title}</span>
              </TextLink>
            </div>
          </article>
        ))}
      </div>
    </section>

    <section className="site-wrap pb-12 md:pb-20" aria-labelledby="tools-title">
      <SectionHead id="tools-title" eyebrow="Go deeper" title="Directories & decision tools." />
      <ul className="list-none border-t border-border p-0">
        {TOOLS.map((tool, index) => (
          <li key={tool.href}>
            <Link
              to={tool.href}
              className="group grid grid-cols-[20px_minmax(0,1fr)_18px] gap-2.5 border-b border-border py-6 no-underline xs:grid-cols-[24px_minmax(0,1fr)_22px] xs:gap-3 md:grid-cols-[48px_minmax(0,1fr)_40px] md:gap-6 md:py-8"
            >
              <span className="pt-1.5 text-xs font-semibold text-primary" aria-hidden="true">
                0{index + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-[22px] font-bold leading-tight tracking-[-0.03em] text-foreground group-hover:text-primary md:text-[27px]">
                  {tool.title}
                </span>
                <span className="mt-2.5 block max-w-[72ch] text-sm text-muted-foreground md:text-[15px]">{tool.text}</span>
                <span className="fine mt-2.5 block">{tool.meta}</span>
              </span>
              <span className="text-[23px] leading-none text-primary md:text-[30px]" aria-hidden="true">
                ↗
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>

    <section id="templates" className="section-y bg-muted" aria-labelledby="templates-title">
      <div className="site-wrap">
        <SectionHead
          id="templates-title"
          eyebrow="Working templates"
          title="Blank briefs to use with your team."
          intro="Fill them in online, where answers stay in your browser, or download a blank PDF to use with your team."
        />
        <ul className="grid list-none grid-cols-1 gap-8 p-0 md:grid-cols-2 md:gap-x-16 md:gap-y-10">
          {WORKSHEET_LIST.map((sheet) => (
            <li key={sheet.slug} className="min-w-0 border-t-2 border-primary pt-5">
              <h3 className="text-[21px] leading-tight">{sheet.title}</h3>
              <p className="mb-4 mt-3 text-[15px] text-muted-foreground">{sheet.lead}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <TextLink href={worksheetPath(sheet.slug)}>
                  Fill in online<span className="sr-only">: {sheet.title}</span>
                </TextLink>
                <TextLink href={worksheetPdf(sheet.slug)} download>
                  Download PDF<span className="sr-only">: {sheet.title}</span>
                </TextLink>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>

    <section className="site-wrap section-y" aria-labelledby="elsewhere-title">
      <SectionHead id="elsewhere-title" eyebrow="Elsewhere in the ecosystem" title="More useful starting points." />
      <div className="grid grid-cols-1 gap-7 md:grid-cols-3 md:gap-10">
        {ELSEWHERE.map((item) => (
          <article key={item.href} className="min-w-0">
            <h3 className="text-[21px] leading-tight">{item.title}</h3>
            <p className="mb-4 mt-3 text-[15px] text-muted-foreground">{item.text}</p>
            <TextLink href={item.href}>
              Explore resource<span className="sr-only">: {item.title}</span>
            </TextLink>
          </article>
        ))}
      </div>
    </section>

    <section
      className="site-wrap section-y grid grid-cols-1 gap-6 border-t border-border md:grid-cols-2 md:gap-20"
      aria-labelledby="research-title"
    >
      <div>
        <Eyebrow>Research & innovation</Eyebrow>
        <h2 id="research-title" className="h2">
          The research behind the perspective.
        </h2>
      </div>
      <div>
        <p className="max-w-[50ch] text-muted-foreground">
          Explore selected papers in robotics, computer vision and human-robot interaction, along with the full publication
          and patent records.
        </p>
        <div className="mt-5">
          <TextLink href="/publications">Publications & patents</TextLink>
        </div>
      </div>
    </section>

    <ContactCta
      title="Need a view matched to your priorities?"
      lead="A public guide is a starting point. A focused brief can turn it into an assessed shortlist, market-entry plan or technical decision."
      intent="scouting"
      label="Discuss your priorities"
    />
  </>
);

export default ResourcesPage;
