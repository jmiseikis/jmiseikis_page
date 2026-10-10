// Single source of truth for public route metadata.
// Used by the React <Seo> component (src/components/site/Seo.tsx) and by the
// post-build prerender script (scripts/prerender-meta.mjs), so the static HTML
// served to crawlers and the hydrated page always agree.
// Keep public/sitemap.xml in step with the `sitemap` entries below; a unit test checks this.

export const SITE_URL = "https://jmiseikis.com";
// The og-image edge function only accepts images from these hosts, so static OG
// artwork is referenced from the Lovable host rather than the custom domain.
export const OG_ASSET_ORIGIN = "https://jmiseikis.lovable.app";
export const DEFAULT_SUPABASE_PROJECT_ID = "uwdastthzqjbiyrxucci";
export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const GUIDE_UPDATED = "2026-10-06";

const NAME = "Dr. Justinas Mišeikis";

/**
 * @typedef {Object} RouteMeta
 * @property {string} path
 * @property {string} title
 * @property {string} description
 * @property {string} ogTitle
 * @property {string} ogSubtitle
 * @property {string} [ogImage] public path of a static image to embed in the OG card
 * @property {"en"|"de"} lang
 * @property {"WebPage"|"AboutPage"|"CollectionPage"} pageType
 * @property {"article"|"service"|"software"|"podcast"} [extra]
 * @property {string} [breadcrumb] label used in BreadcrumbList; omitted for the homepage
 * @property {string} [parent] path of the parent page in the breadcrumb trail
 * @property {{ priority: string, changefreq: string } | null} sitemap
 * @property {boolean} [alternates] emit en/de hreflang alternates (only / and /de)
 * @property {boolean} [noindex]
 */

