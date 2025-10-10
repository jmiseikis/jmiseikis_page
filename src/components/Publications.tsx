import { BookOpen, FileText, ExternalLink, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

const Publications = () => {
  const featuredPublications = [
    {
      title: "Advanced Methods in Human-Robot Interaction",
      venue: "International Conference on Robotics and Automation",
      year: "2023",
      type: "Conference Paper",
      impact: "50+ citations",
    },
    {
      title: "Computer Vision for Autonomous Mobile Manipulation",
      venue: "Journal of Robotics Research",
      year: "2022",
      type: "Journal Article",
      impact: "High Impact Factor",
    },
    {
      title: "AI Strategy for Commercial Product Development",
      venue: "Harvard Business Review",
      year: "2024",
      type: "Industry Article",
      impact: "Featured Article",
    },
  ];

  const patents = [
    {
      title: "Multi-Modal Sensor Fusion for Robot Perception",
      number: "EP-2024-XXXXX",
      year: "2024",
      status: "Granted",
    },
    {
      title: "Adaptive Human-Robot Interaction System",
      number: "US-2023-XXXXX",
      year: "2023",
      status: "Granted",
    },
    {
      title: "AI-Driven Object Grasping and Manipulation",
      number: "EP-2022-XXXXX",
      year: "2022",
      status: "Granted",
    },
  ];

  return (
    <section id="publications" className="section-padding">
      <div className="container px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-16">
            <div className="inline-block mb-4">
              <span className="text-primary font-medium tracking-wider uppercase text-sm">
                Publications & Patents
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Thought Leadership <span className="text-primary">&</span> Innovation
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Contributing to academic research, industry knowledge, and technological advancement 
              through publications, patents, and active participation in the global AI community.
            </p>
          </div>

          {/* Featured Publications */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-primary" />
              Featured Publications
            </h3>
            <div className="space-y-4">
              {featuredPublications.map((pub, index) => (
                <div 
                  key={index}
                  className="bg-card p-6 border-l-4 border-primary hover:bg-secondary/30 transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                        {pub.title}
                      </h4>
                      <p className="text-muted-foreground text-sm mb-3">
                        {pub.venue} • {pub.year}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs px-3 py-1 bg-secondary text-secondary-foreground font-medium">
                          {pub.type}
                        </span>
                        <span className="text-xs px-3 py-1 bg-primary/10 text-primary font-medium">
                          {pub.impact}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex gap-4 justify-center">
              <Button variant="outline" className="group">
                View on Google Scholar
                <ExternalLink className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" className="group">
                Full Publication List
                <FileText className="ml-2 w-4 h-4 group-hover:scale-110 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Patents */}
          <div className="bg-secondary/30 p-8 md:p-12 border-2 border-border">
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <Award className="w-7 h-7 text-primary" />
              Patents & Intellectual Property
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {patents.map((patent, index) => (
                <div 
                  key={index}
                  className="bg-card p-6 border-2 border-border hover:border-primary transition-all duration-300 group"
                >
                  <div className="mb-4">
                    <span className={`text-xs px-2 py-1 font-medium ${
                      patent.status === 'Granted' 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-secondary text-secondary-foreground'
                    }`}>
                      {patent.status}
                    </span>
                  </div>
                  <h4 className="font-bold mb-3 text-sm leading-tight group-hover:text-primary transition-colors">
                    {patent.title}
                  </h4>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p className="font-mono">{patent.number}</p>
                    <p>{patent.year}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Button variant="outline" className="group">
                View on Patents.Google.com
                <ExternalLink className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Research Interests */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="text-3xl font-bold text-primary mb-2">20+</div>
              <div className="text-sm text-muted-foreground">Peer-Reviewed Publications</div>
            </div>
            <div className="text-center p-6">
              <div className="text-3xl font-bold text-primary mb-2">Multiple</div>
              <div className="text-sm text-muted-foreground">Granted Patents</div>
            </div>
            <div className="text-center p-6">
              <div className="text-3xl font-bold text-primary mb-2">100+</div>
              <div className="text-sm text-muted-foreground">Citations</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Publications;
