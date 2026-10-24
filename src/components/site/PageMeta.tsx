import { Helmet } from "react-helmet-async";
import { buildOgImageUrl } from "@/lib/ogImage";

const SITE = "https://jmiseikis.com";

/**
 * Title, description, canonical, Open Graph and Twitter tags for a standalone page.
 * scripts/prerender-meta.mjs writes the same values into the static HTML for each route; keep them in step.
 */
const PageMeta = ({
  title,
  description,
  path,
  ogTitle,
  ogSubtitle,
  ogImage,
}: {
  title: string;
  description: string;
  path: string;
  ogTitle: string;
  ogSubtitle: string;
  /** Background image for the generated preview, as in the route's prerender entry. */
  ogImage?: string;
}) => {
  const url = `${SITE}${path}`;
  const image = buildOgImageUrl({ title: ogTitle, subtitle: ogSubtitle, image: ogImage });

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default PageMeta;
