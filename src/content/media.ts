export interface VideoItem {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnail: string;
  publishedAt: string;
  isShort: boolean;
  views?: number;
}

const video = (id: string, title: string, publishedAt: string, isShort = false): VideoItem => ({
  id,
  title,
  url: isShort ? `https://www.youtube.com/shorts/${id}` : `https://www.youtube.com/watch?v=${id}`,
  thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  publishedAt,
  isShort,
});

/** Stage recording featured at the top of /speaking. It is a talk recording, not an edited showreel. */
export const FEATURED_TALK = video("wMKuVE_tJGc", "Physical AI Goes Corporate - CAIRO Forum, Zürich, Switzerland", "2026-06-26");

/**
 * Snapshot of the personal channel captured on 6 October 2026. Used only when the live
 * youtube-videos feed is unavailable, so the page never shows an empty media section.
 */
export const PERSONAL_FALLBACK: VideoItem[] = [
  video("cunBjaAA2dM", "Would you trust an AI-powered robot to operate on you or care for someone you love?", "2026-10-06"),
  FEATURED_TALK,
  video("q1pB_tPR_7o", "Gran Turismo Sophy: From Research Breakthrough to Video Game Innovation - GenAI Zurich 2026", "2026-04-27"),
  video("zk5mQzNsijo", "What if Physical AI becomes winner-takes-all?", "2026-05-12", true),
  video("4F_Gi3xbA6I", "Bias in AI - It starts at annotation! | Wisdom House Davos 2026", "2026-04-21", true),
  video("haXx3LzRWxE", "The silent killer of startup scaling", "2026-04-14", true),
  video("c1O3IAmZ83I", "The Secret to Corporate-Startup Collaborations", "2026-04-02", true),
  video("vSni0uICi2o", "3 Things You're Getting Wrong With Japanese Business Culture", "2026-03-30", true),
];

/**
 * TechDrive Zürich back catalogue. The YouTube RSS feed only exposes recent uploads, so the
 * live episodes are merged with this list to keep older episodes visible.
 */
export const TECHDRIVE_FALLBACK: VideoItem[] = [
  video("1ZWaSGfw--M", "Why Robots Can Backflip but Struggle With Real Work | Enzo Wälchli", "2026-10-06"),
  video("Z0mAv7VOuBk", "We throw computing at our ignorance. And it works.", "2026-09-23"),
  video("uvoba2PyXEQ", "Physical AI Is Ready. Your Building Isn't. | Kateryna Portmann on TechDrive Zurich", "2026-09-02"),
  video("mS4hiMQVwpk", "Switzerland's AI Movement is About to Start! | Swiss {ai} Weeks Team on TechDrive Zürich", "2026-08-26"),
  video("pxH66TFgfu8", "5 Years to Teach a Robot Table Tennis | Mireille El Geche on TechDrive Zürich", "2026-08-19"),
  video("6S3xZYJgf84", "DARE Campus: Where Robots Get to Run Wild | Stefan Zimmer on TechDrive Zürich", "2026-08-05"),
  video("X6pt5X9Z0-M", "Building World Class Startups at VentureLab | Raffael Kellner on TechDrive Zürich", "2026-07-22"),
];

/** Appearances on other channels. The RSS feed only covers uploads to the owner's channels. */
export const COLLABORATIONS = [
  {
    ...video("8Vnh4vA--d0", "Keeping AIs debiased: a conversation with Dr. Justinas Mišeikis", "2026-01-22"),
    channel: "Deep Tech Experts",
  },
];

/**
 * Display corrections for titles that arrive truncated from the source feed. The YouTube
 * record itself should also be fixed at source; this keeps the site correct meanwhile.
 */
const TITLE_CORRECTIONS: Record<string, string> = {
  c1O3IAmZ83I: "The Secret to Corporate-Startup Collaborations",
};

const cleanTitle = (title: string) => title.replace(/\s+/g, " ").replace(/\s*\u2014\s*/g, " - ").trim();

export function normaliseVideo(item: VideoItem): VideoItem {
  return { ...item, title: TITLE_CORRECTIONS[item.id] ?? cleanTitle(item.title) };
}

/** Merge live items with a fallback list, de-duplicated by id and sorted newest first. */
export function mergeVideos(live: VideoItem[], fallback: VideoItem[]): VideoItem[] {
  const merged = new Map<string, VideoItem>();
  for (const item of [...live, ...fallback]) {
    if (item?.id && !merged.has(item.id)) merged.set(item.id, normaliseVideo(item));
  }
  return [...merged.values()].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
}
