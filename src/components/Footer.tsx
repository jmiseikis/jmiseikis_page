import { Linkedin, ExternalLink } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    sections: [
      {
        title: "Quick Links",
        links: [
          { label: "About", href: "#about" },
          { label: "Advisory", href: "#advisory" },
          { label: "Speaking", href: "#speaking" },
          { label: "Publications", href: "#publications" },
        ],
      },
      {
        title: "Resources",
        links: [
          { label: "Google Scholar", href: "https://scholar.google.com/citations?user=KeZ1-AwAAAAJ", external: true },
          { label: "Patents", href: "https://patents.google.com/?inventor=justinas+miseikis,justinas+mi%C5%A1eikis", external: true },
        ],
      },
    ],
  };

  const scrollToSection = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">Dr. Justinas Mišeikis</h3>
            <p className="text-background/70 mb-6 leading-relaxed">
              Technology expert and innovation advisor specializing in AI commercialization, 
              robotics, and corporate strategy. Based in Zurich, active across DACH and Baltics.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.linkedin.com/in/justinasmiseikis/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-background/10 hover:bg-primary transition-colors group"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* Links Sections */}
          {footerLinks.sections.map((section, index) => (
            <div key={index}>
              <h4 className="font-bold mb-4 text-lg">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {link.external ? (
                      <a
                        href={link.href}
                        className="text-background/70 hover:text-primary transition-colors inline-flex items-center gap-2 group"
                      >
                        {link.label}
                        <ExternalLink className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </a>
                    ) : (
                      <button
                        onClick={() => scrollToSection(link.href)}
                        className="text-background/70 hover:text-primary transition-colors text-left"
                      >
                        {link.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-background/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/60 text-sm">
              © {currentYear} Dr. Justinas Mišeikis. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <button className="text-background/60 hover:text-primary transition-colors">
                Privacy Policy
              </button>
              <button className="text-background/60 hover:text-primary transition-colors">
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
