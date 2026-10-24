import type { EnquiryIntent } from "@/lib/site";

export interface Service {
  id: string;
  number: string;
  title: string;
  audience: string;
  description: string;
  typicalOutput: string;
  outputs: string[];
  cta: { label: string; intent?: EnquiryIntent; href?: string };
}

/** Advisory offers. The first three appear on the homepage; all four on /advisory. */
export const SERVICES: Service[] = [
  {
    id: "market-entry",
    number: "01",
    title: "Market entry & Swiss partnerships",
    audience: "For technology companies and selected startups",
    description:
      "Assess target markets, sharpen your positioning and identify relevant Swiss partners. Support Swiss startups in shaping their next international market test.",
    typicalOutput: "A market-entry brief and prioritised partner shortlist.",
    outputs: [
      "Target-market assessment, positioning and partner shortlist",
      "Customer discovery questions and go-to-market assumptions",
      "A pilot, partnership or market-validation action plan",
    ],
    cta: { label: "Discuss a scouting brief", intent: "scouting" },
  },
  {
    id: "scouting-diligence",
    number: "02",
    title: "Startup scouting & technical diligence",
    audience: "For investors, acquirers and corporate strategy teams",
    description:
      "Help VCs and corporate investors find Swiss AI and robotics opportunities, assess technical substance and test the evidence from early stage through scale-up.",
    typicalOutput: "An assessed shortlist or technical diligence brief.",
    outputs: [
      "Thesis-led scouting of Swiss early-stage and scale-up companies",
      "Technical evidence review, management questions and validation priorities",
      "A concise decision brief with recommended next steps",
    ],
    cta: { label: "Discuss an assessment", intent: "diligence" },
  },
  {
    id: "swiss-presence",
    number: "03",
    title: "Swiss presence & strategic support",
    audience: "For international scaleups and established companies",
    description:
      "Add a local technical and commercial perspective to your Swiss activities, from partnership development to conference representation.",
    typicalOutput: "A scoped programme of research, meetings or event activity.",
    outputs: [
      "A scoped programme of research, meetings or event activity",
      "Agreed company representation and technical messaging",
      "A structured activity summary and follow-up plan",
    ],
    cta: { label: "Discuss your Swiss priorities", intent: "representation" },
  },
  {
    id: "internal-ai",
    number: "04",
    title: "AI for internal data & workflows",
    audience: "For operations, product and technology leaders",
    description:
      "Identify useful internal AI applications, map the company data and processes they rely on, and define a pilot with measurable criteria.",
    typicalOutput: "A workflow and data readiness assessment with a pilot brief.",
    outputs: [
      "Workflow and data readiness assessment",
      "System access, ownership and human approval design",
      "A pilot brief for your team or implementation partner",
    ],
    cta: { label: "Explore concrete workflows", href: "/ai-agents-strategy" },
  },
];

export const ENGAGEMENT_FORMATS = [
  {
    title: "Focused project",
    description: "A defined decision, research brief or assessment with agreed outputs, timing and a fixed scope.",
  },
  {
    title: "Recurring strategic support",
    description: "A monthly programme of advisory, scouting or partnership work with an agreed allocation and priorities.",
  },
  {
    title: "Event representation",
    description:
      "Preparation, agreed attendance or representation, technical messaging and structured follow-up within a defined brief.",
  },
];

/** Three signature themes that group the original speaking catalogue. */
export const SIGNATURE_TOPICS = [
  {
    title: "Physical AI: from demonstration to deployment",
    audience: "Technology leaders, industrial teams and investors",
    description: "A practical view of what it takes to move embodied AI into real operating environments.",
    points: [
      "Distinguish technical demonstrations from deployment readiness",
      "Identify integration, reliability and operational questions",
      "Evaluate a realistic path from pilot to use",
    ],
  },
  {
    title: "Corporate-startup collaboration that moves forward",
    audience: "Innovation teams, founders and partnership leaders",
    description: "How to align technical ambition, business priorities and the practical work of a partnership.",
    points: [
      "Define a useful pilot and a shared decision process",
      "Recognise mismatched incentives and expectations",
      "Plan the transition from exploration to implementation",
    ],
  },
  {
    title: "Evaluating AI and robotics beyond the pitch",
    audience: "Investors, executives and corporate strategy teams",
    description: "The technical and commercial questions that make an AI or robotics opportunity easier to assess.",
    points: [
      "Separate capability claims from supporting evidence",
      "Connect technical risks with commercial assumptions",
      "Ask better questions before committing resources",
    ],
  },
];

/** The wider catalogue: the remaining five of the eight original topic areas. */
export const WIDER_TOPICS = [
  { title: "AI commercialisation & ethics", description: "From research to market, including the ethical considerations that shape adoption." },
  { title: "Scaling AI from pilots to business impact", description: "Moving beyond proofs of concept into practical use across an organisation." },
  { title: "Strategic AI for sustainable value creation", description: "Connecting business goals, governance and long-term value." },
  { title: "Bringing research to commercialisation", description: "Connecting research ambition with product direction and commercial realities." },
  { title: "The future of human-robot interaction", description: "Robots as collaborative partners in healthcare, manufacturing and other environments." },
];

/** Owner-confirmed past engagements. Davos is kept distinct from an official WEF speaking role. */
export const PAST_ENGAGEMENTS = [
  "Wisdom House @ Davos 2026 - independently organised during WEF week",
  "GenAI Zürich",
  "LOGIN Conference, Lithuania",
  "Innovation Roundtable",
  "ETH Zürich & ETH Entrepreneurship Club",
  "Sony AI Conference",
  "VentureLab Engineering Ecosystem Event",
];
