// Types for the plain ES module shared by the build scripts and PageMeta.
export declare const SEO_START: string;
export declare const SEO_END: string;
export declare function scriptJson(value: unknown): string;
export declare function ogImageUrl(options: { site: string; projectId?: string; title: string; subtitle?: string; image?: string }): string;
export declare function routeHead(seo: unknown, path: string, options?: { projectId?: string; jsonLd?: boolean; indent?: string }): string;
export declare function renderRoute(baseHtml: string, seo: unknown, path: string, options?: { projectId?: string; jsonLd?: boolean }): string;