/** @type {RouteMeta[]} */
export const ROUTES = [
  {
    path: "/",
    title: "AI & robotics strategy | Dr. Justinas Mišeikis",
    description:
      "AI and robotics advisory, technology scouting and speaking. Based in Zurich, working with international companies and investors.",
    ogTitle: "AI & robotics strategy. Swiss ecosystem expertise.",
    ogSubtitle: "DR. JUSTINAS MIŠEIKIS · ZURICH",
    lang: "en",
    pageType: "WebPage",
    sitemap: { priority: "1.0", changefreq: "weekly" },
    alternates: true,
  },
  {
    path: "/advisory",
    title: "AI & robotics advisory | Dr. Justinas Mišeikis",
    description:
      "Market entry, Swiss partnerships, startup scouting and technical diligence for investors, plus internal AI workflow advisory.",
    ogTitle: "AI & robotics advisory",
    ogSubtitle: "DR. JUSTINAS MIŠEIKIS · ADVISORY",
    lang: "en",
    pageType: "WebPage",
    extra: "service",
    breadcrumb: "Advisory",
    sitemap: { priority: "0.9", changefreq: "monthly" },
  },
  {
    path: "/speaking",
    title: "Speaking | Dr. Justinas Mišeikis",
    description:
      "Keynotes, panels and workshops on physical AI, research commercialisation and technology partnerships. Based in Switzerland, delivered in English.",
    ogTitle: "Speaking on AI & robotics",
    ogSubtitle: "DR. JUSTINAS MIŠEIKIS · SPEAKING",
    lang: "en",
    pageType: "WebPage",
    extra: "podcast",
    breadcrumb: "Speaking",
    sitemap: { priority: "0.9", changefreq: "weekly" },
  },
  {
    path: "/about",
    title: "About | Dr. Justinas Mišeikis",
    description:
      "Background in Sony technology scouting, Sony AI strategy and partnerships, robotics leadership, research and business education.",
    ogTitle: "Technical depth. Commercial perspective.",
    ogSubtitle: "DR. JUSTINAS MIŠEIKIS · ABOUT",
    lang: "en",
    pageType: "AboutPage",
    breadcrumb: "About",
    sitemap: { priority: "0.8", changefreq: "monthly" },
  },
  {
    path: "/resources",
    title: "Resources for Swiss technology & AI decisions | Dr. Justinas Mišeikis",
    description:
      "Guides, directories and templates for Swiss technology scouting, market entry, AI adoption and investor due diligence.",
    ogTitle: "Resources for Swiss technology & AI decisions",
    ogSubtitle: "GUIDES · DIRECTORIES · TEMPLATES",
    lang: "en",
    pageType: "CollectionPage",
    breadcrumb: "Resources",
    sitemap: { priority: "0.85", changefreq: "monthly" },
  },
  {
    path: "/publications",
    title: "Publications & patents | Dr. Justinas Mišeikis",
    description:
      "Selected papers in robotics, computer vision and human-robot interaction, with links to full publication and patent records.",
    ogTitle: "Publications & patents",
    ogSubtitle: "DR. JUSTINAS MIŠEIKIS · RESEARCH",
    lang: "en",
    pageType: "CollectionPage",
    breadcrumb: "Publications",
    sitemap: { priority: "0.7", changefreq: "monthly" },
  },
  {
    path: "/due-diligence",
    title: "AI & robotics due diligence | Dr. Justinas Mišeikis",
    description:
      "Technical and commercial assessment of AI, robotics and deep tech opportunities for investors, acquirers and corporate strategy teams.",
    ogTitle: "AI & robotics due diligence",
    ogSubtitle: "DR. JUSTINAS MIŠEIKIS · DUE DILIGENCE",
    lang: "en",
    pageType: "WebPage",
    extra: "service",
    breadcrumb: "Due diligence",
    parent: "/advisory",
    sitemap: { priority: "0.85", changefreq: "monthly" },
  },
  {
    path: "/ai-agents-strategy",
    title: "AI for internal data & workflows | Dr. Justinas Mišeikis",
    description:
      "Assess AI for internal knowledge, support, proposals and operations. Map company data, processes and permissions, then define a measurable pilot.",
    ogTitle: "Make AI useful inside your business",
    ogSubtitle: "PRACTICAL GUIDE · INTERNAL DATA & WORKFLOWS",
    lang: "en",
    pageType: "WebPage",
    extra: "article",
    breadcrumb: "AI for internal data & workflows",
    parent: "/resources",
    sitemap: { priority: "0.8", changefreq: "monthly" },
  },
  {
    path: "/swiss-ai-robotics-ecosystem",
    title: "Swiss AI & robotics ecosystem guide | Dr. Justinas Mišeikis",
    description:
      "Navigate Swiss AI and robotics research, startups and scale-ups. Public sources, investor questions and a downloadable technology scouting brief.",
    ogTitle: "Navigate the Swiss AI & robotics ecosystem",
    ogSubtitle: "FIELD GUIDE · INVESTORS & CORPORATE TEAMS",
    lang: "en",
    pageType: "WebPage",
    extra: "article",
    breadcrumb: "Swiss AI & robotics ecosystem guide",
    parent: "/resources",
    sitemap: { priority: "0.8", changefreq: "monthly" },
  },
  {
    path: "/swiss-baltic-market-entry",
    title: "Swiss & Baltic technology market-entry guide | Dr. Justinas Mišeikis",
    description:
      "Plan technology market entry into Switzerland and international growth for Swiss startups, with Baltic ecosystem sources and a reusable brief.",
    ogTitle: "Build your route into a new market",
    ogSubtitle: "FIELD GUIDE · SWITZERLAND & THE BALTICS",
    lang: "en",
    pageType: "WebPage",
    extra: "article",
    breadcrumb: "Swiss & Baltic market-entry guide",
    parent: "/resources",
    sitemap: { priority: "0.8", changefreq: "monthly" },
  },
  {
    path: "/gza-robotics",
    title: "Robotics in the Greater Zurich Area | Dr. Justinas Mišeikis",
    description:
      "Explore robotics companies, research labs and autonomous systems organisations in the Greater Zurich Area, with data curated by GZA.",
    ogTitle: "Robotics in the Greater Zurich Area",
    ogSubtitle: "DIRECTORY · DATA CURATED BY GZA",
    lang: "en",
    pageType: "CollectionPage",
    breadcrumb: "Robotics in the Greater Zurich Area",
    parent: "/resources",
    sitemap: { priority: "0.8", changefreq: "weekly" },
  },
  {
    path: "/swiss-vcs",
    title: "Swiss VCs & funds | Dr. Justinas Mišeikis",
    description:
      "Explore Swiss investors by sector, stage, geography and audience, with links to original investment-firm information.",
    ogTitle: "Swiss VCs & funds",
    ogSubtitle: "DIRECTORY · SECTOR, STAGE & GEOGRAPHY",
    ogImage: "/og-swiss-vcs.png",
    lang: "en",
    pageType: "CollectionPage",
    breadcrumb: "Swiss VCs & funds",
    parent: "/resources",
    sitemap: { priority: "0.8", changefreq: "weekly" },
  },
  {
    path: "/tech-events",
    title: "Swiss technology events | Dr. Justinas Mišeikis",
    description:
      "Explore technology conferences, summits and ecosystem events in Switzerland, with date, topic, location and scope filters.",
    ogTitle: "Swiss technology events",
    ogSubtitle: "CALENDAR · CONFERENCES & ECOSYSTEM EVENTS",
    lang: "en",
    pageType: "CollectionPage",
    breadcrumb: "Swiss technology events",
    parent: "/resources",
    sitemap: { priority: "0.8", changefreq: "weekly" },
  },
  {
    path: "/raas-calculator",
    title: "RaaS ROI calculator | Dr. Justinas Mišeikis",
    description:
      "Explore robot-as-a-service costs, cash savings, productivity assumptions and payback with an interactive robotics scenario model.",
    ogTitle: "RaaS ROI calculator",
    ogSubtitle: "ROBOT AS A SERVICE · SCENARIO MODEL",
    ogImage: "/og-raas-calculator.png",
    lang: "en",
    pageType: "WebPage",
    extra: "software",
    breadcrumb: "RaaS ROI calculator",
    parent: "/resources",
    sitemap: { priority: "0.8", changefreq: "monthly" },
  },
  {
    path: "/de",
    title: "KI- und Robotikstrategie | Dr. Justinas Mišeikis",
    description:
      "KI- und Robotikberatung, Technologie-Scouting und Keynotes. Sitz in Zürich, internationale Zusammenarbeit auf Englisch.",
    ogTitle: "KI- und Robotikstrategie",
    ogSubtitle: "DR. JUSTINAS MIŠEIKIS · ZÜRICH",
    lang: "de",
    pageType: "WebPage",
    sitemap: { priority: "0.7", changefreq: "monthly" },
    alternates: true,
  },
];

