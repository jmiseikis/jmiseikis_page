// The four working templates, shown as fillable pages at /worksheets/<slug> and printed to /downloads/<slug>.pdf
// (scripts/build-worksheet-pdfs.mjs). The wording follows the original plain-text templates of 6 October 2026.

export type WorksheetField =
  | { type: "text"; id: string; label: string; prompt: string; rows?: number }
  | { type: "choice"; id: string; label: string; prompt: string; options: string[] }
  | { type: "checklist"; id: string; label: string; prompt?: string; items: string[] }
  | {
      type: "rows";
      id: string;
      label: string;
      prompt: string;
      /** Columns of each row. A column with options is a select. */
      columns: { id: string; label: string; options?: string[] }[];
      /** Empty rows shown in the printed blank template. */
      blankRows: number;
    };

export interface WorksheetDef {
  slug: WorksheetSlug;
  title: string;
  lead: string;
  /** The guide this worksheet belongs to. */
  guide: { href: string; label: string };
  fields: WorksheetField[];
  /** Closing qualification, printed on the template too. */
  note: string;
}

export type WorksheetSlug =
  | "technology-scouting-brief"
  | "market-entry-brief"
  | "ai-workflow-pilot-brief"
  | "technical-diligence-checklist";

const RELATIONSHIP = ["Public lead", "Existing relationship", "Introduction consented"];

