import { Button } from "@/components/ui/button";
import { ArrowRight, Lightbulb, Mic, TrendingUp, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const De = () => {
  return (
    <>
      <Helmet>
        <html lang="de" />
        <title>Dr. Justinas Mišeikis – KI-Strategieberater, Keynote Speaker & Robotik-Experte | Zürich, DACH</title>
        <meta name="description" content="KI-Strategieberater und Keynote Speaker in Zürich. Beratung für Unternehmen, Startups und Investoren in den Bereichen KI-Kommerzialisierung, Robotik, Computer Vision und Due Diligence in der DACH-Region und Europa." />
        <meta name="keywords" content="KI Berater Zürich, KI Strategieberatung DACH, Robotik Berater Schweiz, KI Keynote Speaker Deutschland, Computer Vision Experte, Deep Tech Due Diligence, Forschung Kommerzialisierung, KI Beratung Österreich, Startup Beratung KI, Innovationsberatung" />
        <link rel="canonical" href="https://jmiseikis.lovable.app/de" />
        <link rel="alternate" hrefLang="en" href="https://jmiseikis.lovable.app/" />
        <link rel="alternate" hrefLang="de" href="https://jmiseikis.lovable.app/de" />
        <meta property="og:title" content="Dr. Justinas Mišeikis – KI-Strategieberater & Keynote Speaker | DACH" />
        <meta property="og:description" content="KI-Strategieberater für Unternehmen, Startups und Investoren. Beratung, Due Diligence und Keynotes in Zürich und der DACH-Region." />
        <meta property="og:locale" content="de_CH" />
        <meta property="og:image" content="https://jmiseikis.lovable.app/og-image.png" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-20">
              <Link to="/" className="text-xl font-bold tracking-tight hover:text-primary transition-colors">
                Dr. Justinas Mišeikis
              </Link>
              <div className="flex items-center gap-4">
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  English
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <span className="text-primary font-medium tracking-wider uppercase text-sm">
              KI-Strategieberater • Keynote Speaker • Robotik-Experte
            </span>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mt-4 mb-6">
              KI-Strategie &{" "}
              <span className="text-primary">Innovation</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mb-8">
              Strategieberater an der Schnittstelle von KI-Forschung und kommerzieller Umsetzung.
              Keynote Speaker, Berater und Due-Diligence-Experte für Investoren und VCs im Bereich Deep Tech.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/#contact">
                <Button size="lg" variant="swiss" className="group">
                  Kontakt aufnehmen
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-20 bg-secondary/30 px-4">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-4xl font-bold mb-12">
              Dienstleistungen
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: Lightbulb,
                  title: "KI-Kommerzialisierung",
                  description: "Strategische Beratung zur Umsetzung von KI-Forschung in marktreife Produkte und Lösungen.",
                  link: "/advisory",
                },
                {
                  icon: TrendingUp,
                  title: "Unternehmensberatung & Innovation",
                  description: "Unterstützung bei der strategischen Einführung von KI und Automatisierung in Unternehmen.",
                  link: "/advisory",
                },
                {
                  icon: Mic,
                  title: "Keynote Speaking",
                  description: "Vorträge und Keynotes zu KI, Robotik, Computer Vision und Innovationsstrategie auf Konferenzen und Firmenevents.",
                  link: "/speaking",
                },
                {
                  icon: Shield,
                  title: "Due Diligence für Investoren",
                  description: "Technische und strategische Bewertung von KI- und Robotik-Unternehmen für VCs, Investoren und Käufer.",
                  link: "/due-diligence",
                },
              ].map((service, index) => (
                <Link key={index} to={service.link}>
                  <div className="bg-card p-8 border-2 border-border hover:border-primary transition-all duration-300 group h-full">
                    <service.icon className="w-12 h-12 text-primary mb-6 group-hover:scale-110 transition-transform" />
                    <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Background */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-4xl font-bold mb-8">Hintergrund</h2>
            <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
              <p>
                Dr. Justinas Mišeikis ist Strategy and Partnerships Manager bei Sony AI in Zürich.
                Er leitet die Forschungskommerzialisierung für 4 F&E-Teams und verbindet dabei
                akademische Forschung mit geschäftlicher Wertschöpfung.
              </p>
              <p>
                Mit einem PhD in Robotik und Computer Vision (Universität Oslo) und einem Executive MBA
                (Quantic School of Business) bringt er eine einzigartige Kombination aus technischer
                Tiefe und strategischem Geschäftssinn mit. Er verfügt über 15+ Publikationen,
                600+ Zitierungen und 40+ Patente im Bereich KI und Robotik.
              </p>
              <p>
                Verfügbar für Beratung, Keynotes und Due Diligence in der gesamten DACH-Region und Europa.
              </p>
            </div>
            <div className="mt-8">
              <Link to="/#contact">
                <Button size="lg" variant="swiss">
                  Kontakt aufnehmen
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-border px-4">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Dr. Justinas Mišeikis. Zürich, Schweiz.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default De;
