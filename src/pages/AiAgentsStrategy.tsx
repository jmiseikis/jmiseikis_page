import PageMeta from "@/components/site/PageMeta";
import { EditorialMeta, StepList, Worksheet } from "@/components/site/guide";
import {
  Actions,
  ButtonLink,
  ContactCta,
  Eyebrow,
  Note,
  PageHero,
  RuleBlock,
  SectionHead,
  SmartLink,
} from "@/components/site/primitives";
import { contactPath } from "@/lib/site";

// Illustrative workflow designs, not claims of previous client deployments.
const WORKFLOWS = [
  {
    title: "Internal knowledge & onboarding",
    question: "“Which policy applies, and where is the current procedure?”",
    facts: [
      ["Internal data", "Approved policies, procedures, product documentation and onboarding material in SharePoint, Confluence or Google Drive."],
      ["Work to support", "Find the current source, assemble a short answer and link to the exact material. Flag missing or conflicting information."],
      ["Human decision", "The document owner resolves conflicting policies. Access is checked for the employee asking, including restricted documents."],
      ["Pilot evidence", "Time to a verified answer, source accuracy and unanswered questions. Include outdated documents and access-denied cases in testing."],
    ],
  },
  {
    title: "Customer support & service",
    question: "“What happened before, and what should we do next?”",
    facts: [
      ["Internal data", "Ticket history, product manuals, known issues, service procedures and the relevant customer record in the CRM."],
      ["Work to support", "Classify the request, retrieve relevant troubleshooting steps, summarise prior context and draft a response with supporting evidence."],
      ["Human decision", "A service agent approves the reply and any warranty, refund or account change. Customer records remain scoped to the authorised account."],
      ["Pilot evidence", "Handling time including review, accepted drafts, repeat contacts and factual errors. Compare similar ticket types against the existing process."],
    ],
  },
  {
    title: "Sales proposals & RFPs",
    question: "“Can we answer this accurately without starting from scratch?”",
    facts: [
      ["Internal data", "Approved proposal answers, product specifications, security documentation, price rules and CRM opportunity context."],
      ["Work to support", "Match questions to approved answers, draft a response and highlight missing evidence or commitments that need an owner."],
      ["Human decision", "Sales and subject experts approve scope, pricing and claims before anything is sent. Confidential past customer material is excluded unless permitted."],
      ["Pilot evidence", "Preparation and review time, factual corrections, missed requirements and approval cycles. A faster draft alone is not the success measure."],
    ],
  },
  {
    title: "Procurement & operations",
    question: "“Why does this order or invoice need attention?”",
    facts: [
      ["Internal data", "Purchase orders, invoice records, supplier terms, ERP status, approval limits and the company's exception-handling policy."],
      ["Work to support", "Assemble the records, identify the mismatch, explain what evidence is missing and prepare the next action for the owner."],
      ["Human decision", "An authorised employee approves exceptions, payments and supplier changes. Existing rules handle deterministic checks where appropriate."],
      ["Pilot evidence", "Time to resolve exceptions, incorrect escalations, rework and audit completeness. Include missing records and conflicting values."],
    ],
  },
];

const PROCESS = [
  ["Trigger", "What starts the work? Who owns the result?"],
  ["Sources", "Which records and documents are needed?"],
  ["Work", "What is retrieved, compared or drafted?"],
  ["Approval", "Who checks exceptions and approves actions?"],
  ["Outcome", "Where is the result recorded and measured?"],
];

const PILOT_STEPS = [
  { title: "Agree the baseline", text: "Record current handling time, volume, error types, escalation rate and cost per completed case." },
  {
    title: "Define pass and stop criteria",
    text: "Set task-specific quality thresholds, access tests and acceptable review effort before evaluating the pilot. Include cases where the right response is to ask for help.",
  },
  {
    title: "Test realistic failures",
    text: "Use missing and outdated sources, conflicting records, unauthorised requests, misleading instructions inside documents and unavailable connected systems.",
  },
  {
    title: "Decide what earns a rollout",
    text: "Compare quality, adoption and full operating cost. Expand only after the agreed criteria are met and someone owns monitoring and exceptions.",
  },
];

