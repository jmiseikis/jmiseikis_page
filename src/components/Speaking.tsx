import { Mic, Video, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Speaking = () => {
  const topics = [
    {
      title: "Startup and Corporation Collaboration",
      description: "What are the pitfalls, and how to avoid them? Practical lessons on partnerships, pilots, and joint value creation",
      audiences: ["Corporate Innovation", "Startup Forums", "Open Innovation"],
    },
    {
      title: "AI Commercialization & Ethics",
      description: "From research lab to market leadership: strategies for turning AI breakthroughs into business value while addressing ethical considerations",
      audiences: ["Tech Conferences", "Corporate Events", "Startup Forums"],
    },
    {
      title: "Scaling AI from Pilots to Real Business Impact",
      description: "How to move beyond proof-of-concepts and embed AI into core operations to deliver measurable ROI",
      audiences: ["Enterprise Leadership", "Digital Transformation", "C-Suite Forums"],
    },
    {
      title: "Physical AI and Robotics",
      description: "The next wave of innovation: how embodied AI and robotics are reshaping industries from manufacturing to healthcare",
      audiences: ["Industry Events", "Robotics Summits", "Innovation Forums"],
    },
    {
      title: "Strategic Use of AI for Sustainable Value Creation",
      description: "Long-term AI strategy that aligns business goals with sustainability, governance, and stakeholder value",
      audiences: ["Executive Events", "ESG Forums", "Strategy Conferences"],
    },
    {
      title: "Bringing Research to Commercialization",
      description: "Balancing cutting-edge research with commercial realities: lessons from Sony AI and beyond",
      audiences: ["Executive Events", "MBA Programs", "Corporate Strategy"],
    },
    {
      title: "Investment & Due Diligence in Deep Tech",
      description: "Evaluating AI and robotics ventures: what investors need to know beyond the hype",
      audiences: ["VC Forums", "Investment Conferences", "Corporate Investors"],
    },
    {
      title: "Future of Human-Robot Interaction",
      description: "How robots are becoming collaborative partners across industries, from healthcare to manufacturing",
      audiences: ["Industry Events", "Academic Conferences", "Innovation Summits"],
    },
  ];

  const pastEvents = [
    "Wisdom House @ Davos 2026 (during WEF)",
    "GenAI Zürich",
    "LOGIN Conference (biggest tech event in Baltics)",
    "Innovation Roundtable",
    "ETH Zürich & ETH Entrepreneurship Club",
    "Sony AI Conference",
    "VentureLab Engineering Ecosystem Event",
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
              Shared insights in consulting, advisory services and gave public speeches and keynotes on the following topics
            </p>
          </div>

          {/* Speaking Topics */}
          <div className="mb-16">
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
              <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <Video className="w-6 h-6 text-primary" />
                  Past Speaking Engagements
                </h3>
                <Button asChild variant="outline" size="sm">
                  <Link to="/speaking">
                    Watch Speaking Examples
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
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
              Contact Me
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Speaking;
