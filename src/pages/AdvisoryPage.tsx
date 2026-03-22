import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lightbulb, TrendingUp, Users, Cog } from "lucide-react";

const AdvisoryPage = () => {
  const services = [
    {
      icon: Lightbulb,
      title: "AI Commercialization",
      description: "Transform research breakthroughs into market-ready solutions. Strategic guidance on AI product development, GTM strategy, and scaling from lab to revenue.",
      industries: ["AI/ML", "Robotics", "Healthcare Tech", "Computer Vision"],
    },
    {
      icon: TrendingUp,
      title: "Corporate Innovation Consulting",
      description: "Help enterprises strategically adopt AI, robotics, and automation. Bridge emerging technology and business value with actionable roadmaps.",
      industries: ["Manufacturing", "Industrial Tech", "Enterprise", "Automotive"],
    },
    {
      icon: Users,
      title: "Startup Mentoring & Partnership Advisory",
      description: "Guide deep-tech startups from research to revenue. Product-market fit, fundraising strategy, corporate partnership development, and team building.",
      industries: ["Early Stage", "Deep Tech", "B2B SaaS", "Scaleups"],
    },
    {
      icon: Cog,
      title: "Technology Strategy & Roadmapping",
      description: "Assessment and optimization of technology stacks, AI infrastructure, and product roadmaps. Align technical capabilities with business objectives.",
      industries: ["Enterprise", "R&D Organizations", "Tech Companies"],
    },
  ];

  const engagements = [
    "Strategic advisory for AI and robotics commercialization",
    "Product strategy and technical roadmap development",
    "Technology stack assessment and optimization",
    "Go-to-market planning for deep tech products",
    "Corporate-startup partnership development",
    "Board advisory and stakeholder management",
    "Research-to-market transformation strategy",
    "AI adoption strategy for enterprises",
  ];

  return (
    <>
      <Helmet>
        <title>AI Strategy Advisory & Consulting | Dr. Justinas Mišeikis – Zurich, DACH & Europe</title>
        <meta name="description" content="Expert AI strategy advisory and consulting services in Zurich. AI commercialization, corporate innovation, startup mentoring, and technology roadmapping for enterprises, startups, and investors across DACH and Europe." />
        <meta name="keywords" content="AI strategy advisory, AI consulting Zurich, AI commercialization consultant, corporate innovation consulting, startup mentoring AI, technology strategy DACH, robotics consulting Europe, AI roadmap consulting" />
        <link rel="canonical" href="https://jmiseikis.lovable.app/advisory" />
        <meta property="og:title" content="AI Strategy Advisory & Consulting | Dr. Justinas Mišeikis" />
        <meta property="og:description" content="Expert AI strategy advisory for corporations, startups, and investors. Zurich-based, serving DACH and Europe." />
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
              Advisory & Strategy
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              AI Strategy Advisory & <span className="text-primary">Consulting</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
              I help organizations navigate the complex journey from cutting-edge AI research to commercial success.
              Whether you're a startup scaling AI products, an enterprise adopting emerging technology, or an investor
              evaluating opportunities — I bring battle-tested strategy from Sony AI and beyond.
            </p>
          </div>
        </section>

        <section className="py-16 bg-secondary/30 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="grid md:grid-cols-2 gap-8">
              {services.map((service, index) => (
                <div key={index} className="bg-card p-8 border-2 border-border hover:border-primary transition-all duration-300 group">
                  <service.icon className="w-12 h-12 text-primary mb-6 group-hover:scale-110 transition-transform" />
                  <h2 className="text-2xl font-bold mb-4">{service.title}</h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{service.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {service.industries.map((industry, i) => (
                      <span key={i} className="text-xs px-3 py-1 bg-secondary text-secondary-foreground font-medium">
                        {industry}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="bg-secondary/50 p-8 md:p-12 border-l-4 border-primary">
              <h2 className="text-2xl font-bold mb-8">Typical Engagements</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {engagements.map((engagement, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-muted-foreground">{engagement}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to accelerate your AI strategy?</h2>
            <p className="text-muted-foreground mb-8">
              Let's discuss how strategic advisory can help you bridge research and commercialization.
            </p>
            <Link to="/#contact">
              <Button size="lg" variant="swiss">Contact Me</Button>
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

export default AdvisoryPage;
