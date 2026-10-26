// Types for the plain ES module shared by the build scripts and PageMeta.
export declare const ADVISORY_SERVICES: { id: string; name: string; description: string }[];
export declare function structuredData(seo: unknown, path: string): { "@context": string; "@graph": Record<string, unknown>[] };
