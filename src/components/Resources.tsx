import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Resources = () => {
  return (
    <section id="resources" className="section-padding bg-card">
      <div className="container px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="inline-block mb-4">
              <span className="text-primary font-medium tracking-wider uppercase text-sm">
                Stay Connected
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Useful <span className="text-primary">Resources</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Curated resources and events to keep you at the forefront of technology and innovation
            </p>
          </div>

          {/* Resource Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Tech Events Card */}
            <Link
              to="/tech-events"
              className="group bg-background p-8 border-2 border-border hover:border-primary transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-primary/10">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                    Tech Events Switzerland 2026
                  </h3>
                  <p className="text-muted-foreground">Living directory of tech conferences</p>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                A comprehensive, regularly updated list of technology conferences, summits, and meetups 
                happening across Switzerland in 2026. From AI and blockchain to robotics and startups.
              </p>

              <div className="flex items-center gap-6 mb-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>All Swiss Cantons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Full Year 2026</span>
                </div>
              </div>

              <Button variant="swiss" className="group-hover:bg-primary/90">
                <span>Explore Events</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            {/* Coming Soon Card */}
            <div className="bg-background p-8 border-2 border-border opacity-60">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-muted">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-muted-foreground">
                    More Resources
                  </h3>
                  <p className="text-muted-foreground">Coming soon</p>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Additional curated resources including funding guides, startup ecosystems, 
                research networks, and more will be added here soon.
              </p>

              <Button variant="outline" disabled>
                Coming Soon
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Resources;
