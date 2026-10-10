import SiteLayout from "@/components/site/SiteLayout";
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
import { ENGAGEMENT_FORMATS, SERVICES } from "@/content/services";
import { contactPath } from "@/lib/site";

const PROCESS = [
  { title: "Define the decision", text: "Clarify your objectives, context and the decisions you need to make." },
  { title: "Agree the scope", text: "Set the outputs, timing, working arrangements and cash fee." },
  { title: "Deliver and follow through", text: "Share findings, address questions and agree practical next steps." },
];

const PRACTICE = [
  {
    title: "Commercialisation & roadmaps",
    text: "Assess market needs, product direction and the technical work required to move research towards commercial use.",
  },
  {
    title: "Corporate innovation",
    text: "Structure AI adoption, corporate-startup collaboration and pilots around clear business questions.",
  },
  {
    title: "Startup advisory",
    text: "Focused support for deep tech founders on product direction, partnership readiness and research-to-market decisions.",
  },
];

const ADDITIONAL_CAPABILITIES = [
  "Product strategy and technical roadmap development",
  "Technology stack assessment and optimisation",
  "Go-to-market planning for deep tech products",
  "Corporate-startup partnership development",
  "Board advisory and stakeholder management",
  "Research-to-market transformation and enterprise AI adoption",
];

const AdvisoryPage = () => (
  <SiteLayout path="/advisory">
    <PageHero
      eyebrow="Advisory | Swiss ecosystem | International clients"
      title="Turn technical possibilities into informed decisions."
      lead="Market entry and Swiss partnerships for technology companies. Startup scouting and technical diligence for investors. Practical AI adoption for internal teams."
    >
      <Actions>
        <ButtonLink href={contactPath("advisory")}>Discuss an engagement</ButtonLink>
      </Actions>
    </PageHero>

    <section className="site-wrap pb-10 pt-10 md:pb-16" aria-labelledby="advisory-services-title">
      <SectionHead id="advisory-services-title" title="Focused support for the decisions ahead." />
      {SERVICES.map((service) => (
        <ServiceRow key={service.id} id={service.id} number={service.number} title={service.title} fine={service.audience}>
          <p>{service.description}</p>
          <ul>
            {service.outputs.map((output) => (
              <li key={output}>{output}</li>
            ))}
          </ul>
          <div className="mt-5">
            <TextLink href={service.cta.href ?? contactPath(service.cta.intent)}>{service.cta.label}</TextLink>
          </div>
        </ServiceRow>
      ))}

      <Note title="Research and preparation, with relevant connections.">
        <p>
          I have relationships with selected Swiss and international VCs. Where there is a relevant fit, I can explore
          introductions alongside scouting, assessment and preparation. Introductions, partnership interest and investment
          decisions depend on the parties involved.
        </p>
        <Actions className="mt-4">
          <TextLink href="/swiss-ai-robotics-ecosystem">Swiss ecosystem guide</TextLink>
          <TextLink href="/swiss-baltic-market-entry">Market-entry guide</TextLink>
        </Actions>
      </Note>
    </section>

    <section className="section-y bg-muted" aria-labelledby="formats-title">
      <div className="site-wrap">
        <SectionHead id="formats-title" eyebrow="Engagement formats" title="A format that fits the work." />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
          {ENGAGEMENT_FORMATS.map((format) => (
            <RuleBlock key={format.title} title={format.title}>
              <p>{format.description}</p>
            </RuleBlock>
          ))}
        </div>
        <p className="mt-8 max-w-[70ch] text-muted-foreground">
          Engagements are scoped around agreed outputs, timing and cash fees. Contact me to discuss the right format.
        </p>
        <p className="fine mt-3 max-w-[80ch]">
          For event representation, sponsorship, tickets, travel and production costs are agreed separately. Speaking
          opportunities and introductions depend on the relevant participants or organisers.
        </p>
      </div>
    </section>

    <section className="site-wrap section-y" aria-labelledby="process-title">
      <SectionHead id="process-title" eyebrow="How we work" title="From a clear question to a practical next step." />
      <ol className="grid list-none grid-cols-1 gap-8 p-0 md:grid-cols-3 md:gap-10">
        {PROCESS.map((step, index) => (
          <li key={step.title} className="min-w-0">
            <p className="mb-3 text-xs font-semibold text-primary">0{index + 1}</p>
            <h3 className="text-[21px]">{step.title}</h3>
            <p className="mt-3 text-[15px] text-muted-foreground">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>

    <section className="site-wrap section-y border-t border-border" aria-labelledby="practice-title">
      <SectionHead id="practice-title" eyebrow="Strategy in practice" title="From research to a usable plan." />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
        {PRACTICE.map((item) => (
          <RuleBlock key={item.title} title={item.title}>
            <p>{item.text}</p>
          </RuleBlock>
        ))}
      </div>
      <Actions>
        <TextLink href="/due-diligence">Explore due diligence</TextLink>
        <TextLink href="/ai-agents-strategy">Explore AI for internal data & workflows</TextLink>
      </Actions>

      <details className="mt-10 border-y border-border">
        <summary className="py-5 text-[15px] font-semibold text-foreground">Additional strategy capabilities</summary>
        <ul className="list-disc space-y-1.5 pb-7 pl-5 text-muted-foreground">
          {ADDITIONAL_CAPABILITIES.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </details>
    </section>

    <ContactCta
      title="What would a useful engagement resolve?"
      lead="Share your priorities, timeframe and the decisions you need to make. We will agree the scope and cash fee."
      intent="advisory"
      label="Discuss a project"
    />
  </SiteLayout>
);

export default AdvisoryPage;
