import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index     from "@/pages/Index";     // Dashboard / Landing
import Tenants   from "@/pages/Tenants";   // ⬅️  NEW PAGE
import NotFound  from "@/pages/NotFound";  // 404

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/"         element={<Index />} />
            <Route path="/tenants"  element={<Tenants />} /> {/* ⬅️ NEW ROUTE */}
            {/* add more routes here */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
