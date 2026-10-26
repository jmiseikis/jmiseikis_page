// JSON-LD for each public route, written into the prerendered HTML by scripts/prerender-meta.mjs.
// Every page gets one @graph: the shared WebSite and Person nodes, the page itself and anything specific to it.
// Owner-confirmed facts only: no email address, no fees or prices, no partner or affiliation claims.
// Keep the offers, URLs and names in step with src/content/services.ts and src/lib/site.ts (a test checks them).

const LINKEDIN_URL = "https://www.linkedin.com/in/justinasmiseikis/";
const SCHOLAR_URL = "https://scholar.google.com/citations?user=KeZ1-AwAAAAJ";
const PATENTS_URL = "https://patents.google.com/?inventor=justinas+miseikis,justinas+mi%C5%A1eikis";
const TECHDRIVE_URL = "https://techdrive.tv/";
const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@JustinasMiseikis";
const PREMIUM_SPEAKERS_URL = "https://premium-speakers.com/en/speaker-presenter/justinas-miseikis/";
const GZA_URL = "https://www.greaterzuricharea.com/en";

/** The four offers on /advisory, by anchor. */
export const ADVISORY_SERVICES = [
  {
    id: "market-entry",
    name: "Market entry & Swiss partnerships",
    description:
      "Assess target markets, sharpen your positioning and identify relevant Swiss partners. Support Swiss startups in shaping their next international market test.",
  },
  {
    id: "scouting-diligence",
    name: "Startup scouting & technical diligence",
    description:
      "Help VCs and corporate investors find Swiss AI and robotics opportunities, assess technical substance and test the evidence from early stage through scale-up.",
  },
  {
    id: "swiss-presence",
    name: "Swiss presence & strategic support",
    description:
      "Add a local technical and commercial perspective to your Swiss activities, from partnership development to conference representation.",
  },
  {
    id: "internal-ai",
    name: "AI for internal data & workflows",
    description:
      "Identify useful internal AI applications, map the company data and processes they rely on, and define a pilot with measurable criteria.",
  },
];

/** Stage engagements listed on /speaking. Wisdom House was independently organised during WEF week. */
const SPEAKING_EVENTS = [
  { name: "Wisdom House @ Davos 2026", location: "Davos, Switzerland", description: "Independently organised during WEF week" },
  { name: "GenAI Zürich", location: "Zurich, Switzerland" },
  { name: "LOGIN Conference", location: "Vilnius, Lithuania" },
  { name: "ETH Zürich & ETH Entrepreneurship Club", location: "Zurich, Switzerland" },
  { name: "Sony AI Conference" },
];

const person = (site, ids, path) => ({
  "@type": "Person",
  "@id": ids.person,
  name: "Dr. Justinas Mišeikis",
  alternateName: ["Justinas Mišeikis", "Justinas Miseikis", "Dr. Justinas Miseikis"],
  url: `${site}/`,
  image: `${site}/og-image.png`,
  jobTitle: ["Strategy and Partnerships Manager at Sony AI", "Founder and Host of TechDrive Zürich"],
  worksFor: {
    "@type": "Organization",
    name: "Sony AI",
    url: "https://ai.sony",
    parentOrganization: { "@type": "Organization", name: "Sony", url: "https://www.sony.com" },
  },
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: "University of Oslo", url: "https://www.uio.no" },
    { "@type": "CollegeOrUniversity", name: "Quantic School of Business and Technology" },
  ],
  hasCredential: [
    { "@type": "EducationalOccupationalCredential", credentialCategory: "degree", name: "PhD in Robotics and Computer Vision" },
    { "@type": "EducationalOccupationalCredential", credentialCategory: "degree", name: "Executive MBA" },
  ],
  knowsAbout: [
    "Artificial Intelligence",
    "Robotics",
    "Computer Vision",
    "Physical AI",
    "Human-Robot Interaction",
    "Machine Learning",
    "AI Commercialization",
    "Research Commercialization",
    "Technology Scouting",
    "Technology Due Diligence",
    "Corporate Innovation",
    "Startup Partnerships",
    "AI Ethics",
    "Swiss AI and Robotics Ecosystem",
  ],
  address: { "@type": "PostalAddress", addressLocality: "Zurich", addressRegion: "Zurich", addressCountry: "CH" },
  nationality: { "@type": "Country", name: "Lithuania" },
  sameAs: [LINKEDIN_URL, SCHOLAR_URL, PATENTS_URL, YOUTUBE_CHANNEL_URL, PREMIUM_SPEAKERS_URL],
  ...(path === "/speaking" && {
    performerIn: SPEAKING_EVENTS.map((event) => ({ "@type": "Event", ...event })),
  }),
});

const podcast = (ids) => ({
  "@type": "PodcastSeries",
  "@id": `${TECHDRIVE_URL}#podcast`,
  name: "TechDrive Zürich",
  url: TECHDRIVE_URL,
  description:
    "Interview and podcast series hosted by Dr. Justinas Mišeikis, spotlighting founders, researchers and operators shaping Switzerland's AI, robotics and deep tech ecosystem, recorded in and around Zürich.",
  inLanguage: "en",
  author: { "@id": ids.person },
  about: ["Artificial Intelligence", "Robotics", "Deep Tech", "Swiss Startups", "Greater Zurich Area"],
});