/** @type {RouteMeta} */
export const NOT_FOUND_ROUTE = {
  path: "*",
  title: "Page not found | Dr. Justinas Mišeikis",
  description: "Find the right page on the website of Dr. Justinas Mišeikis.",
  ogTitle: "Page not found",
  ogSubtitle: "DR. JUSTINAS MIŠEIKIS",
  lang: "en",
  pageType: "WebPage",
  sitemap: null,
  noindex: true,
};

export const LANGUAGE_ALTERNATES = [
  { hreflang: "en", href: `${SITE_URL}/` },
  { hreflang: "de", href: `${SITE_URL}/de` },
  { hreflang: "x-default", href: `${SITE_URL}/` },
];

/** @param {string} path */
export function getRoute(path) {
  const clean = path !== "/" ? path.replace(/\/+$/, "") : path;
  return ROUTES.find((r) => r.path === clean) ?? NOT_FOUND_ROUTE;
}

/** @param {RouteMeta} route */
export function canonicalUrl(route) {
  return route.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${route.path}`;
}

/**
 * URL of the dynamic OG image edge function, falling back to the static card.
 * @param {RouteMeta} route
 * @param {string | undefined} projectId
 */
export function ogImageUrl(route, projectId) {
  if (!projectId) return `${OG_ASSET_ORIGIN}/og-image.png`;
  const params = new URLSearchParams({ title: route.ogTitle });
  if (route.ogSubtitle) params.set("subtitle", route.ogSubtitle);
  if (route.ogImage) params.set("image", `${OG_ASSET_ORIGIN}${route.ogImage}`);
  return `https://${projectId}.supabase.co/functions/v1/og-image?${params.toString()}`;
}

