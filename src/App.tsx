import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { OnboardingModal } from "@/components/auth/OnboardingModal";
import Landing from "@/pages/Landing";
import Trending from "@/pages/Trending";
import Planner from "@/pages/Planner";
import Itinerary from "@/pages/Itinerary";
import SharedItinerary from "@/pages/SharedItinerary";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import DestinationDetail from "@/pages/DestinationDetail";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <Navbar />
        <OnboardingModal />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/itinerary" element={<Itinerary />} />
          <Route path="/itinerary/:id" element={<SharedItinerary />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/destination/:id" element={<DestinationDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