export const WORKSHEETS: Record<WorksheetSlug, WorksheetDef> = {
  "technology-scouting-brief": {
    slug: "technology-scouting-brief",
    title: "Technology scouting brief",
    lead: "Set the thesis, scope, evidence threshold and shortlist fields before collecting names.",
    guide: { href: "/swiss-ai-robotics-ecosystem", label: "Swiss AI & robotics ecosystem guide" },
    fields: [
      { type: "text", id: "thesis", label: "Thesis", prompt: "Use case, technical capability, customer problem and strategic rationale." },
      {
        type: "text",
        id: "scope",
        label: "Scope",
        prompt: "Geography, early stage or scale-up, product maturity, company, lab or partner type, and exclusions.",
      },
      {
        type: "text",
        id: "evidence",
        label: "Evidence",
        prompt: "What qualifies a candidate? Sources, customer proof, evaluation method, technical dependencies and open questions.",
      },
      {
        type: "text",
        id: "priorities",
        label: "Priorities",
        prompt: "Must-have criteria, useful extras, disqualifiers and the largest uncertainty.",
      },
      {
        type: "rows",
        id: "shortlist",
        label: "Shortlist",
        prompt: "One row per candidate. A listing or funding announcement is a discovery signal, not proof.",
        columns: [
          { id: "name", label: "Name" },
          { id: "source", label: "Source URL" },
          { id: "checked", label: "Checked date" },
          { id: "stage", label: "Stage evidence" },
          { id: "technical", label: "Technical fit" },
          { id: "commercial", label: "Commercial fit" },
          { id: "uncertainty", label: "Key uncertainty" },
          { id: "reason", label: "Reason to approach" },
          { id: "contact", label: "Public contact route" },
          { id: "relationship", label: "Relationship status", options: RELATIONSHIP },
        ],
        blankRows: 3,
      },
      {
        type: "choice",
        id: "engagement",
        label: "Engagement",
        prompt: "What kind of engagement are you looking for?",
        options: ["Partnership", "Pilot", "Supplier evaluation", "Investment assessment"],
      },
      {
        type: "text",
        id: "outreach",
        label: "Outreach",
        prompt: "A concise reason to speak, the proposed question and the desired next step. Introductions require agreement from the participants.",
      },
      {
        type: "text",
        id: "delivery",
        label: "Delivery",
        prompt: "Decision owner, deadline, review cadence and next validation steps.",
      },
    ],
    note: "A listing or funding announcement is a discovery signal, not diligence or proof that a company is currently raising.",
  },

  "market-entry-brief": {
    slug: "market-entry-brief",
    title: "Technology market-entry brief",
    lead: "Write down the market hypothesis, entry route, validation questions and pilot.",
    guide: { href: "/swiss-baltic-market-entry", label: "Swiss & Baltic market-entry guide" },
    fields: [
      { type: "text", id: "product", label: "Product", prompt: "Capability, evidence of value, current markets and commercial maturity." },
      {
        type: "text",
        id: "hypothesis",
        label: "Market hypothesis",
        prompt: "Country, customer segment, buyer role, buying trigger and problem.",
      },
      { type: "text", id: "alternatives", label: "Alternatives", prompt: "Current customer process, competitors and reason to switch." },
      {
        type: "text",
        id: "route",
        label: "Entry route",
        prompt: "Direct sales, integrator, distributor, research collaboration or other partnership. Specify responsibilities and incentives.",
      },
      {
        type: "text",
        id: "requirements",
        label: "Local requirements",
        prompt:
          "Language, integration, service response, procurement evidence, product requirements and specialist legal or regulatory questions to resolve with appropriate advisers.",
      },
      {
        type: "rows",
        id: "shortlist",
        label: "Shortlist",
        prompt: "One row per customer or partner organisation.",
        columns: [
          { id: "organisation", label: "Organisation" },
          { id: "role", label: "Role" },
          { id: "fit", label: "Reason for fit" },
          { id: "evidence", label: "Evidence URL and date" },
          { id: "gap", label: "Known gap" },
          { id: "contact", label: "Public contact route" },
          { id: "relationship", label: "Relationship status", options: RELATIONSHIP },
        ],
        blankRows: 3,
      },
      {
        type: "text",
        id: "validation",
        label: "Validation",
        prompt: "Questions for customers and partners, evidence required, feedback and next experiment.",
      },
      {
        type: "text",
        id: "pilot",
        label: "Pilot",
        prompt: "Problem, scope, buyer or sponsor, delivery owner, timing, success criteria and commercial next step.",
      },
      { type: "text", id: "resources", label: "Resources", prompt: "Budget, team time, travel, local support and opportunity cost." },
      {
        type: "choice",
        id: "decision",
        label: "Decision",
        prompt: "After validation: what happens next? Record the evidence, owner and review date below.",
        options: ["Proceed", "Narrow", "Change", "Stop"],
      },
      { type: "text", id: "decisionNotes", label: "Decision evidence, owner and review date", prompt: "", rows: 3 },
    ],
    note: "A working framework, not a promise of meetings, sales or market access.",
  },

  "ai-workflow-pilot-brief": {
    slug: "ai-workflow-pilot-brief",
    title: "AI workflow pilot brief",
    lead: "Describe the process, data, access, human control and acceptance criteria for an internal AI pilot.",
    guide: { href: "/ai-agents-strategy", label: "AI for internal data & workflows guide" },
    fields: [
      {
        type: "text",
        id: "process",
        label: "1. Process",
        prompt: "Name, trigger, owner, users, steps, handoffs, exception paths and final system of record.",
      },
      {
        type: "text",
        id: "baseline",
        label: "2. Baseline",
        prompt:
          "Cases per month, handling and review minutes per case, queue time, error or rework rate and current cost per completed case. Note the source and date of each measurement.",
      },
      {
        type: "text",
        id: "data",
        label: "3. Data",
        prompt:
          "Required sources, business owner, current version, quality gaps, update cycle and sample availability. Distinguish documents from live structured records.",
      },
      {
        type: "text",
        id: "access",
        label: "4. Access",
        prompt:
          "Allowed users and groups, account boundaries, read and write permissions, retention and hosting requirements, and logging owner. Check retrieval and actions against source permissions.",
      },
      {
        type: "text",
        id: "workflow",
        label: "5. Proposed workflow",
        prompt: "What is retrieved, summarised, drafted or changed? What can conventional search or rules already handle?",
      },
      {
        type: "text",
        id: "control",
        label: "6. Human control",
        prompt:
          "Who approves external messages, commercial commitments and system updates? Which cases must stop or escalate? What happens if a connected system fails?",
      },
      {
        type: "text",
        id: "tests",
        label: "7. Test set",
        prompt:
          "Authorised, representative historical cases and separate held-out cases, with expected answers or actions and source evidence. Include ambiguous cases, outdated or missing data, restricted documents and misleading source instructions.",
      },
      {
        type: "text",
        id: "acceptance",
        label: "8. Acceptance",
        prompt:
          "Task quality, error severity, review effort, cycle time, access tests, adoption and operating cost. Set thresholds before the pilot and name the decision owner.",
      },
      {
        type: "text",
        id: "economics",
        label: "9. Economics",
        prompt:
          "Monthly cases × reduction in end-to-end handling minutes ÷ 60 = potential capacity hours. Confirm whether capacity becomes cash savings. Include implementation, licences, usage, support and evaluation cost. Do not count the same benefit twice.",
      },
      {
        type: "text",
        id: "delivery",
        label: "10. Delivery",
        prompt: "Responsible internal team or vendor, dependencies, timing, rollout limits, monitoring, rollback and go/no-go meeting.",
      },
    ],
    note: "Use internally. Share process and system names first; do not send confidential datasets through an initial website enquiry.",
  },

  "technical-diligence-checklist": {
    slug: "technical-diligence-checklist",
    title: "AI & robotics technical diligence checklist",
    lead: "The evidence to request from early-stage and scale-up companies, claim by claim.",
    guide: { href: "/due-diligence", label: "AI & robotics due diligence" },
    fields: [
      {
        type: "rows",
        id: "claims",
        label: "Claims and evidence",
        prompt: "For each claim: the evidence and how far it holds. Distinguish demonstrated, reported and unverified claims.",
        columns: [
          { id: "claim", label: "Claim" },
          { id: "source", label: "Evidence source and date" },
          { id: "status", label: "Status", options: ["Demonstrated", "Reported", "Unverified"] },
          { id: "reproducibility", label: "Reproducibility" },
          { id: "limitations", label: "Limitations" },
          { id: "confidence", label: "Confidence", options: ["High", "Medium", "Low"] },
          { id: "question", label: "Unresolved question" },
          { id: "validation", label: "Proposed validation" },
        ],
        blankRows: 3,
      },
      {
        type: "checklist",
        id: "early",
        label: "Early stage",
        items: [
          "Problem, user and why the proposed technology is necessary.",
          "Demo conditions, evaluation dataset, baselines and independent reproduction.",
          "Proprietary contribution versus third-party models, software and hardware.",
          "Data provenance, access rights, quality and dependencies; specialist legal review where needed.",
          "Team capability, ownership of critical knowledge and hiring gaps.",
          "Next technical milestone, experiment, resources and failure condition.",
          "Customer validation and assumptions behind the route to revenue.",
        ],
      },
      {
        type: "checklist",
        id: "scale",
        label: "Scale-up",
        items: [
          "Performance across sites, users and edge cases; failures and incident handling.",
          "Integration effort per deployment and customer-specific engineering.",
          "Infrastructure, model, hardware, support and maintenance costs.",
          "Reliability, monitoring, security controls and update or change process.",
          "Manufacturing, supply-chain, service and capacity constraints for robotics.",
          "Deployment backlog, repeatability, engineering organisation and roadmap risks.",
          "Customer concentration and evidence supporting unit-economics assumptions.",
        ],
      },
      { type: "text", id: "risks", label: "Material risks", prompt: "" },
      { type: "text", id: "questions", label: "Management questions", prompt: "" },
      { type: "text", id: "specialist", label: "Specialist-review needs", prompt: "", rows: 3 },
      { type: "text", id: "recommended", label: "Recommended tests", prompt: "", rows: 3 },
      { type: "text", id: "dependencies", label: "Decision dependencies", prompt: "", rows: 3 },
    ],
    note: "A checklist does not establish a company's investment merit and does not replace a company-specific technical assessment or specialist legal review.",
  },
};

export const WORKSHEET_LIST = Object.values(WORKSHEETS);
export const worksheetPath = (slug: WorksheetSlug) => `/worksheets/${slug}`;
export const worksheetPdf = (slug: WorksheetSlug) => `/downloads/${slug}.pdf`;
