import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import RouteErrorBoundary from "@/components/RouteErrorBoundary";
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
import SwissTechPulse from "./pages/SwissTechPulse";
import SwissTechPulseAbout from "./pages/SwissTechPulseAbout";
import SwissTechPulseDigest from "./pages/SwissTechPulseDigest";
import SwissTechPulseReview from "./pages/SwissTechPulseReview";
import NotFound from "./pages/NotFound";

// Loaded on demand. The legal pages stay out of the main bundle so the privacy contact address ships only
// with them; the standalone content pages are split out to keep the first load small.
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("./pages/TermsOfUse"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const PublicationsPage = lazy(() => import("./pages/PublicationsPage"));
const ResourcesPage = lazy(() => import("./pages/ResourcesPage"));
const SwissEcosystemGuide = lazy(() => import("./pages/SwissEcosystemGuide"));
const MarketEntryGuide = lazy(() => import("./pages/MarketEntryGuide"));
const lazyPage = (page: React.ReactNode) => (
  <RouteErrorBoundary>
    <Suspense fallback={<div className="min-h-screen bg-background" />}>{page}</Suspense>
  </RouteErrorBoundary>
);

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
              <Route path="/about" element={lazyPage(<AboutPage />)} />
              <Route path="/publications" element={lazyPage(<PublicationsPage />)} />
              <Route path="/resources" element={lazyPage(<ResourcesPage />)} />
              <Route path="/swiss-ai-robotics-ecosystem" element={lazyPage(<SwissEcosystemGuide />)} />
              <Route path="/swiss-baltic-market-entry" element={lazyPage(<MarketEntryGuide />)} />
              <Route path="/privacy" element={lazyPage(<PrivacyPolicy />)} />
              <Route path="/terms" element={lazyPage(<TermsOfUse />)} />
              <Route path="/resources/swiss-tech-pulse" element={<SwissTechPulse />} />
              <Route path="/resources/swiss-tech-pulse/about" element={<SwissTechPulseAbout />} />
              <Route path="/resources/swiss-tech-pulse/digest/:week" element={<SwissTechPulseDigest />} />
              <Route path="/resources/swiss-tech-pulse/review" element={<SwissTechPulseReview />} />
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