const service = (ids, url, { id, name, description }) => ({
  "@type": "Service",
  "@id": `${url}#${id}`,
  url: `${url}#${id}`,
  name,
  description,
  provider: { "@id": ids.person },
});

/** Nodes that only belong on one page. */
const EXTRAS = {
  "/": ({ ids }) => [podcast(ids)],
  "/speaking": ({ ids }) => [podcast(ids)],
  "/advisory": ({ ids, url }) => ADVISORY_SERVICES.map((offer) => service(ids, url, offer)),
  "/due-diligence": ({ ids, url, route }) => [
    service(ids, url, { id: "service", name: "AI & robotics due diligence", description: route.description }),
  ],
  "/raas-calculator": ({ ids, url, route }) => [
    {
      "@type": "SoftwareApplication",
      "@id": `${url}#calculator`,
      name: "RaaS ROI calculator",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url,
      description: route.description,
      isAccessibleForFree: true,
      author: { "@id": ids.person },
    },
  ],
  "/gza-robotics": ({ ids, url }) => [
    {
      "@type": "Dataset",
      "@id": `${url}#dataset`,
      name: "Robotics in the Greater Zurich Area",
      description:
        "Directory of robotics companies, autonomous systems startups, university research labs and technology organisations in the Greater Zurich Area of Switzerland, listed with the agreement of Greater Zurich Area (GZA).",
      url,
      creator: { "@type": "Organization", name: "Greater Zurich Area", url: GZA_URL },
      publisher: { "@id": ids.person },
      spatialCoverage: { "@type": "Place", name: "Greater Zurich Area, Switzerland" },
      isAccessibleForFree: true,
    },
  ],
  "/swiss-vcs": ({ ids, url }) => [
    {
      "@type": "Dataset",
      "@id": `${url}#dataset`,
      name: "Swiss VCs and funds",
      description:
        "Directory of Swiss venture capital firms and funds by sector, investment round, target geography and audience, with links to each firm's own information.",
      url,
      creator: { "@id": ids.person },
      spatialCoverage: { "@type": "Country", name: "Switzerland" },
      isAccessibleForFree: true,
    },
  ],
};

/** Where each page sits in the site, for its breadcrumb trail. Pages not listed sit directly under the home page. */
const PARENTS = {
  "/due-diligence": "/advisory",
  "/ai-agents-strategy": "/resources",
  "/swiss-ai-robotics-ecosystem": "/resources",
  "/swiss-baltic-market-entry": "/resources",
  "/gza-robotics": "/resources",
  "/swiss-vcs": "/resources",
  "/tech-events": "/resources",
  "/raas-calculator": "/resources",
  "/worksheets/technology-scouting-brief": "/resources",
  "/worksheets/market-entry-brief": "/resources",
  "/worksheets/ai-workflow-pilot-brief": "/resources",
  "/worksheets/technical-diligence-checklist": "/resources",
};

const breadcrumbs = (seo, path) => {
  const trail = [];
  for (let current = path; current && current !== "/"; current = PARENTS[current] ?? "/") trail.unshift(current);
  const items = [{ name: "Home", path: "/" }, ...trail.map((p) => ({ name: seo.routes[p].ogTitle, path: p }))];
  return {
    "@type": "BreadcrumbList",
    "@id": `${seo.site}${path}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${seo.site}${item.path}`,
    })),
  };
};

/** The JSON-LD object for one route of src/content/seo.json. */
export function structuredData(seo, path) {
  const route = seo.routes[path];
  if (!route) throw new Error(`No SEO entry for ${path}`);
  const site = seo.site;
  const url = `${site}${path}`;
  const ids = { website: `${site}/#website`, person: `${site}/#person`, page: `${url}#webpage` };
  const inLanguage = route.language ?? "en";

  const page = {
    "@type": route.type,
    "@id": ids.page,
    url,
    name: route.title,
    description: route.description,
    inLanguage,
    isPartOf: { "@id": ids.website },
    author: { "@id": ids.person },
    ...(["/", "/de", "/about"].includes(path) && { mainEntity: { "@id": ids.person } }),
    ...(path !== "/" && { breadcrumb: { "@id": `${url}#breadcrumb` } }),
  };
  const graph = [
    {
      "@type": "WebSite",
      "@id": ids.website,
      url: `${site}/`,
      name: "Dr. Justinas Mišeikis",
      inLanguage: ["en", "de"],
      publisher: { "@id": ids.person },
    },
    person(site, ids, path),
    page,
  ];
  if (route.article) {
    graph.push({
      "@type": "Article",
      "@id": `${url}#article`,
      headline: route.ogTitle,
      description: route.description,
      inLanguage,
      author: { "@id": ids.person },
      publisher: { "@id": ids.person },
      mainEntityOfPage: { "@id": ids.page },
      // The review date shown on the page; a rebuild is not a new review.
      ...(route.updated && { dateModified: route.updated }),
    });
  }
  if (path !== "/") graph.push(breadcrumbs(seo, path));
  graph.push(...(EXTRAS[path]?.({ ids, url, route }) ?? []));
  return { "@context": "https://schema.org", "@graph": graph };
}
