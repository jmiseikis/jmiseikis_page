// Build a URL to the dynamic Open Graph image edge function.
// Falls back to the static /og-image.png if the project ID is unavailable.

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID as string | undefined;
const SITE = "https://jmiseikis.lovable.app";
export const FALLBACK_OG_IMAGE = `${SITE}/og-image.png`;

export function buildOgImageUrl(opts: {
  title: string;
  image?: string;
  subtitle?: string;
}): string {
  if (!PROJECT_ID) return FALLBACK_OG_IMAGE;
  const params = new URLSearchParams();
  params.set("title", opts.title);
  if (opts.subtitle) params.set("subtitle", opts.subtitle);
  if (opts.image) {
    const abs = opts.image.startsWith("http")
      ? opts.image
      : `${SITE}${opts.image.startsWith("/") ? "" : "/"}${opts.image}`;
    params.set("image", abs);
  }
  return `https://${PROJECT_ID}.supabase.co/functions/v1/og-image?${params.toString()}`;
}