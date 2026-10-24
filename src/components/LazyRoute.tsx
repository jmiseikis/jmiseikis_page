import { Suspense, type ReactNode } from "react";
import RouteErrorBoundary from "@/components/RouteErrorBoundary";

/**
 * Wraps a lazy-loaded page in its own error boundary and loading fallback. The key gives every route its
 * own boundary: React Router reuses the element position between routes, so an unkeyed boundary that caught
 * one failed chunk would keep showing the error on the next lazy page as well.
 */
export const lazyRoute = (key: string, page: ReactNode) => (
  <RouteErrorBoundary key={key}>
    <Suspense fallback={<div className="min-h-screen bg-background" />}>{page}</Suspense>
  </RouteErrorBoundary>
);