/** Shared identity. No email address, current job title or unverified counts. */
export function personNode() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: NAME,
    alternateName: ["Justinas Mišeikis", "Justinas Miseikis"],
    url: `${SITE_URL}/`,
    image: `${OG_ASSET_ORIGIN}/og-image.png`,
    description:
      "AI and robotics advisor and speaker based in Zurich, Switzerland, working internationally in English. Host of TechDrive Zürich.",
    knowsAbout: [
      "Artificial intelligence",
      "Robotics",
      "Computer vision",
      "Human-robot interaction",
      "Technology scouting",
      "Technical due diligence",
      "Research commercialisation",
      "Market entry",
    ],
    alumniOf: [
      { "@type": "CollegeOrUniversity", name: "University of Oslo", url: "https://www.uio.no" },
      { "@type": "EducationalOrganization", name: "Quantic School of Business and Technology" },
    ],
    hasCredential: [
      { "@type": "EducationalOccupationalCredential", credentialCategory: "degree", name: "PhD in Robotics and Computer Vision" },
      { "@type": "EducationalOccupationalCredential", credentialCategory: "degree", name: "Executive MBA" },
    ],
    address: { "@type": "PostalAddress", addressLocality: "Zurich", addressCountry: "CH" },
    sameAs: [
      "https://www.linkedin.com/in/justinasmiseikis/",
      "https://scholar.google.com/citations?user=KeZ1-AwAAAAJ",
      "https://www.youtube.com/@JustinasMiseikis",
      "https://premium-speakers.com/en/speaker-presenter/justinas-miseikis/",
    ],
  };
}

const SERVICES = {
  "/advisory": [
    ["scouting", "Market entry & Swiss partnerships", "Target-market assessment, positioning and Swiss partner identification for technology companies and selected startups."],
    ["diligence", "Startup scouting & technical diligence", "Thesis-led scouting and technical assessment of Swiss AI and robotics startups from early stage through scale-up."],
    ["representation", "Swiss presence & strategic support", "Local technical and commercial support for Swiss activities, from partnership development to conference representation."],
    ["internal-ai", "AI for internal data & workflows", "Workflow and data readiness assessment and pilot definition for internal AI applications."],
  ],
  "/due-diligence": [
    ["assessment", "AI & robotics due diligence", "Technical and commercial assessment of AI, robotics and deep tech opportunities for investors, acquirers and strategy teams."],
  ],
};

/**
 * JSON-LD graph for a route. Only describes what is visible on the page.
 * @param {RouteMeta} route
 */
