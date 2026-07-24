import { ArrowRight, Calendar, MapPin, DollarSign, Building2, Target, Bot, Calculator, ExternalLink, Cpu, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import swisscomVenturesLogo from "@/assets/swisscom-ventures.png";
import gzaLogo from "@/assets/gza-logo.png";
import rockstarLogo from "@/assets/rockstar-recruiting.jpg.asset.json";

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
            {/* Swiss Tech Pulse Card */}
            <Link
              to="/resources/swiss-tech-pulse"
              className="group bg-background p-8 border-2 border-border hover:border-primary transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-primary/10">
                  <Activity className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                    Swiss Tech Pulse
                  </h3>
                  <p className="text-muted-foreground">Live Swiss startup signal feed</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Foundings, spin-offs, funding rounds, exits and new VC funds across Switzerland — aggregated
                from official registries and leading editorial sources, updated automatically.
              </p>
              <div className="flex items-center gap-6 mb-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <span>Live feed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Weekly digest</span>
                </div>
              </div>
              <Button variant="swiss" className="group-hover:bg-primary/90">
                <span>Open feed</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

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
                From deep tech and biotech to fintech and climate - find the right investor for your stage and sector.
              </p>

              <div className="flex items-center gap-6 mb-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span>66+ VC Firms</span>
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

            {/* Swiss Robotics Startups Card */}
            <a
              href="https://www.swissroboticsstartups.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-background p-8 border-2 border-border hover:border-primary transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-primary/10">
                  <Bot className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                    Swiss Robotics Startups
                  </h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>Curated by</span>
                    <img src={swisscomVenturesLogo} alt="Swisscom Ventures" className="h-5 inline-block" />
                  </div>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Discover the vibrant ecosystem of robotics innovators shaping the future of Switzerland.
                A comprehensive directory of 100+ robotics startups across automation, AI, and advanced manufacturing - curated in partnership with Swisscom Ventures.
              </p>

              <div className="flex items-center gap-6 mb-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-primary" />
                  <span>100+ Startups</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Switzerland</span>
                </div>
              </div>

              <Button variant="swiss" className="group-hover:bg-primary/90">
                <span>Explore Startups</span>
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>

            {/* GZA Robotics Card */}
            <Link
              to="/gza-robotics"
              className="group bg-background p-8 border-2 border-border hover:border-primary transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-primary/10">
                  <Cpu className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                    Robotics in the Greater Zurich Area
                  </h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>Curated by</span>
                    <img src={gzaLogo} alt="Greater Zurich Area" className="h-5 inline-block" />
                  </div>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Discover 150+ robotics companies, research labs, and autonomous systems innovators 
                in one of the world's most dynamic innovation ecosystems - curated in partnership with Greater Zurich Area.
              </p>

              <div className="flex items-center gap-6 mb-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span>150+ Companies</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Greater Zurich Area</span>
                </div>
              </div>

              <Button variant="swiss" className="group-hover:bg-primary/90">
                <span>Explore Directory</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            {/* Swiss Hack Events Card */}
            <a
              href="https://www.hackevents.net/ch"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-background p-8 border-2 border-border hover:border-primary transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-primary/10">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                    Swiss Hack Events
                  </h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>Curated by</span>
                    <img src={rockstarLogo.url} alt="Rockstar Recruiting" className="h-5 inline-block" />
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground mb-6 leading-relaxed">
                Every relevant tech event in Switzerland. Found, ranked and kept live from one prompt.
                Connect with like-minded hackers, founders, innovators, managers, and investors.
              </p>

              <div className="flex items-center gap-6 mb-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Live Directory</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Switzerland</span>
                </div>
              </div>

              <Button variant="swiss" className="group-hover:bg-primary/90">
                <span>Explore Hack Events</span>
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Resources;
