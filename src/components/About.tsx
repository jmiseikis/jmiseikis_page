import { GraduationCap, Building2, Globe2, Award } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect } from "react";
import tuGrazLogo from "@/assets/logos/tu-graz.png";
import osloUniLogo from "@/assets/logos/oslo-uni.png";
import csiroLogo from "@/assets/logos/csiro.png";
import hpLogo from "@/assets/logos/hp.png";
import emtLogo from "@/assets/logos/emt.png";
import melgaLogo from "@/assets/logos/melga.png";
import yourehabLogo from "@/assets/logos/yourehab.png";
import ethZurichLogo from "@/assets/logos/eth-zurich.png";
import uioOsloLogo from "@/assets/logos/uio-oslo.png";
import fpRoboticsLogo from "@/assets/logos/fp-robotics.png";
import hocomaLogo from "@/assets/logos/hocoma.png";
import veltruLogo from "@/assets/logos/veltru.png";
import sonyLogo from "@/assets/logos/sony.png";
import sonyAiLogo from "@/assets/logos/sony-ai.png";
import sonyResearchLogo from "@/assets/logos/sony-research.png";
import universityReadingLogo from "@/assets/logos/university-reading.png";
import pixeviaLogo from "@/assets/logos/pixevia.png";

const About = () => {
  const timeline = [
    {
      period: "2024 - Present",
      role: "Strategy and Partnerships Manager",
      company: "Sony AI",
      description: "Leading research commercialization strategy. Responsible for 4 amazing R&D teams. Defining project direction, securing budgets, and managing external partnerships.",
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
      title: "Sony AI",
      institution: "Strategy & Partnerships",
      detail: "Responsible for 4 amazing R&D teams"
    },
    { 
      icon: Award, 
      title: "Multiple Patents",
      institution: "AI & Robotics Innovation",
      detail: "Patented technologies in AI and robotics"
    },
  ];

  const countries = [
    { name: "Lithuania", flag: "🇱🇹" },
    { name: "United Kingdom", flag: "🇬🇧" },
    { name: "Switzerland", flag: "🇨🇭" },
    { name: "Australia", flag: "🇦🇺" },
    { name: "Norway", flag: "🇳🇴" },
    { name: "Austria", flag: "🇦🇹" },
    { name: "Spain", flag: "🇪🇸" },
    { name: "Germany", flag: "🇩🇪" },
  ];

  const organizations = [
    { name: "University of Reading", logo: universityReadingLogo },
    { name: "ETH Zurich", logo: ethZurichLogo },
    { name: "TU Graz", logo: tuGrazLogo },
    { name: "University of Oslo", logo: uioOsloLogo },
    { name: "CSIRO", logo: csiroLogo },
    { name: "Hewlett-Packard", logo: hpLogo },
    { name: "EMT", logo: emtLogo },
    { name: "Melga", logo: melgaLogo },
    { name: "Hocoma", logo: hocomaLogo },
    { name: "YouRehab", logo: yourehabLogo },
    { name: "VELTRU AG", logo: veltruLogo },
    { name: "Pixevia", logo: pixeviaLogo },
    { name: "F&P Robotics", logo: fpRoboticsLogo },
    { name: "Sony", logo: sonyLogo },
    { name: "Sony AI", logo: sonyAiLogo },
    { name: "Sony Research", logo: sonyResearchLogo },
  ];

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    dragFree: true,
  });

  useEffect(() => {
    if (!emblaApi) return;

    const autoScroll = setInterval(() => {
      emblaApi.scrollNext();
    }, 3000);

    return () => clearInterval(autoScroll);
  }, [emblaApi]);

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

          {/* Global Experience */}
          <div className="bg-card p-8 md:p-12 border-2 border-border mb-12">
            <div className="flex items-center gap-3 mb-8">
              <Globe2 className="w-8 h-8 text-primary" />
              <h3 className="text-2xl font-bold">Global Experience</h3>
            </div>
            <p className="text-muted-foreground mb-6 text-center">
              Lived, studied, and worked across 8 countries
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {countries.map((country, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 px-4 py-3 border-2 border-border hover:border-primary transition-all"
                >
                  <span className="text-3xl">{country.flag}</span>
                  <span className="font-medium">{country.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Organizations */}
          <div className="bg-card p-8 md:p-12 border-2 border-border">
            <h3 className="text-2xl font-bold mb-8 text-center">Professional Journey</h3>
            <p className="text-muted-foreground mb-8 text-center">
              Research, Innovation & Leadership Roles
            </p>
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-8">
                {[...organizations, ...organizations].map((org, index) => (
                  <div 
                    key={index}
                    className="flex-[0_0_300px] flex items-center justify-center p-6 border-2 border-border hover:border-primary transition-all min-h-[120px]"
                  >
                    {org.logo ? (
                      <img 
                        src={org.logo} 
                        alt={org.name}
                        className="max-w-full max-h-[80px] object-contain"
                      />
                    ) : (
                      <span className="text-center font-medium text-sm">{org.name}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