export function structuredData(route) {
  const url = canonicalUrl(route);
  const graph = [
    personNode(),
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      name: NAME,
      url: `${SITE_URL}/`,
      inLanguage: "en",
      publisher: { "@id": PERSON_ID },
    },
  ];

  if (route.noindex) {
    return { "@context": "https://schema.org", "@graph": graph };
  }

  const page = {
    "@type": route.pageType,
    "@id": `${url}#webpage`,
    url,
    name: route.title,
    description: route.description,
    inLanguage: route.lang,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": PERSON_ID },
  };

  if (route.breadcrumb) {
    const items = [{ name: "Home", item: `${SITE_URL}/` }];
    if (route.parent) {
      const parent = ROUTES.find((r) => r.path === route.parent);
      if (parent?.breadcrumb) items.push({ name: parent.breadcrumb, item: canonicalUrl(parent) });
    }
    items.push({ name: route.breadcrumb, item: url });
    page.breadcrumb = {
      "@type": "BreadcrumbList",
      itemListElement: items.map((entry, index) => ({ "@type": "ListItem", position: index + 1, ...entry })),
    };
  }
  graph.push(page);

  if (route.extra === "article") {
    graph.push({
      "@type": "Article",
      "@id": `${url}#article`,
      headline: route.ogTitle,
      description: route.description,
      url,
      inLanguage: route.lang,
      dateModified: GUIDE_UPDATED,
      author: { "@id": PERSON_ID },
      publisher: { "@id": PERSON_ID },
      mainEntityOfPage: { "@id": `${url}#webpage` },
    });
  }

  if (route.extra === "service") {
    for (const [id, name, description] of SERVICES[route.path] ?? []) {
      graph.push({
        "@type": "Service",
        "@id": `${url}#${id}`,
        name,
        serviceType: name,
        description,
        provider: { "@id": PERSON_ID },
        availableLanguage: "English",
        url: `${url}#${id}`,
      });
    }
  }

  if (route.extra === "software") {
    graph.push({
      "@type": "SoftwareApplication",
      "@id": `${url}#app`,
      name: "RaaS ROI calculator",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url,
      description: route.description,
      author: { "@id": PERSON_ID },
    });
  }

  if (route.extra === "podcast") {
    graph.push({
      "@type": "PodcastSeries",
      "@id": "https://techdrivezurich.lovable.app/#series",
      name: "TechDrive Zürich",
      url: "https://techdrivezurich.lovable.app/",
      description:
        "Interview series hosted by Dr. Justinas Mišeikis with founders, researchers and operators in the Swiss AI and robotics ecosystem.",
      inLanguage: "en",
      author: { "@id": PERSON_ID },
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

/** Serialise JSON-LD safely for embedding inside a <script> element. */
export function jsonLdString(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * Head tags for a route, shared by <Seo> (React Helmet) and the prerender script so the
 * static HTML and the hydrated page carry identical metadata.
 * @param {RouteMeta} route
 * @param {string | undefined} projectId
 * @returns {{ tag: "meta" | "link" | "script", attrs: Record<string, string>, content?: string }[]}
 */
export function headTags(route, projectId) {
  const url = route.noindex ? null : canonicalUrl(route);
  const image = ogImageUrl(route, projectId);
  const meta = (attrs) => ({ tag: "meta", attrs });
  const tags = [
    meta({ name: "description", content: route.description }),
    meta({ name: "robots", content: route.noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large" }),
  ];
  if (url) tags.push({ tag: "link", attrs: { rel: "canonical", href: url } });
  if (route.alternates) {
    for (const alt of LANGUAGE_ALTERNATES) tags.push({ tag: "link", attrs: { rel: "alternate", hreflang: alt.hreflang, href: alt.href } });
  }
  tags.push(
    meta({ property: "og:type", content: "website" }),
    meta({ property: "og:site_name", content: NAME }),
    meta({ property: "og:locale", content: route.lang === "de" ? "de_CH" : "en_GB" }),
    meta({ property: "og:title", content: route.title }),
    meta({ property: "og:description", content: route.description }),
  );
  if (url) tags.push(meta({ property: "og:url", content: url }));
  tags.push(
    meta({ property: "og:image", content: image }),
    meta({ property: "og:image:width", content: "1200" }),
    meta({ property: "og:image:height", content: "630" }),
    meta({ property: "og:image:alt", content: route.ogTitle }),
    meta({ name: "twitter:card", content: "summary_large_image" }),
    meta({ name: "twitter:title", content: route.title }),
    meta({ name: "twitter:description", content: route.description }),
    meta({ name: "twitter:image", content: image }),
    { tag: "script", attrs: { type: "application/ld+json" }, content: jsonLdString(structuredData(route)) },
  );
  return tags;
}

