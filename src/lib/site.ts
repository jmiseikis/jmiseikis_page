// Shared site constants. Keep external URLs here so every page links to the same records.

export const SITE_URL = "https://jmiseikis.com";
export const PERSON_NAME = "Dr. Justinas Mišeikis";

export const LINKEDIN_URL = "https://www.linkedin.com/in/justinasmiseikis/";
export const SCHOLAR_URL = "https://scholar.google.com/citations?user=KeZ1-AwAAAAJ";
export const PATENTS_URL = "https://patents.google.com/?inventor=justinas+miseikis,justinas+mi%C5%A1eikis";
export const TECHDRIVE_URL = "https://techdrivezurich.lovable.app/";
export const TECHDRIVE_CHANNEL_URL = "https://www.youtube.com/@TechDriveZurich";
export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@JustinasMiseikis";
export const PREMIUM_SPEAKERS_URL = "https://premium-speakers.com/en/speaker-presenter/justinas-miseikis/";
export const GZA_URL = "https://www.greaterzuricharea.com/en";
export const GZA_MAP_PDF = "/gza-robotics-map.pdf";

/** Enquiry intents accepted by the contact form. Unknown values fall back to "advisory". */
export const ENQUIRY_OPTIONS = [
  { value: "advisory", label: "Advisory or strategy" },
  { value: "scouting", label: "Technology scouting, market entry or Swiss partnerships" },
  { value: "diligence", label: "Technical-commercial assessment" },
  { value: "representation", label: "Swiss presence or event representation" },
  { value: "speaking", label: "Speaking or workshop" },
  { value: "other", label: "Other enquiry" },
] as const;

export type EnquiryIntent = (typeof ENQUIRY_OPTIONS)[number]["value"];

export const isEnquiryIntent = (value: string | null | undefined): value is EnquiryIntent =>
  ENQUIRY_OPTIONS.some((option) => option.value === value);

/** Link to the protected contact form with a preselected purpose. No personal data goes in the URL. */
export const contactPath = (intent: EnquiryIntent = "advisory") => `/?enquiry=${intent}#contact`;

/** Only allow http(s) links from remote data so a source can't inject javascript: or data: URLs. */
export function safeExternalUrl(value: unknown): string | null {
  const raw = String(value ?? "").trim();
  if (!raw || raw === "[URL]") return null;
  try {
    const url = new URL(raw.startsWith("www.") ? `https://${raw}` : raw);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}
