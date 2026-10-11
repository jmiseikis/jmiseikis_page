// Integration reference for the existing Lovable project. Inspect and adapt imports.
// Place advisory-content.ts beside this file or update the import path.
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getOgImageUrl } from "@/lib/ogImage";
import { advisoryContent as content } from "./advisory-content";

const canonicalUrl = "https://jmiseikis.com/advisory";
const pageTitle = "AI & Robotics Advisory in Switzerland | Dr. Justinas Mišeikis";
const pageDescription = "Market entry, Swiss partnerships, startup scouting and technical diligence for investors, plus internal AI workflow advisory.";
const contactPath = (intent: string) => `/?enquiry=${encodeURIComponent(intent)}#contact`;

export default function Advisory() {
  const ogImage = getOgImageUrl({ title: "AI & Robotics Advisory", subtitle: "DR. JUSTINAS MIŠEIKIS | SWITZERLAND" });
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Person", "@id": "https://jmiseikis.com/#person", name: content.name, url: "https://jmiseikis.com/" },
      { "@type": "WebPage", "@id": `${canonicalUrl}#webpage`, name: pageTitle, description: pageDescription, url: canonicalUrl, author: { "@id": "https://jmiseikis.com/#person" } },
      ...content.services.map(service => ({
        "@type": "Service", "@id": `${canonicalUrl}#${service.id}`, name: service.title,
        serviceType: service.title, description: service.description,
        provider: { "@id": "https://jmiseikis.com/#person" }, url: `${canonicalUrl}#${service.id}`,
      })),
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:alt" content="AI and Robotics Advisory | Dr. Justinas Mišeikis" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json">{JSON.stringify(structuredData).replace(/</g, "\\u003c")}</script>
      </Helmet>
      <Navigation />
      <main id="main-content" className="flex-1 pt-24">
        <section className="container mx-auto max-w-6xl px-5 md:px-8 py-10 md:py-16 border-b border-border">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-5">Advisory | Swiss ecosystem | International clients</p>
          <h1 className="max-w-4xl text-4xl md:text-6xl font-bold tracking-tight leading-tight">{content.headline}</h1>
          <p className="max-w-3xl text-lg md:text-xl text-muted-foreground leading-relaxed mt-6">{content.intro}</p>
          <Button asChild size="lg" className="mt-7 rounded-none">
            <Link to={contactPath("advisory")}>Discuss an engagement <ArrowRight aria-hidden="true" className="ml-3 h-4 w-4" /></Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-5">Based in Switzerland. Working internationally in English.</p>
        </section>

        <section aria-labelledby="services-heading" className="container mx-auto max-w-6xl px-5 md:px-8 py-12 md:py-20">
          <h2 id="services-heading" className="text-3xl md:text-4xl font-bold tracking-tight mb-8">Focused support for the decisions ahead.</h2>
          {content.services.map(service => (
            <article key={service.id} id={service.id} className="scroll-mt-28 border-t border-border py-7 md:py-9 grid grid-cols-[1.5rem_1fr] md:grid-cols-[2rem_1fr_1.4fr] gap-4 md:gap-8">
              <span aria-hidden="true" className="text-sm font-semibold text-primary">{service.number}</span>
              <div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">{service.title}</h3>
                <p className="text-sm text-muted-foreground mt-3">{service.audience}</p>
              </div>
              <div className="col-start-2 md:col-start-auto">
                <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                <ul className="mt-4 space-y-2 list-disc pl-5 text-muted-foreground">
                  {service.outputs.map(output => <li key={output}>{output}</li>)}
                </ul>
                <Link to={contactPath(service.id)} className="inline-flex items-center text-sm font-semibold mt-5 underline underline-offset-4 decoration-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4">
                  {service.cta} <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </section>

        <section aria-labelledby="formats-heading" className="bg-muted/50 py-12 md:py-20">
          <div className="container mx-auto max-w-6xl px-5 md:px-8">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-4">Engagement formats</p>
            <h2 id="formats-heading" className="text-3xl md:text-4xl font-bold tracking-tight">A format that fits the work.</h2>
            <div className="grid md:grid-cols-3 gap-8 md:gap-12 mt-8">
              {content.engagements.map(format => (
                <article key={format.title} className="border-t-2 border-primary pt-5">
                  <h3 className="text-xl font-bold tracking-tight">{format.title}</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{format.description}</p>
                </article>
              ))}
            </div>
            <p className="mt-8 text-muted-foreground">{content.pricingNote}</p>
            <p className="mt-4 max-w-4xl text-sm text-muted-foreground">{content.eventScope}</p>
          </div>
        </section>

        <section aria-labelledby="process-heading" className="container mx-auto max-w-6xl px-5 md:px-8 py-12 md:py-20">
          <h2 id="process-heading" className="text-3xl md:text-4xl font-bold tracking-tight">From a clear question to a practical next step.</h2>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12 mt-8">
            {content.process.map((step, index) => (
              <article key={step.title}>
                <p className="text-sm text-primary font-semibold mb-3">0{index + 1}</p>
                <h3 className="text-xl font-bold tracking-tight">{step.title}</h3>
                <p className="text-muted-foreground mt-3 leading-relaxed">{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-border bg-muted/30 py-12 md:py-16">
          <div className="container mx-auto max-w-6xl px-5 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-7">
            <div><h2 className="text-3xl font-bold tracking-tight">What decision are you working towards?</h2><p className="text-muted-foreground mt-3">Share your objectives and timing through the contact form.</p></div>
            <Button asChild size="lg" className="rounded-none shrink-0"><Link to={contactPath("advisory")}>Discuss a project <ArrowRight aria-hidden="true" className="ml-3 h-4 w-4" /></Link></Button>
          </div>
          <p className="container mx-auto max-w-6xl px-5 md:px-8 mt-8 text-xs text-muted-foreground">{content.independentNote}</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
