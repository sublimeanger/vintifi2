import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AppShell } from "./components/app/AppShell";
import Dashboard from "./pages/Dashboard";
import Vintography from "./pages/Vintography";
import Sell from "./pages/Sell";
import Listings from "./pages/Listings";
import PriceCheck from "./pages/PriceCheck";
import Optimize from "./pages/Optimize";
import Trends from "./pages/Trends";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Landing page — no AppShell */}
          <Route path="/" element={<Index />} />

          {/* Protected app routes — wrapped in AppShell */}
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vintography" element={<Vintography />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/price-check" element={<PriceCheck />} />
            <Route path="/optimize" element={<Optimize />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
