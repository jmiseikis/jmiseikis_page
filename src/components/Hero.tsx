import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Mail } from "lucide-react";
import heroBackground from "@/assets/hero-bg.jpg";
import profileImage from "@/assets/profile.jpg";

const Hero = () => {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="absolute inset-0 bg-background/95"></div>
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="inline-block">
                <span className="text-primary font-medium tracking-wider uppercase text-sm">
                  Technology Expert • Innovation Advisor
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                Dr. Justinas
                <br />
                <span className="text-primary">Mišeikis</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-xl">
                Strategy executive bridging advanced AI research and commercial strategy. 
                From startups to Sony AI, turning breakthrough technology into measurable business impact.
              </p>
            </div>

            {/* Key Facts */}
            <div className="grid grid-cols-3 gap-6 py-6 border-y border-border">
              <div>
                <div className="text-3xl font-bold text-primary">PhD</div>
                <div className="text-sm text-muted-foreground">Robotics & CV</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">EMBA</div>
                <div className="text-sm text-muted-foreground">Business Strategy</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">Sony AI</div>
                <div className="text-sm text-muted-foreground">Current Role</div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                variant="swiss"
                onClick={() => scrollToSection('contact')}
                className="group"
              >
                Let's talk
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Location */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span>Based in Zurich, Switzerland</span>
              </div>
              <span>•</span>
              <span>Active across DACH & Baltics</span>
            </div>
          </div>

          {/* Image */}
          <div className="relative animate-fade-in-delay">
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-full h-full border-2 border-primary/20"></div>
              <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-primary/20"></div>
              
              {/* Image */}
              <div className="relative w-full h-full overflow-hidden">
                <img 
                  src={profileImage} 
                  alt="Dr. Justinas Mišeikis"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ArrowRight className="w-6 h-6 text-muted-foreground rotate-90" />
      </div>
    </section>
  );
};

export default Hero;
