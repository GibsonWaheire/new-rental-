
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Home, 
  User, 
  Calendar, 
  Bell, 
  Settings,
  Plus,
  Search,
  MapPin
} from "lucide-react";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { PropertyOverview } from "@/components/property/PropertyOverview";
import { TenantOverview } from "@/components/tenant/TenantOverview";
import { PaymentOverview } from "@/components/payment/PaymentOverview";
import { MaintenanceOverview } from "@/components/maintenance/MaintenanceOverview";
import { Sidebar } from "@/components/layout/Sidebar";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's what's happening with your properties.</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Quick Add
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 space-y-6">
          {/* Dashboard Metrics */}
          <DashboardMetrics />

          {/* Overview Sections */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <PropertyOverview />
            <TenantOverview />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <PaymentOverview />
            <MaintenanceOverview />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
