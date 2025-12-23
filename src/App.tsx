import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import MarketplacePage from "./pages/MarketplacePage";
import FarmerRegisterPage from "./pages/FarmerRegisterPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import SchemesPage from "./pages/SchemesPage";
import WeatherPage from "./pages/WeatherPage";
import MarketPricesPage from "./pages/MarketPricesPage";
import HelpCenterPage from "./pages/HelpCenterPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import UserDashboard from "./pages/UserDashboard";
import FarmerDashboard from "./pages/FarmerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/farmer/register" element={<FarmerRegisterPage />} />
            <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/schemes" element={<SchemesPage />} />
            <Route path="/weather" element={<WeatherPage />} />
            <Route path="/mandi-prices" element={<MarketPricesPage />} />
            <Route path="/help" element={<HelpCenterPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
