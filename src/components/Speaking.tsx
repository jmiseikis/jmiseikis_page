import { Mic, Video, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const Speaking = () => {
  const topics = [
    {
      title: "AI Commercialization & Ethics",
      description: "From research lab to market leadership: strategies for turning AI breakthroughs into business value while addressing ethical considerations",
      audiences: ["Tech Conferences", "Corporate Events", "Startup Forums"],
    },
    {
      title: "Future of Human-Robot Interaction",
      description: "How robots are becoming collaborative partners across industries, from healthcare to manufacturing",
      audiences: ["Industry Events", "Academic Conferences", "Innovation Summits"],
    },
    {
      title: "Investment & Due Diligence in Deep Tech",
      description: "Evaluating AI and robotics ventures: what investors need to know beyond the hype",
      audiences: ["VC Forums", "Investment Conferences", "Corporate Investors"],
    },
    {
      title: "Building Deep Tech Teams",
      description: "Attracting, retaining, and leading world-class researchers and engineers in competitive markets",
      audiences: ["Leadership Forums", "Tech Companies", "Academic Institutions"],
    },
    {
      title: "Strategy for Innovation Leaders",
      description: "Balancing cutting-edge research with commercial realities: lessons from Sony AI and beyond",
      audiences: ["Executive Events", "MBA Programs", "Corporate Strategy"],
    },
  ];

  const pastEvents = [
    "LOGIN Conference (biggest tech event in Baltics)",
    "Innovation Roundtable",
    "ETH Zürich & ETH Entrepreneurship Club",
  ];

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="speaking" className="section-padding bg-secondary/30">
      <div className="container px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-16">
            <div className="inline-block mb-4">
              <span className="text-primary font-medium tracking-wider uppercase text-sm">
                Speaking & Media
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Insights That <span className="text-primary">Inspire Action</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Drawing from hands-on experience at Sony AI, F&P Robotics, and academic research, 
              I deliver keynotes and panel discussions that bridge technical depth with strategic clarity.
            </p>
          </div>

          {/* Speaking Topics */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-8">Keynote Topics</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {topics.map((topic, index) => (
                <div 
                  key={index}
                  className={`bg-card p-6 border-2 border-border hover:border-primary transition-all duration-300 group ${index === topics.length - 1 ? 'md:col-span-2 md:max-w-xl md:mx-auto' : ''}`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <Mic className="w-6 h-6 text-primary flex-shrink-0 mt-1 group-hover:scale-110 transition-transform" />
                    <div>
                      <h4 className="text-lg font-bold mb-2">{topic.title}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {topic.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-10">
                    {topic.audiences.map((audience, i) => (
                      <span 
                        key={i}
                        className="text-xs px-2 py-1 bg-secondary text-secondary-foreground"
                      >
                        {audience}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Past Events */}
          <div className="mb-16">
            <div className="bg-card p-8 border-2 border-border">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Video className="w-6 h-6 text-primary" />
                Past Speaking Engagements
              </h3>
              <div className="space-y-3">
                {pastEvents.map((event, index) => (
                  <div key={index} className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span>{event}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-primary text-primary-foreground p-8 md:p-12 text-center">
            <h3 className="text-3xl font-bold mb-4">
              Looking for a speaker who bridges tech and business?
            </h3>
            <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto text-lg">
              Available for keynotes, panels, workshops, and corporate events across Europe
            </p>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={scrollToContact}
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              Check Availability
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Speaking;