const AiAgentsStrategy = () => (
  <>
    <PageMeta
      path="/ai-agents-strategy"
      title="AI for internal data & workflows | Dr. Justinas Mišeikis"
      description="Assess AI for internal knowledge, support, proposals and operations. Map company data, processes and permissions, then define a measurable pilot."
      ogTitle="AI for internal data & workflows"
      ogSubtitle="DR. JUSTINAS MIŠEIKIS · PRACTICAL GUIDE"
    />
    <PageHero
      breadcrumb={{ to: "/resources", label: "Resources" }}
      eyebrow="Practical guide | Enterprise AI"
      title="Make AI useful inside your business."
      lead="Turn your internal knowledge and recurring processes into a focused AI pilot. Start with the work people do, the data they need and the decisions that should stay with them."
    >
      <Actions>
        <ButtonLink href={contactPath("advisory")}>Discuss your workflow</ButtonLink>
        <ButtonLink href="#pilot-brief" variant="secondary">
          Get the pilot brief
        </ButtonLink>
      </Actions>
    </PageHero>
    <EditorialMeta topic="Internal data & process design" />

    <section className="site-wrap section-y" aria-labelledby="bottleneck-title">
      <SectionHead
        id="bottleneck-title"
        eyebrow="Start with a real bottleneck"
        title="Where does work get stuck?"
        intro="Employees searching for the right document. Support teams rebuilding an answer. Sales copying last year's proposal. Operations chasing an exception. Each is a specific process to assess before choosing an AI tool."
      />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
        <RuleBlock title="Find the right information">
          <p>Give employees answers grounded in approved internal sources, with links they can check.</p>
        </RuleBlock>
        <RuleBlock title="Prepare the next step">
          <p>Turn scattered records into a draft, comparison or recommendation for the person doing the work.</p>
        </RuleBlock>
        <RuleBlock title="Act within agreed limits">
          <p>Define which updates can be automated and which need a named person's approval.</p>
        </RuleBlock>
      </div>
    </section>

    <section id="workflows" className="section-y bg-muted" aria-labelledby="workflows-title">
      <div className="site-wrap">
        <SectionHead
          id="workflows-title"
          eyebrow="Four starting points"
          title="Your data. A specific task. A useful result."
          intro="Illustrative workflow designs, not claims of previous client deployments. Select a process to see what an assessment would cover."
        />
        <div className="border-t border-border">
          {WORKFLOWS.map((workflow, index) => (
            <details key={workflow.title} className="group border-b border-border" open={index === 0}>
              <summary className="grid list-none grid-cols-[24px_minmax(0,1fr)_20px] items-start gap-3 py-6 md:grid-cols-[30px_minmax(0,1fr)_24px] md:gap-5 [&::-webkit-details-marker]:hidden">
                <span className="pt-1.5 text-xs font-semibold text-primary" aria-hidden="true">
                  0{index + 1}
                </span>
                <span className="min-w-0">
                  <strong className="block text-[21px] leading-tight tracking-[-0.025em] text-foreground md:text-[23px]">
                    {workflow.title}
                  </strong>
                  <small className="mt-2 block text-sm text-muted-foreground">{workflow.question}</small>
                </span>
                <span aria-hidden="true" className="text-2xl leading-none text-primary transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <dl className="mb-7 ml-9 grid grid-cols-1 gap-5 md:ml-12 md:mr-10 md:grid-cols-2 md:gap-x-10 md:gap-y-6">
                {workflow.facts.map(([term, detail]) => (
                  <div key={term} className="min-w-0">
                    <dt className="mb-1.5 text-xs font-bold text-primary">{term}</dt>
                    <dd className="text-[15px] leading-relaxed text-muted-foreground">{detail}</dd>
                  </div>
                ))}
              </dl>
            </details>
          ))}
        </div>
      </div>
    </section>

    <section id="data" className="site-wrap section-y" aria-labelledby="data-title">
      <SectionHead
        id="data-title"
        eyebrow="Before selecting a platform"
        title="Map the process and the data it depends on."
        intro="For one workflow, follow a real case from its trigger to its final outcome. Include the time spent waiting, checking and correcting."
      />
      <ol className="my-8 grid list-none grid-cols-1 p-0 md:grid-cols-3 md:gap-6 md:border-t-2 md:border-primary lg:grid-cols-5">
        {PROCESS.map(([title, text], index) => (
          <li
            key={title}
            className="grid grid-cols-[24px_minmax(0,1fr)] gap-x-3 border-t border-border py-4 md:block md:border-t-0 md:pt-5"
          >
            <span className="text-xs font-semibold text-primary" aria-hidden="true">
              0{index + 1}
            </span>
            <h3 className="text-[19px] leading-tight md:mt-3">{title}</h3>
            <p className="col-start-2 mt-1 text-sm text-muted-foreground md:mt-2">{text}</p>
          </li>
        ))}
      </ol>
      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
        <article className="border-t border-border pt-6">
          <h3 className="text-[21px] leading-tight">What is the source of truth?</h3>
          <p className="mt-3 text-[15px] text-muted-foreground">
            Name the data owner, authoritative version, refresh cycle and missing fields. Read changing order or account status
            from its system of record; use documents for explanatory context.
          </p>
        </article>
        <article className="border-t border-border pt-6">
          <h3 className="text-[21px] leading-tight">Who may see and change what?</h3>
          <p className="mt-3 text-[15px] text-muted-foreground">
            Map existing user permissions to search results and actions. Define retention, hosting and logging requirements
            with the client's IT and data owners before selecting a deployment approach.
          </p>
        </article>
      </div>
      <p className="fine mt-6 max-w-[80ch]">
        Document-level access checks are an implementation requirement, not something a prompt can replace. See{" "}
        <SmartLink
          href="https://learn.microsoft.com/en-us/azure/search/search-document-level-access-overview"
          className="underline underline-offset-4"
        >
          Microsoft's access-control guidance
        </SmartLink>{" "}
        for one concrete example; feature maturity and connector coverage must be checked for the chosen platform.
      </p>
    </section>

    <section id="pilot" className="section-y bg-muted" aria-labelledby="pilot-title">
      <div className="site-wrap grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-20">
        <div>
          <Eyebrow>A bounded first pilot</Eyebrow>
          <h2 id="pilot-title" className="h2">
            One team. One process. Evidence before expansion.
          </h2>
          <p className="mt-4 max-w-[50ch] text-muted-foreground">
            Start with a representative set of completed cases that the client is authorised to use. Compare the proposed
            workflow with the current process, including human review and correction time.
          </p>
          <p className="fine mt-4 max-w-[50ch]">
            Use the simplest approach that meets the need. Search or rules-based automation may be enough.{" "}
            <SmartLink href="https://www.anthropic.com/engineering/building-effective-agents" className="underline underline-offset-4">
              Anthropic's workflow guidance
            </SmartLink>{" "}
            explains the trade-off between predictable workflows and more autonomous agents.
          </p>
        </div>
        <StepList steps={PILOT_STEPS} />
      </div>
    </section>

    <section id="deliverables" className="site-wrap section-y" aria-labelledby="deliverables-title">
      <SectionHead id="deliverables-title" eyebrow="What I help you produce" title="A brief your team can act on." />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
        <RuleBlock title="Opportunity & process map">
          <p>A prioritised shortlist of workflows, the current steps and handoffs, and a recommendation on where to start.</p>
        </RuleBlock>
        <RuleBlock title="Data & readiness assessment">
          <p>A source and system map, ownership and permissions, integration dependencies, and gaps that need fixing.</p>
        </RuleBlock>
        <RuleBlock title="Pilot & decision brief">
          <p>
            A scoped workflow, evaluation cases, cost assumptions, acceptance criteria and a handoff for your internal team or
            implementation partner.
          </p>
        </RuleBlock>
      </div>
      <Note title="Make the economics explicit.">
        <p>
          Time released = case volume × reduction in average handling time, including review and rework. Cash savings require
          an actual reduction in spend. Account for integration, licences, model usage, support and ongoing evaluation
          separately.
        </p>
      </Note>
    </section>

    <Worksheet
      id="pilot-brief"
      title="Describe your first workflow."
      intro="Use the blank brief with your operations, IT and data owners. Start with the process and system names; sensitive company data is not needed for an initial conversation."
      items={[
        "What task repeats, and who owns it?",
        "Which systems and documents does it use?",
        "Where is time lost or quality inconsistent?",
        "What may AI draft, recommend or change?",
        "What would make a pilot worth continuing?",
      ]}
      file="/downloads/ai-workflow-pilot-brief.txt"
      label="Download the pilot brief (TXT)"
    />

    <ContactCta
      title="Bring one process worth improving."
      lead="I can help assess the opportunity, map the data and define a pilot with useful decision criteria. Implementation responsibilities are agreed with your team or chosen delivery partner."
      intent="advisory"
      label="Discuss your workflow"
    />
  </>
);

export default AiAgentsStrategy;
