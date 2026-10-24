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
import TechEvents from "./pages/TechEvents";
import SwissVCs from "./pages/SwissVCs";
import RaasCalculator from "./pages/RaasCalculator";
import De from "./pages/De";
import AdvisoryPage from "./pages/AdvisoryPage";
import SpeakingPage from "./pages/SpeakingPage";
import DueDiligencePage from "./pages/DueDiligencePage";
import GZARobotics from "./pages/GZARobotics";
import AiAgentsStrategy from "./pages/AiAgentsStrategy";
import NotFound from "./pages/NotFound";
import WorksheetPage from "./pages/WorksheetPage";

// Loaded on demand. The legal pages stay out of the main bundle so the privacy contact address ships only
// with them; the standalone content pages are split out to keep the first load small.
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("./pages/TermsOfUse"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const PublicationsPage = lazy(() => import("./pages/PublicationsPage"));
const ResourcesPage = lazy(() => import("./pages/ResourcesPage"));
const SwissEcosystemGuide = lazy(() => import("./pages/SwissEcosystemGuide"));
const MarketEntryGuide = lazy(() => import("./pages/MarketEntryGuide"));

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <SiteShell>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/de" element={<De />} />
              <Route path="/advisory" element={<AdvisoryPage />} />
              <Route path="/speaking" element={<SpeakingPage />} />
              <Route path="/speaking-examples" element={<Navigate to="/speaking" replace />} />
              <Route path="/due-diligence" element={<DueDiligencePage />} />
              <Route path="/tech-events" element={<TechEvents />} />
              <Route path="/swiss-vcs" element={<SwissVCs />} />
              <Route path="/raas-calculator" element={<RaasCalculator />} />
              <Route path="/gza-robotics" element={<GZARobotics />} />
              <Route path="/ai-agents-strategy" element={<AiAgentsStrategy />} />
              <Route path="/about" element={lazyRoute("/about", <AboutPage />)} />
              <Route path="/publications" element={lazyRoute("/publications", <PublicationsPage />)} />
              <Route path="/resources" element={lazyRoute("/resources", <ResourcesPage />)} />
              <Route path="/swiss-ai-robotics-ecosystem" element={lazyRoute("/swiss-ai-robotics-ecosystem", <SwissEcosystemGuide />)} />
              <Route path="/swiss-baltic-market-entry" element={lazyRoute("/swiss-baltic-market-entry", <MarketEntryGuide />)} />
              <Route path="/worksheets/technology-scouting-brief" element={<WorksheetPage slug="technology-scouting-brief" />} />
              <Route path="/worksheets/market-entry-brief" element={<WorksheetPage slug="market-entry-brief" />} />
              <Route path="/worksheets/ai-workflow-pilot-brief" element={<WorksheetPage slug="ai-workflow-pilot-brief" />} />
              <Route path="/worksheets/technical-diligence-checklist" element={<WorksheetPage slug="technical-diligence-checklist" />} />
              <Route path="/privacy" element={lazyRoute("/privacy", <PrivacyPolicy />)} />
              <Route path="/terms" element={lazyRoute("/terms", <TermsOfUse />)} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SiteShell>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
