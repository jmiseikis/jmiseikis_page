import PageMeta from "@/components/site/PageMeta";
import { EditorialMeta, StepList, Worksheet } from "@/components/site/guide";
import { Actions, ButtonLink, ContactCta, Eyebrow, PageHero, RuleBlock, SectionHead, TextLink } from "@/components/site/primitives";
import { contactPath } from "@/lib/site";

// Public ecosystem organisations as research starting points. Their presence here does not
// imply a personal relationship, partnership or agreed introduction.
const BALTIC_SOURCES = [
  {
    country: "Lithuania",
    name: "Startup Lithuania",
    text: "An Innovation Agency Lithuania initiative with startup ecosystem information, open calls and events.",
    href: "https://www.startuplithuania.com/",
  },
  {
    country: "Latvia",
    name: "Startup Latvia",
    text: "A startup ecosystem welcome pack and a starting point for exploring the Latvian community.",
    href: "https://startuplatvia.eu/welcome-pack/",
  },
  {
    country: "Estonia",
    name: "Startup Estonia",
    text: "An initiative supporting Estonia's startup ecosystem, including access to knowledge and networks.",
    href: "https://startupestonia.ee/our-story/",
  },
];

const STEPS = [
  {
    eyebrow: "Days 1-30",
    title: "Define where you can win",
    text: "Compare a small set of segments and markets. Map buyer needs, alternatives, differentiation and the local proof required. Build an initial company and partner shortlist.",
    decision: "Which segment and route deserve validation?",
  },
  {
    eyebrow: "Days 31-60",
    title: "Test the route with relevant people",
    text: "Prepare discovery questions, approach target accounts and potential partners, and document feedback. Refine the message, pricing assumptions and proposed pilot.",
    decision: "Is there a credible buyer problem and a workable route to serve it?",
  },
  {
    eyebrow: "Days 61-90",
    title: "Set up the next commercial test",
    text: "Define a pilot or partner-validation brief with an owner, success criteria, support model and follow-up. Review unresolved commercial and delivery dependencies.",
    decision: "Proceed, narrow the scope, change the approach or stop?",
  },
];

const ENGAGEMENT = [
  "A market and customer-segment comparison",
  "A partner shortlist with fit and evidence gaps",
  "A value proposition and discovery interview plan",
  "Pilot design and a go-to-market action plan",
  "Swiss event representation and structured follow-up",
];

