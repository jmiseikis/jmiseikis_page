import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import ScrollManager from "@/components/site/ScrollManager";
import Index from "./pages/Index";
import De from "./pages/De";
import AdvisoryPage from "./pages/AdvisoryPage";
import SpeakingPage from "./pages/SpeakingPage";
import AboutPage from "./pages/AboutPage";
import ResourcesPage from "./pages/ResourcesPage";
import PublicationsPage from "./pages/PublicationsPage";
import DueDiligencePage from "./pages/DueDiligencePage";
import AiAgentsStrategy from "./pages/AiAgentsStrategy";
import SwissEcosystemGuide from "./pages/SwissEcosystemGuide";
import MarketEntryGuide from "./pages/MarketEntryGuide";
import NotFound from "./pages/NotFound";

// Data-heavy tools load on demand to keep the first page light.
const TechEvents = lazy(() => import("./pages/TechEvents"));
const SwissVCs = lazy(() => import("./pages/SwissVCs"));
const GZARobotics = lazy(() => import("./pages/GZARobotics"));
const RaasCalculator = lazy(() => import("./pages/RaasCalculator"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Directory and media feeds change rarely; avoid refetching on every visit or focus.
      staleTime: 10 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="jm-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollManager />
            <Suspense fallback={<div className="min-h-screen bg-background" />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/de" element={<De />} />
                <Route path="/advisory" element={<AdvisoryPage />} />
                <Route path="/speaking" element={<SpeakingPage />} />
                <Route path="/speaking-examples" element={<Navigate to="/speaking" replace />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/resources" element={<ResourcesPage />} />
                <Route path="/publications" element={<PublicationsPage />} />
                <Route path="/due-diligence" element={<DueDiligencePage />} />
                <Route path="/ai-agents-strategy" element={<AiAgentsStrategy />} />
                <Route path="/swiss-ai-robotics-ecosystem" element={<SwissEcosystemGuide />} />
                <Route path="/swiss-baltic-market-entry" element={<MarketEntryGuide />} />
                <Route path="/tech-events" element={<TechEvents />} />
                <Route path="/swiss-vcs" element={<SwissVCs />} />
                <Route path="/raas-calculator" element={<RaasCalculator />} />
                <Route path="/gza-robotics" element={<GZARobotics />} />
                {/* Swiss Tech Pulse was retired at the owner's request; its old paths fall through to NotFound. */}
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </HelmetProvider>
);

export default App;
