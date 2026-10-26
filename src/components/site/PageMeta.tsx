import { Helmet } from "react-helmet-async";
import { buildOgImageUrl } from "@/lib/ogImage";
import seo from "@/content/seo.json";
import { scriptJson } from "../../../scripts/seo-head.mjs";
import { structuredData } from "../../../scripts/structured-data.mjs";

export type RoutePath = keyof typeof seo.routes;

interface RouteMeta {
  title: string;
  description: string;
  ogTitle: string;
  ogSubtitle: string;
  ogImage?: string;
  language?: string;
}

const ALTERNATE_PATHS: string[] = Object.values(seo.alternates);

/**
 * Title, description, robots, canonical, Open Graph, Twitter, language tags and JSON-LD for a public page, from
 * src/content/seo.json. scripts/prerender-meta.mjs writes the same tags into each route's static HTML;
 * react-helmet-async adopts those on load and replaces them on navigation, so every tag appears once.
 */
const PageMeta = ({ path }: { path: RoutePath }) => {
  const route: RouteMeta = seo.routes[path];
  const url = `${seo.site}${path}`;
  const language = route.language ?? "en";
  const image = buildOgImageUrl({ title: route.ogTitle, subtitle: route.ogSubtitle, image: route.ogImage });
  const alternates = ALTERNATE_PATHS.includes(path);
  const otherLocales = Object.entries(seo.locales)
    .filter(([lang]) => lang !== language)
    .map(([, locale]) => locale);

  return (
    <Helmet>
      <html lang={language} />
      <title>{route.title}</title>
      <meta name="description" content={route.description} />
      <meta name="robots" content={seo.robots} />
      <link rel="canonical" href={url} />
      {alternates &&
        Object.entries(seo.alternates).map(([hreflang, href]) => (
          <link key={hreflang} rel="alternate" hrefLang={hreflang} href={`${seo.site}${href}`} />
        ))}
      <meta property="og:type" content="website" />
      <meta property="og:locale" content={seo.locales[language as keyof typeof seo.locales]} />
      {alternates &&
        otherLocales.map((locale) => <meta key={locale} property="og:locale:alternate" content={locale} />)}
      <meta property="og:title" content={route.title} />
      <meta property="og:description" content={route.description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={route.title} />
      <meta name="twitter:description" content={route.description} />
      <meta name="twitter:image" content={image} />
      {/* The same graph the prerendered HTML carries, so client navigation never keeps the previous page's. */}
      <script type="application/ld+json">{scriptJson(structuredData(seo, path))}</script>
    </Helmet>
  );
};

export default PageMeta;
