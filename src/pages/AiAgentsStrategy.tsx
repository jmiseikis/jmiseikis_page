import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, LineChart, Map, ShieldCheck } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const pillars = [
  {
    icon: ShieldCheck,
    title: "Technical viability",
    points: [
      "Assess whether agents need retrieval, tool use, workflow orchestration, or human review.",
      "Define confidence thresholds, escalation rules, audit logs, and evaluation datasets before rollout.",
      "Map integration risk across CRM, ERP, product data, ticketing, document stores, and internal APIs.",
    ],
  },
  {
    icon: LineChart,
    title: "ROI assessment",
    points: [
      "Prioritize workflows with measurable time savings, quality gains, revenue lift, or risk reduction.",
      "Model total cost across model usage, infrastructure, maintenance, integration, and oversight.",
      "Compare agent automation against simpler rules, search, analytics, and classic software options.",
    ],
  },
  {
    icon: Map,
    title: "Deployment roadmap",
    points: [
      "Start with narrow internal pilots, expand to supervised production, then automate high-confidence actions.",
      "Create governance for prompt changes, model updates, evaluation drift, incident review, and ownership.",
      "Plan change management so teams trust the agent and know when to override it.",
    ],
  },
];

const roadmap = [
  "Discover the highest-value agent use cases and reject low-ROI automation ideas early.",
  "Prototype with real business data, realistic constraints, and measurable acceptance criteria.",
  "Run offline evaluations against historical cases before exposing the agent to employees or customers.",
  "Launch a controlled pilot with monitoring, feedback loops, and clear escalation paths.",
  "Scale only after unit economics, safety, quality, latency, and governance targets are met.",
];

const AiAgentsStrategy = () => {
  const title = "AI Agent Development Strategy | Dr. Justinas Mišeikis";
  const description = "Enterprise guide to AI agent development strategy, technical viability, ROI assessment, and deployment roadmaps for production-ready systems.";

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content="ai agent development strategy, enterprise AI agents, AI agent ROI, production AI agents, AI automation roadmap, agentic AI strategy" />
        <link rel="canonical" href="https://jmiseikis.lovable.app/ai-agents-strategy" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content="https://jmiseikis.lovable.app/ai-agents-strategy" />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "AI Agent Development Strategy: Bridging Research and Commercial Impact",
            "description": description,
            "url": "https://jmiseikis.lovable.app/ai-agents-strategy",
            "author": { "@type": "Person", "name": "Dr. Justinas Mišeikis", "url": "https://jmiseikis.lovable.app" },
            "about": ["AI agent development strategy", "enterprise AI", "AI ROI", "AI deployment roadmap"],
            "inLanguage": "en"
          })}
        </script>
      </Helmet>

      <Navigation />

      <main className="pt-32 pb-16">
        <article className="container px-4 max-w-5xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <header className="max-w-4xl mb-16">
            <span className="text-primary font-medium tracking-wider uppercase text-sm">
              Enterprise AI Strategy
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
              AI Agent Development Strategy: Bridging Research and Commercial Impact
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              A practical AI agent development strategy starts with business value, not model novelty. The right approach tests technical feasibility, quantifies ROI, and builds a deployment roadmap that can survive production constraints.
            </p>
          </header>

          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">Where AI agents create commercial value</h2>
            <div className="prose prose-neutral max-w-none text-muted-foreground">
              <p>
                AI agents are most useful when a workflow requires context gathering, decision support, tool execution, and follow-up actions across multiple systems. Strong candidates include technical support triage, sales operations, procurement analysis, document intelligence, compliance review, research synthesis, and internal knowledge work.
              </p>
              <p>
                Weak candidates are tasks with unclear ownership, sparse data, high ambiguity, or safety-critical decisions without robust human oversight. In those cases, better search, analytics, workflow software, or classic automation may deliver faster and safer ROI.
              </p>
            </div>
          </section>

          <section className="grid md:grid-cols-3 gap-6 mb-16">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="border-2 border-border bg-card p-6">
                <pillar.icon className="w-10 h-10 text-primary mb-5" />
                <h2 className="text-2xl font-bold mb-4">{pillar.title}</h2>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {pillar.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">A production roadmap for enterprise AI agents</h2>
            <ol className="space-y-4">
              {roadmap.map((step, index) => (
                <li key={step} className="flex gap-4 border-b border-border pb-4">
                  <span className="text-primary font-bold text-xl tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                  <span className="text-muted-foreground leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="border-l-4 border-primary bg-secondary/40 p-8 md:p-10 mb-16">
            <h2 className="text-3xl font-bold mb-4">Executive takeaway</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The best AI agent development strategy is a portfolio discipline. It ranks use cases by commercial value, technical readiness, risk, and adoption friction. It then turns the strongest candidates into measurable pilots with clear go or no-go gates.
            </p>
            <Button asChild variant="swiss" size="lg">
              <Link to="/#contact">Discuss an AI agent roadmap</Link>
            </Button>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default AiAgentsStrategy;