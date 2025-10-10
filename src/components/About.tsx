import { GraduationCap, Building2, Globe2, Award } from "lucide-react";

const About = () => {
  const timeline = [
    {
      period: "2024 - Present",
      role: "Strategy and Partnerships Manager",
      company: "Sony AI",
      description: "Leading research commercialization strategy for 50+ researchers across US/EU/JP. Defining project direction, securing budgets, and managing external partnerships.",
    },
    {
      period: "2021 - 2024",
      role: "Principal Technology Analyst",
      company: "Sony",
      description: "Technology strategy and analysis for Sony's AI initiatives and emerging technology opportunities.",
    },
    {
      period: "2020 - 2021",
      role: "Head of Artificial Intelligence",
      company: "F&P Robotics AG",
      description: "Led AI solutions for human-robot interaction, perception, and manipulation. Shipped production-ready SW+HW solutions.",
    },
  ];

  const credentials = [
    { 
      icon: GraduationCap, 
      title: "PhD in Robotics & Computer Vision",
      institution: "University of Oslo",
      detail: "Advanced research in robotics and AI"
    },
    { 
      icon: GraduationCap, 
      title: "Executive MBA",
      institution: "Quantic School of Business",
      detail: "Business strategy and innovation"
    },
    { 
      icon: Building2, 
      title: "Sony AI Leadership",
      institution: "Strategy & Partnerships",
      detail: "Managing 50+ researchers globally"
    },
    { 
      icon: Award, 
      title: "Multiple Patents",
      institution: "AI & Robotics Innovation",
      detail: "Patented technologies in AI and robotics"
    },
  ];

  const locations = [
    { city: "Zurich", country: "Switzerland", primary: true },
    { city: "Munich", country: "Germany", primary: false },
    { city: "Vilnius", country: "Lithuania", primary: false },
  ];

  return (
    <section id="about" className="section-padding bg-secondary/30">
      <div className="container px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-16 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Bridging Innovation <span className="text-primary">&</span> Impact
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A strategy executive with deep technical expertise in AI and robotics, 
              combining academic rigor with real-world business acumen to drive technological innovation at scale.
            </p>
          </div>

          {/* Credentials Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {credentials.map((cred, index) => (
              <div 
                key={index}
                className="bg-card p-6 border-2 border-border hover:border-primary transition-all duration-300 group"
              >
                <cred.icon className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold mb-2 text-sm">{cred.title}</h3>
                <p className="text-muted-foreground text-sm mb-1">{cred.institution}</p>
                <p className="text-xs text-muted-foreground">{cred.detail}</p>
              </div>
            ))}
          </div>

          {/* Professional Journey */}
          <div className="mb-20">
            <h3 className="text-3xl font-bold mb-12 text-center">Professional Journey</h3>
            <div className="space-y-8">
              {timeline.map((item, index) => (
                <div 
                  key={index}
                  className="border-l-4 border-primary pl-8 pb-8 relative hover:border-primary/60 transition-colors"
                >
                  <div className="absolute -left-[9px] top-0 w-4 h-4 bg-primary rounded-full"></div>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2">
                    <div>
                      <h4 className="text-xl font-bold mb-1">{item.role}</h4>
                      <p className="text-primary font-medium">{item.company}</p>
                    </div>
                    <span className="text-sm text-muted-foreground font-medium mt-2 md:mt-0">
                      {item.period}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-3">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Global Presence */}
          <div className="bg-card p-8 md:p-12 border-2 border-border">
            <div className="flex items-center gap-3 mb-8">
              <Globe2 className="w-8 h-8 text-primary" />
              <h3 className="text-2xl font-bold">Global Presence</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {locations.map((loc, index) => (
                <div 
                  key={index}
                  className={`p-6 border-2 ${
                    loc.primary 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border'
                  }`}
                >
                  <div className="text-2xl font-bold mb-1">{loc.city}</div>
                  <div className="text-muted-foreground">{loc.country}</div>
                  {loc.primary && (
                    <div className="mt-3 text-sm text-primary font-medium">Primary Base</div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-muted-foreground mt-8 text-center">
              Available for consulting, advisory work, and speaking engagements across DACH region and Baltic states
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
