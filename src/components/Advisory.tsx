import { Lightbulb, TrendingUp, Users, Cog } from "lucide-react";
import { Button } from "@/components/ui/button";

const Advisory = () => {
  const services = [
    {
      icon: Lightbulb,
      title: "AI Commercialization",
      description: "Transform research breakthroughs into market-ready solutions. Strategic guidance on AI product development, GTM strategy, and scaling.",
      industries: ["AI/ML", "Robotics", "Healthcare Tech"],
    },
    {
      icon: TrendingUp,
      title: "Corporate Innovation",
      description: "Bridge the gap between emerging technology and business value. Help enterprises adopt AI and automation strategically.",
      industries: ["Manufacturing", "Industrial Tech", "Enterprise"],
    },
    {
      icon: Users,
      title: "Startup Mentoring",
      description: "Guide deep-tech startups from research to revenue. Product-market fit, fundraising strategy, and team building.",
      industries: ["Early Stage", "Deep Tech", "B2B SaaS"],
    },
    {
      icon: Cog,
      title: "Due Diligence for Investors & VCs",
      description: "Expert technical and strategic assessment of AI/robotics companies for investors, VCs, and acquirers. Deep tech evaluation with business acumen.",
      industries: ["Venture Capital", "Investment", "M&A"],
    },
  ];

  const engagements = [
    "Strategic advisory for AI commercialization",
    "Technical due diligence for VCs and investors",
    "Product strategy and roadmap development",
    "Technology stack assessment and optimization",
    "Go-to-market planning for deep tech",
    "Board advisory and stakeholder management",
  ];

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="advisory" className="section-padding">
      <div className="container px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-16">
            <div className="inline-block mb-4">
              <span className="text-primary font-medium tracking-wider uppercase text-sm">
                Advisory & Strategy
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Turn Innovation Into <span className="text-primary">Impact</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl">
              I help organizations navigate the complex journey from cutting-edge research to commercial success. 
              Whether you're a startup scaling AI products, an enterprise adopting emerging technology, or an investor evaluating deep tech opportunities,
              I bring battle-tested strategy from Sony AI and beyond.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {services.map((service, index) => (
              <div 
                key={index}
                className="group bg-card p-8 border-2 border-border hover:border-primary transition-all duration-300"
              >
                <service.icon className="w-12 h-12 text-primary mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {service.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {service.industries.map((industry, i) => (
                    <span 
                      key={i}
                      className="text-xs px-3 py-1 bg-secondary text-secondary-foreground font-medium"
                    >
                      {industry}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sample Engagements */}
          <div className="bg-secondary/50 p-8 md:p-12 border-l-4 border-primary">
            <h3 className="text-2xl font-bold mb-8">Typical Engagements</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {engagements.map((engagement, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">{engagement}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to accelerate your innovation?</h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Let's discuss how strategic guidance can help you bridge research and commercialization
            </p>
            <Button size="lg" variant="swiss" onClick={scrollToContact}>
              Schedule a Consultation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Advisory;
