import { Helmet } from "react-helmet-async";
import { getRoute, headTags } from "@/lib/seo/routes.mjs";

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID as string | undefined;

/**
 * Per-route head tags from src/lib/seo/routes.mjs. The prerender script writes the same
 * list into the static HTML, so crawlers and the hydrated page see identical metadata.
 */
const Seo = ({ path }: { path: string }) => {
  const route = getRoute(path);

  return (
    <Helmet>
      <html lang={route.lang} />
      <title>{route.title}</title>
      {headTags(route, PROJECT_ID).map(({ tag, attrs, content }) => {
        const key = `${tag}-${attrs.name ?? attrs.property ?? attrs.rel ?? attrs.type}-${attrs.hreflang ?? ""}`;
        if (tag === "meta") return <meta key={key} {...attrs} />;
        if (tag === "link") {
          const { hreflang, ...rest } = attrs;
          return <link key={key} {...rest} {...(hreflang ? { hrefLang: hreflang } : {})} />;
        }
        return (
          <script key={key} {...attrs}>
            {content}
          </script>
        );
      })}
    </Helmet>
  );
};

export default Seo;
