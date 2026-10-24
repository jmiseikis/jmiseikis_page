import { Helmet } from "react-helmet-async";
import PageMeta from "@/components/site/PageMeta";
import { Actions, ButtonLink, Eyebrow, Note, PageHero, RuleBlock, SectionHead, SmartLink, TextLink } from "@/components/site/primitives";
import { PATENTS_URL, SCHOLAR_URL, TECHDRIVE_URL, contactPath } from "@/lib/site";

// German summary of the same offering as /advisory. Delivery is in English, as stated on the page.
const SERVICES = [
  {
    title: "Markteintritt & Partnerschaften in der Schweiz",
    text: "Zielmärkte bewerten, die Positionierung schärfen und passende Schweizer Partner identifizieren. Auch für Schweizer Startups auf dem Weg in neue Märkte.",
  },
  {
    title: "Startup-Scouting & technische Due Diligence",
    text: "Für VCs und Corporate Investors: Schweizer KI- und Robotik-Startups finden und die technische Substanz von der Frühphase bis zum Scale-up prüfen.",
  },
  {
    title: "KI für interne Daten & Prozesse",
    text: "Sinnvolle interne KI-Anwendungen identifizieren, Daten und Abläufe erfassen und ein Pilotprojekt mit messbaren Kriterien definieren.",
  },
  {
    title: "Keynotes & Workshops",
    text: "Perspektiven zu physischer KI, Innovation und der Kommerzialisierung von Forschung.",
  },
];

const ENGLISH_PAGES = [
  { label: "Advisory (Englisch)", href: "/advisory" },
  { label: "Due Diligence (Englisch)", href: "/due-diligence" },
  { label: "Speaking (Englisch)", href: "/speaking" },
  { label: "Publikationen (Englisch)", href: "/publications" },
  { label: "Ressourcen (Englisch)", href: "/resources" },
];

const inlineLink = "font-semibold text-foreground underline underline-offset-4 hover:text-primary";

const De = () => (
  <>
    <PageMeta
      path="/de"
      title="KI- und Robotikstrategie | Dr. Justinas Mišeikis"
      description="KI- und Robotikberatung, Technologie-Scouting und Keynotes. Sitz in Zürich, internationale Zusammenarbeit auf Englisch."
      ogTitle="KI- und Robotikstrategie"
      ogSubtitle="DR. JUSTINAS MIŠEIKIS · ZÜRICH"
    />
    <Helmet>
      <html lang="de" />
      <link rel="alternate" hrefLang="en" href="https://jmiseikis.com/" />
      <link rel="alternate" hrefLang="de" href="https://jmiseikis.com/de" />
      <meta property="og:locale" content="de_CH" />
    </Helmet>

    <PageHero
      eyebrow="Dr. Justinas Mišeikis | Zürich, Schweiz"
      title="KI- und Robotikstrategie. Schweizer Ökosystem."
      lead="Ich unterstütze internationale Technologieunternehmen und Investoren bei der Bewertung neuer Technologien, der Suche nach Partnern in der Schweiz und Entscheidungen zur Kommerzialisierung von Forschung."
    >
      <Actions>
        <ButtonLink href={contactPath("advisory")}>Kontakt aufnehmen</ButtonLink>
        <ButtonLink href="/" variant="secondary">
          <span lang="en">English website</span>
        </ButtonLink>
      </Actions>
      <p className="mt-6 text-xs text-muted-foreground">
        Sitz in der Schweiz. Beratung, Workshops und Vorträge ausschliesslich auf Englisch.
      </p>
    </PageHero>

    <section className="site-wrap pb-12 pt-10 md:pb-20" aria-labelledby="de-services-title">
      <SectionHead id="de-services-title" eyebrow="Zusammenarbeit" title="Technische Tiefe. Geschäftlicher Kontext." />
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10">
        {SERVICES.map((service) => (
          <RuleBlock key={service.title} title={service.title}>
            <p>{service.text}</p>
          </RuleBlock>
        ))}
      </div>
      <Note>
        <p>
          Beratung, Due Diligence, Workshops und Vorträge erfolgen ausschliesslich auf Englisch. Weitere Inhalte dieser
          Website sind auf Englisch verfügbar.
          Honorare werden je nach Umfang vereinbart und auf Anfrage mitgeteilt.
        </p>
      </Note>
    </section>

    <section className="section-y bg-muted" aria-labelledby="de-background-title">
      <div className="site-wrap grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-20">
        <div>
          <Eyebrow>Hintergrund</Eyebrow>
          <h2 id="de-background-title" className="h2">
            Forschung und Strategie verbinden.
          </h2>
        </div>
        <div className="space-y-4 text-muted-foreground">
          <p>
            Ich bin Strategy and Partnerships Manager bei Sony AI. Mein Hintergrund umfasst Technologie-Scouting bei Sony,
            Strategie und Partnerschaften bei Sony AI sowie die Leitung von KI-Aktivitäten bei F&P Robotics. Ausserdem bin
            ich Gründer und Host von{" "}
            <SmartLink href={TECHDRIVE_URL} className={inlineLink}>
              TechDrive Zürich
            </SmartLink>
            , einer Interview- und Podcastreihe über das Schweizer KI-, Robotik- und Deep-Tech-Ökosystem.
          </p>
          <p>
            PhD in Robotik und Computer Vision, Universität Oslo. Executive MBA, Quantic School of Business and Technology.
          </p>
          <p>
            15+ begutachtete Publikationen, 700+ Zitierungen und 40+ Patente im Bereich KI und Robotik. Nachweise:{" "}
            <SmartLink href={SCHOLAR_URL} className={inlineLink}>
              Google Scholar
            </SmartLink>{" "}
            und{" "}
            <SmartLink href={PATENTS_URL} className={inlineLink}>
              Google Patents
            </SmartLink>
            .
          </p>
          <div className="pt-1">
            <TextLink href="/about">Mehr über meinen Hintergrund (Englisch)</TextLink>
          </div>
        </div>
      </div>
    </section>

    <section className="site-wrap section-y" aria-labelledby="de-more-title">
      <h2 id="de-more-title" className="sr-only">
        Weitere Seiten
      </h2>
      <Actions className="mt-0">
        {ENGLISH_PAGES.map((page) => (
          <TextLink key={page.href} href={page.href}>
            {page.label}
          </TextLink>
        ))}
      </Actions>
    </section>
  </>
);

export default De;
