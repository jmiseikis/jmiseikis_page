import { ArrowRight, Calendar, MapPin, DollarSign, Building2, Target, Bot, Calculator } from "lucide-react";
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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

            {/* Swiss VCs Card */}
            <Link
              to="/swiss-vcs"
              className="group bg-background p-8 border-2 border-border hover:border-primary transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-primary/10">
                  <DollarSign className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                    Swiss VCs and Funds
                  </h3>
                  <p className="text-muted-foreground">Directory of Swiss VCs</p>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                A comprehensive directory of venture capital firms investing in Swiss startups.
                From deep tech and biotech to fintech and climate — find the right investor for your stage and sector.
              </p>

              <div className="flex items-center gap-6 mb-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span>30+ VC Firms</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span>All Stages</span>
                </div>
              </div>

              <Button variant="swiss" className="group-hover:bg-primary/90">
                <span>Explore VCs</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            {/* RaaS ROI Calculator Card */}
            <Link
              to="/raas-calculator"
              className="group bg-background p-8 border-2 border-border hover:border-primary transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-primary/10">
                  <Calculator className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                    RaaS ROI Calculator
                  </h3>
                  <p className="text-muted-foreground">Robot-as-a-Service financial model</p>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Model the financial impact of deploying robots on a subscription model versus manual labour.
                Adjust sliders to see real-time ROI, break-even, and cumulative savings projections.
              </p>

              <div className="flex items-center gap-6 mb-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-primary" />
                  <span>Interactive Tool</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-primary" />
                  <span>Real-time Results</span>
                </div>
              </div>

              <Button variant="swiss" className="group-hover:bg-primary/90">
                <span>Try Calculator</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Resources;
