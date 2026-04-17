import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Search, BarChart3, CheckCircle } from "lucide-react";

const DueDiligencePage = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const areas = [
    {
      icon: Search,
      title: "Technology Assessment",
      description: "In-depth evaluation of AI/ML models, robotics systems, computer vision pipelines, and data infrastructure. Assess technical viability, scalability, and defensibility.",
    },
    {
      icon: BarChart3,
      title: "Market & Commercial Analysis",
      description: "Evaluate product-market fit, competitive positioning, and commercialization potential. Assess go-to-market strategy and revenue scalability.",
    },
    {
      icon: Shield,
      title: "Team & IP Evaluation",
      description: "Assess team capabilities, organizational structure, patent portfolios, and research output quality. Identify talent risks and strengths.",
    },
    {
      icon: CheckCircle,
      title: "Strategic Recommendation",
      description: "Comprehensive investment recommendation with risk assessment, growth potential analysis, and strategic considerations for the investment thesis.",
    },
  ];

  const sectors = [
    "Artificial Intelligence & Machine Learning",
    "Robotics & Automation",
    "Computer Vision & Perception",
    "Healthcare Technology & Medical Devices",
    "Industrial Automation & Industry 4.0",
    "Autonomous Systems",
    "Human-Robot Interaction",
    "Deep Tech Hardware/Software",
  ];

  return (
    <>
      <Helmet>
        <title>AI & Robotics Due Diligence for Investors | Dr. Justinas Mišeikis – Zurich, DACH</title>
        <meta name="description" content="Expert technical and strategic due diligence for VCs, investors, and acquirers evaluating AI, robotics, and deep tech companies. PhD-level assessment of technology, teams, and market potential." />
        <meta name="keywords" content="AI due diligence, robotics due diligence, deep tech due diligence, VC technical assessment, AI investment evaluation, robotics investment analysis, technology due diligence Zurich, deep tech investor advisory DACH" />
        <link rel="canonical" href="https://jmiseikis.lovable.app/due-diligence" />
        <meta property="og:title" content="AI & Robotics Due Diligence | Dr. Justinas Mišeikis" />
        <meta property="og:description" content="Expert technical due diligence for investors evaluating AI, robotics, and deep tech companies." />
        <meta property="og:image" content="https://jmiseikis.lovable.app/og-image.png" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-20">
              <Link to="/" className="text-xl font-bold tracking-tight hover:text-primary transition-colors">
                Dr. Justinas Mišeikis
              </Link>
              <Link to="/#contact">
                <Button variant="swiss" size="sm">Get in Touch</Button>
              </Link>
            </div>
          </div>
        </nav>

        <section className="pt-32 pb-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <span className="block text-primary font-medium tracking-wider uppercase text-sm mb-4">
              Due Diligence for Investors & VCs
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              AI & Robotics <span className="text-primary">Due Diligence</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
              Expert technical and strategic assessment of AI, robotics, and deep tech companies for VCs,
              investors, and acquirers. PhD-level expertise combined with commercial acumen to evaluate
              technology viability, team strength, and market potential.
            </p>
          </div>
        </section>

        <section className="py-16 bg-secondary/30 px-4">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold mb-8">Assessment Areas</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {areas.map((area, index) => (
                <div key={index} className="bg-card p-8 border-2 border-border hover:border-primary transition-all duration-300 group">
                  <area.icon className="w-12 h-12 text-primary mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="text-2xl font-bold mb-4">{area.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{area.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="bg-secondary/50 p-8 md:p-12 border-l-4 border-primary">
              <h2 className="text-2xl font-bold mb-8">Sectors Covered</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {sectors.map((sector, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-muted-foreground">{sector}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-4">Need an expert assessment for your next investment?</h2>
            <p className="text-muted-foreground mb-8">
              Confidential, thorough, and actionable due diligence reports for AI and deep tech investments.
            </p>
            <Link to="/#contact">
              <Button size="lg" variant="swiss">Request Due Diligence</Button>
            </Link>
          </div>
        </section>

        <footer className="py-8 border-t border-border px-4">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Dr. Justinas Mišeikis. Zurich, Switzerland.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default DueDiligencePage;
