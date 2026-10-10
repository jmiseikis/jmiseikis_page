export interface RouteMeta {
  path: string;
  title: string;
  description: string;
  ogTitle: string;
  ogSubtitle: string;
  ogImage?: string;
  lang: "en" | "de";
  pageType: "WebPage" | "AboutPage" | "CollectionPage";
  extra?: "article" | "service" | "software" | "podcast";
  breadcrumb?: string;
  parent?: string;
  sitemap: { priority: string; changefreq: string } | null;
  alternates?: boolean;
  noindex?: boolean;
}

export const SITE_URL: string;
export const OG_ASSET_ORIGIN: string;
export const DEFAULT_SUPABASE_PROJECT_ID: string;
export const PERSON_ID: string;
export const WEBSITE_ID: string;
export const GUIDE_UPDATED: string;
export const ROUTES: RouteMeta[];
export const NOT_FOUND_ROUTE: RouteMeta;
export const LANGUAGE_ALTERNATES: { hreflang: string; href: string }[];
export function getRoute(path: string): RouteMeta;
export function canonicalUrl(route: RouteMeta): string;
export function ogImageUrl(route: RouteMeta, projectId: string | undefined): string;
export function personNode(): Record<string, unknown>;
export function structuredData(route: RouteMeta): Record<string, unknown>;
export function jsonLdString(data: unknown): string;
export interface HeadTag {
  tag: "meta" | "link" | "script";
  attrs: Record<string, string>;
  content?: string;
}
export function headTags(route: RouteMeta, projectId: string | undefined): HeadTag[];
