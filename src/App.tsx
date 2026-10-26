import { lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { lazyRoute } from "@/components/LazyRoute";
import SiteShell from "@/components/site/SiteShell";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Every page except the home page and the 404 loads on demand, so a visitor downloads the code for the page they
// open rather than the whole site. The legal pages in particular stay out of the main bundle, so the privacy
// contact address ships only with them. scripts/prerender-meta.mjs renders the same routes into static HTML.
const De = lazy(() => import("./pages/De"));
const AdvisoryPage = lazy(() => import("./pages/AdvisoryPage"));
const SpeakingPage = lazy(() => import("./pages/SpeakingPage"));
const DueDiligencePage = lazy(() => import("./pages/DueDiligencePage"));
const AiAgentsStrategy = lazy(() => import("./pages/AiAgentsStrategy"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const PublicationsPage = lazy(() => import("./pages/PublicationsPage"));
const ResourcesPage = lazy(() => import("./pages/ResourcesPage"));
const SwissEcosystemGuide = lazy(() => import("./pages/SwissEcosystemGuide"));
const MarketEntryGuide = lazy(() => import("./pages/MarketEntryGuide"));
const WorksheetPage = lazy(() => import("./pages/WorksheetPage"));
const RaasCalculator = lazy(() => import("./pages/RaasCalculator"));
const TechEvents = lazy(() => import("./pages/TechEvents"));
const SwissVCs = lazy(() => import("./pages/SwissVCs"));
const GZARobotics = lazy(() => import("./pages/GZARobotics"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("./pages/TermsOfUse"));

/** The shell and routes, shared by the browser app and the build-time renderer (src/entry-server.tsx). */
export const SiteApplication = () => (
  <SiteShell>
    <Toaster />
    <Sonner />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/de" element={lazyRoute("/de", <De />)} />
      <Route path="/advisory" element={lazyRoute("/advisory", <AdvisoryPage />)} />
      <Route path="/speaking" element={lazyRoute("/speaking", <SpeakingPage />)} />
      <Route path="/speaking-examples" element={<Navigate to="/speaking" replace />} />
      <Route path="/due-diligence" element={lazyRoute("/due-diligence", <DueDiligencePage />)} />
      <Route path="/tech-events" element={lazyRoute("/tech-events", <TechEvents />)} />
      <Route path="/swiss-vcs" element={lazyRoute("/swiss-vcs", <SwissVCs />)} />
      <Route path="/raas-calculator" element={lazyRoute("/raas-calculator", <RaasCalculator />)} />
      <Route path="/gza-robotics" element={lazyRoute("/gza-robotics", <GZARobotics />)} />
      <Route path="/ai-agents-strategy" element={lazyRoute("/ai-agents-strategy", <AiAgentsStrategy />)} />
      <Route path="/about" element={lazyRoute("/about", <AboutPage />)} />
      <Route path="/publications" element={lazyRoute("/publications", <PublicationsPage />)} />
      <Route path="/resources" element={lazyRoute("/resources", <ResourcesPage />)} />
      <Route path="/swiss-ai-robotics-ecosystem" element={lazyRoute("/swiss-ai-robotics-ecosystem", <SwissEcosystemGuide />)} />
      <Route path="/swiss-baltic-market-entry" element={lazyRoute("/swiss-baltic-market-entry", <MarketEntryGuide />)} />
      <Route path="/worksheets/technology-scouting-brief" element={lazyRoute("/worksheets/technology-scouting-brief", <WorksheetPage slug="technology-scouting-brief" />)} />
      <Route path="/worksheets/market-entry-brief" element={lazyRoute("/worksheets/market-entry-brief", <WorksheetPage slug="market-entry-brief" />)} />
      <Route path="/worksheets/ai-workflow-pilot-brief" element={lazyRoute("/worksheets/ai-workflow-pilot-brief", <WorksheetPage slug="ai-workflow-pilot-brief" />)} />
      <Route path="/worksheets/technical-diligence-checklist" element={lazyRoute("/worksheets/technical-diligence-checklist", <WorksheetPage slug="technical-diligence-checklist" />)} />
      <Route path="/privacy" element={lazyRoute("/privacy", <PrivacyPolicy />)} />
      <Route path="/terms" element={lazyRoute("/terms", <TermsOfUse />)} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </SiteShell>
);

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <SiteApplication />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
