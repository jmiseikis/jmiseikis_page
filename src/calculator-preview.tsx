import { useEffect } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { StaticRouter } from "react-router-dom/server";
import RaasCalculator from "./pages/RaasCalculator";
import "./index.css";

const PUBLIC_ORIGIN = "https://jmiseikis.com";
const PREFIX = "raas-preview-";

/** This wrapper is used only by the downloadable preview, never by the production route. */
function PreviewFrame() {
  useEffect(() => {
    const makeLinksPublic = () => {
      document.querySelectorAll<HTMLAnchorElement>('a[href^="/"]').forEach((link) => {
        const path = link.getAttribute("href");
        if (path && !path.startsWith("//")) {
          link.href = new URL(path, PUBLIC_ORIGIN).href;
          link.dataset.previewPublicLink = "true";
        }
      });
    };
    // React Router links keep their original handler even when the href is changed.
    // Stop that handler in this preview so normal native navigation uses the public URL.
    const leavePreview = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const link = target?.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;
      const path = link.getAttribute("href");
      if (path?.startsWith("/") && !path.startsWith("//")) {
        link.href = new URL(path, PUBLIC_ORIGIN).href;
        link.dataset.previewPublicLink = "true";
      }
      if (link.dataset.previewPublicLink === "true") event.stopPropagation();
    };
    makeLinksPublic();
    const observer = new MutationObserver(makeLinksPublic);
    observer.observe(document.getElementById("root")!, { childList: true, subtree: true });
    document.addEventListener("click", leavePreview, true);
    return () => {
      observer.disconnect();
      document.removeEventListener("click", leavePreview, true);
    };
  }, []);

  return (
    <>
      <a href="#preview-main" className="preview-skip">Skip to calculator</a>
      <header className="preview-header">
        <div className="site-wrap preview-header-inner">
          <a className="preview-brand" href="https://jmiseikis.com/">JUSTINAS MIŠEIKIS</a>
          <span className="preview-status">Guided calculator · Working preview</span>
        </div>
      </header>
      <main id="preview-main" tabIndex={-1}>
        <RaasCalculator />
      </main>
      <footer className="site-wrap preview-note">
        This standalone preview calculates locally and uses illustrative inputs. Links to other website pages open jmiseikis.com.
        The production route is <a className="underline" href="https://jmiseikis.com/raas-calculator">jmiseikis.com/raas-calculator</a>.
      </footer>
      <Helmet>
        <title>Robotics Cost and ROI Calculator | Working preview</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://jmiseikis.com/raas-calculator" />
      </Helmet>
    </>
  );
}

export function CalculatorPreview({ staticRender = false }: { staticRender?: boolean } = {}) {
  return (
    <HelmetProvider>
      {staticRender ? (
        <StaticRouter location="/raas-calculator"><PreviewFrame /></StaticRouter>
      ) : (
        <MemoryRouter initialEntries={["/raas-calculator"]}><PreviewFrame /></MemoryRouter>
      )}
    </HelmetProvider>
  );
}

if (typeof document !== "undefined") {
  const container = document.getElementById("root");
  if (container) {
    const options = { identifierPrefix: PREFIX };
    if (container.querySelector("main")) hydrateRoot(container, <CalculatorPreview />, options);
    else createRoot(container, options).render(<CalculatorPreview />);
  }
}
