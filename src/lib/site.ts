// Shared site configuration: external records, navigation, footer and contact links.
// Keep external URLs here so every page links to the same records.

export const LINKEDIN_URL = "https://www.linkedin.com/in/justinasmiseikis/";
export const SCHOLAR_URL = "https://scholar.google.com/citations?user=KeZ1-AwAAAAJ";
export const PATENTS_URL = "https://patents.google.com/?inventor=justinas+miseikis,justinas+mi%C5%A1eikis";
export const TECHDRIVE_URL = "https://techdrive.tv/";
export const TECHDRIVE_CHANNEL_URL = "https://www.youtube.com/@TechDriveZurich";
export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@JustinasMiseikis";
export const PREMIUM_SPEAKERS_URL = "https://premium-speakers.com/en/speaker-presenter/justinas-miseikis/";
export const GZA_URL = "https://www.greaterzuricharea.com/en";
export const SWISS_ROBOTICS_STARTUPS_URL = "https://www.swissroboticsstartups.com/";
export const SWISS_HACK_EVENTS_URL = "https://www.hackevents.net/ch";

export const CONTACT_PATH = "/#contact";

/** Enquiry purposes a link can preselect on the contact form. No personal data goes in the URL. */
export const ENQUIRY_OPTIONS = [
  { value: "advisory", label: "Advisory or strategy" },
  { value: "scouting", label: "Technology scouting, market entry or Swiss partnerships" },
  { value: "diligence", label: "Technical-commercial assessment" },
  { value: "representation", label: "Swiss presence or event representation" },
  { value: "speaking", label: "Speaking or workshop" },
  { value: "other", label: "Other enquiry" },
] as const;
export type EnquiryIntent = (typeof ENQUIRY_OPTIONS)[number]["value"];
export const ENQUIRY_INTENTS: readonly EnquiryIntent[] = ENQUIRY_OPTIONS.map((option) => option.value);
export const isEnquiryIntent = (value: string | null | undefined): value is EnquiryIntent =>
  ENQUIRY_INTENTS.includes(value as EnquiryIntent);

/** Link to the protected contact form on the home page with a suggested purpose. */
export const contactPath = (intent: EnquiryIntent = "advisory") => `/?enquiry=${intent}#contact`;

export interface NavLinkConfig {
  label: string;
  to: string;
  /** Routes that belong to this section, so child pages highlight their parent. */
  section: string[];
}

export const NAV_LINKS: NavLinkConfig[] = [
  { label: "Advisory", to: "/advisory", section: ["/advisory", "/due-diligence"] },
  { label: "Speaking", to: "/speaking", section: ["/speaking"] },
  {
    label: "Resources",
    to: "/resources",
    section: [
      "/resources",
      "/swiss-ai-robotics-ecosystem",
      "/swiss-baltic-market-entry",
      "/ai-agents-strategy",
      "/gza-robotics",
      "/swiss-vcs",
      "/tech-events",
      "/raas-calculator",
    ],
  },
  { label: "Publications", to: "/publications", section: ["/publications"] },
  { label: "About", to: "/about", section: ["/about"] },
];

export interface FooterLink {
  label: string;
  to: string;
  external?: boolean;
}

export const FOOTER_COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Work together",
    links: [
      { label: "Advisory", to: "/advisory" },
      { label: "Due diligence", to: "/due-diligence" },
      { label: "Speaking", to: "/speaking" },
      { label: "About", to: "/about" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Resource hub", to: "/resources" },
      { label: "Publications & patents", to: "/publications" },
      { label: "Swiss ecosystem guide", to: "/swiss-ai-robotics-ecosystem" },
      { label: "Market-entry guide", to: "/swiss-baltic-market-entry" },
      { label: "Internal AI & workflows", to: "/ai-agents-strategy" },
    ],
  },
  {
    title: "Directories & tools",
    links: [
      { label: "Swiss tech events", to: "/tech-events" },
      { label: "Swiss VCs & funds", to: "/swiss-vcs" },
      { label: "GZA robotics", to: "/gza-robotics" },
      { label: "RaaS calculator", to: "/raas-calculator" },
    ],
  },
];
