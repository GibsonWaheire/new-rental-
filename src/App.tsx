import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import AppLayout from "@/layouts/AppLayout";
import Index from "@/pages/Index";
import Tenants from "@/pages/Tenants";
import Properties from "@/pages/Properties";
import Leases from "@/pages/Leases";
import Notifications from "@/pages/Notifications";
import Settings from "@/pages/Settings";
import Payments from "@/pages/Payments";
import Maintenance from "@/pages/Maintenance";
import QuickAdd from "@/pages/QuickAdd";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<Index />} />
              <Route path="properties" element={<Properties />} />
              <Route path="tenants" element={<Tenants />} />
              <Route path="leases" element={<Leases />} />
              <Route path="payments" element={<Payments />} />
              <Route path="maintenance" element={<Maintenance />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
              <Route path="quick-add" element={<QuickAdd />} />
              {/* Upcoming pages to be added step-by-step: payments, maintenance, settings, quick-add */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
