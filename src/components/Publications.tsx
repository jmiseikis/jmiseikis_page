import { BookOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const Publications = () => {
  const featuredPublications = [
    {
      title: "Lio-a personal robot assistant for human-robot interaction and care applications",
      venue: "IEEE Robotics and Automation Letters",
      year: "2020",
      type: "Journal Article",
      link: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=KeZ1-AwAAAAJ&citation_for_view=KeZ1-AwAAAAJ:WF5omc3nYNoC",
    },
    {
      title: "3D vision guided robotic charging station for electric and plug-in hybrid vehicles",
      venue: "arXiv preprint arXiv:1703.05381",
      year: "2017",
      type: "Preprint",
      link: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=KeZ1-AwAAAAJ&citation_for_view=KeZ1-AwAAAAJ:IjCSPb-OGe4C",
    },
    {
      title: "Automatic calibration of a robot manipulator and multi 3d camera system",
      venue: "IEEE/SICE International Symposium on System Integration",
      year: "2016",
      type: "Conference Paper",
      link: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=KeZ1-AwAAAAJ&citation_for_view=KeZ1-AwAAAAJ:qjMakFHDy7sC",
    },
  ];

  return (
    <section id="publications" className="section-padding bg-secondary/30">
      <div className="container px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-16">
            <div className="inline-block mb-4">
              <span className="text-primary font-medium tracking-wider uppercase text-sm">
                Research & Innovation
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Featured <span className="text-primary">Publications</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Bridging academic research with commercial innovation across robotics, AI, and human-robot interaction
            </p>
          </div>

          {/* Featured Publications */}
          <div className="mb-16">
            <div className="space-y-6">
              {featuredPublications.map((pub, index) => (
                <a
                  href={pub.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={index}
                  className="block bg-card p-6 border-2 border-border hover:border-primary transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                        {pub.title}
                      </h4>
                      <p className="text-muted-foreground text-sm mb-2">
                        {pub.venue} • {pub.year}
                      </p>
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary">
                        {pub.type}
                      </span>
                    </div>
                    <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* External Links & Stats */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card p-8 border-2 border-border">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold">Additional Resources</h3>
              </div>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-between group" asChild>
                  <a href="https://scholar.google.com/citations?user=KeZ1-AwAAAAJ" target="_blank" rel="noopener noreferrer">
                    <span>View on Google Scholar</span>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-between group" asChild>
                  <a href="https://scholar.google.com/citations?user=KeZ1-AwAAAAJ" target="_blank" rel="noopener noreferrer">
                    <span>Full Publication List</span>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="bg-card p-8 border-2 border-border">
              <div className="space-y-6">
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">15+</div>
                  <p className="text-muted-foreground">Peer-reviewed Publications</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">600+</div>
                  <p className="text-muted-foreground">Citations</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">40+</div>
                  <p className="text-muted-foreground">Patents</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Publications;
