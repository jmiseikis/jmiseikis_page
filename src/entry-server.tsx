// Build-time renderer: scripts/prerender-meta.mjs calls render() for each public route and writes the result into
// that route's static HTML, so the first response already contains the page people see. The browser then hydrates
// it (src/main.tsx). Same components and content as the live app; no crawler-only version.
import { PassThrough } from "node:stream";
import { renderToPipeableStream } from "react-dom/server";
import { HelmetProvider } from "react-helmet-async";
import { StaticRouter } from "react-router-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteApplication } from "./App";

/** Render one route to HTML, waiting until its lazily loaded page is ready. */
export function render(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = new PassThrough();
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => {
      clearTimeout(timer);
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    stream.on("error", reject);
    const output = renderToPipeableStream(
      <HelmetProvider context={{}}>
        <QueryClientProvider client={new QueryClient()}>
          <TooltipProvider>
            <StaticRouter location={path}>
              <SiteApplication />
            </StaticRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </HelmetProvider>,
      {
        onAllReady() {
          output.pipe(stream);
        },
        onShellError(error) {
          clearTimeout(timer);
          reject(error);
        },
        onError(error) {
          clearTimeout(timer);
          reject(error);
        },
      },
    );
    const timer = setTimeout(() => {
      output.abort();
      reject(new Error(`Static render timed out for ${path}`));
    }, 20000);
  });
}
