import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import TechEvents from "./pages/TechEvents";
import SwissVCs from "./pages/SwissVCs";
import RaasCalculator from "./pages/RaasCalculator";
import De from "./pages/De";
import AdvisoryPage from "./pages/AdvisoryPage";
import SpeakingPage from "./pages/SpeakingPage";
import DueDiligencePage from "./pages/DueDiligencePage";
import GZARobotics from "./pages/GZARobotics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