const MarketEntryGuide = () => (
  <>
    <PageMeta path="/swiss-baltic-market-entry" />
    <PageHero
      breadcrumb={{ to: "/resources", label: "Resources" }}
      eyebrow="Field guide | Switzerland, the Baltics & beyond"
      title="Build your route into a new market."
      lead="For technology companies exploring Switzerland, and Swiss startups assessing international growth. Turn a broad expansion idea into a focused customer, partner and validation plan."
    >
      <Actions>
        <ButtonLink href={contactPath("scouting")}>Discuss market entry</ButtonLink>
        <ButtonLink href="#market-brief" variant="secondary">
          Get the market-entry brief
        </ButtonLink>
      </Actions>
    </PageHero>
    <EditorialMeta topic="Sources linked throughout" />

    <section className="site-wrap section-y" aria-labelledby="directions-title">
      <SectionHead
        id="directions-title"
        eyebrow="Two directions. One disciplined approach."
        title="Choose the first market and the first use case."
      />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
        <article className="min-w-0 border-t-2 border-primary pt-6">
          <h3 className="text-[23px] leading-tight md:text-2xl">Into Switzerland</h3>
          <p className="mb-5 mt-3 text-[15px] text-muted-foreground">
            Define the customer segment, buying problem and partner role. Identify a shortlist of potential buyers, research
            collaborators, integrators or channel partners, then test the assumptions in focused conversations.
          </p>
          <TextLink href="/swiss-ai-robotics-ecosystem">Use the Swiss ecosystem guide</TextLink>
        </article>
        <article className="min-w-0 border-t-2 border-primary pt-6">
          <h3 className="text-[23px] leading-tight md:text-2xl">From Switzerland to other markets</h3>
          <p className="mb-5 mt-3 text-[15px] text-muted-foreground">
            Help founders compare candidate markets, refine positioning and choose a direct-sales or partner-led route. Assess
            the delivery, support and proof a local customer would need before committing resources.
          </p>
          <TextLink href="/advisory">Explore advisory support</TextLink>
        </article>
      </div>
    </section>

    <section className="section-y bg-muted" aria-labelledby="baltic-title">
      <div className="site-wrap">
        <SectionHead
          id="baltic-title"
          eyebrow="Baltic starting points"
          title="Three countries. Three research starting points."
          intro="Treat Lithuania, Latvia and Estonia as separate markets. These public ecosystem organisations can help you begin researching the local landscape; their presence here does not imply a personal relationship or an agreed introduction."
        />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
          {BALTIC_SOURCES.map((source) => (
            <RuleBlock key={source.href} eyebrow={source.country} title={source.name}>
              <p>{source.text}</p>
              <div className="mt-4">
                <TextLink href={source.href}>
                  Explore the source<span className="sr-only">: {source.name}</span>
                </TextLink>
              </div>
            </RuleBlock>
          ))}
        </div>
        <p className="fine mt-8">
          Sources checked on 6 October 2026. Use each organisation's current website for programmes, events and contact routes.
        </p>
      </div>
    </section>

    <section className="site-wrap section-y" aria-labelledby="ninety-title">
      <SectionHead
        id="ninety-title"
        eyebrow="An example planning sequence"
        title="What should the first 90 days establish?"
        intro="Use this as a planning framework. Timing depends on the product, market, procurement cycle and availability of people to speak with."
      />
      <StepList steps={STEPS} className="mt-8 max-w-[840px]" />
    </section>

    <section className="section-y bg-muted" aria-labelledby="help-title">
      <div className="site-wrap grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-20">
        <div>
          <Eyebrow>How I can help</Eyebrow>
          <h2 id="help-title" className="h2">
            Technical context and practical market work.
          </h2>
          <p className="mt-4 max-w-[50ch] text-muted-foreground">
            My background combines technology scouting at Sony, strategy and partnerships at Sony AI, and AI leadership at F&P
            Robotics. I apply that perspective to market selection, positioning, partner assessment and research-to-market
            decisions.
          </p>
        </div>
        <div className="text-muted-foreground">
          <h3 className="text-[21px] leading-tight">A scoped engagement can include</h3>
          <ul className="mt-4 list-disc space-y-1.5 pl-5 text-[15px]">
            {ENGAGEMENT.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-5 text-[15px]">
            I have relationships with selected Swiss and international VCs. Where there is a relevant fit, I can explore
            introductions alongside the research and preparation. Introductions and investment interest depend on the people
            involved.
          </p>
          <div className="mt-5">
            <TextLink href="/advisory#swiss-presence">Explore Swiss event representation</TextLink>
          </div>
        </div>
      </div>
    </section>

    <Worksheet
      id="market-brief"
      muted={false}
      title="Write the expansion hypothesis before the pitch."
      intro="Use this brief to align founders, commercial leaders and potential partners on the next market test."
      items={[
        "Target market, segment and buyer",
        "Customer problem and proof of value",
        "Alternatives and reason to choose you",
        "Direct, channel or partnership route",
        "Pilot, resources and decision criteria",
      ]}
      file="/downloads/market-entry-brief.txt"
      label="Download market-entry brief (TXT)"
    />

    <ContactCta
      title="Which market or partnership are you exploring?"
      lead="Share your product, target customers and the decision ahead. We can scope the research, positioning and validation work around a concrete commercial objective."
      intent="scouting"
      label="Discuss market entry"
    />
  </>
);

export default MarketEntryGuide;
