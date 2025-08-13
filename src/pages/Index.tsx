import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Home, 
  PieChart, 
  Calendar, 
  Wallet, 
  AlertCircle, 
  Wrench, 
  TrendingUp,
  FileText,
  Download,
  RefreshCw
} from "lucide-react";

import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { PropertyOverview } from "@/components/property/PropertyOverview";
import { TenantOverview } from "@/components/tenant/TenantOverview";
import { PaymentOverview } from "@/components/payment/PaymentOverview";
import { MaintenanceOverview } from "@/components/maintenance/MaintenanceOverview";

export default function DashboardPage() {
  const [compact, setCompact] = useState(false);
  const [activeTab, setActiveTab] = useState("properties");

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Optimize occupancy. Maximize cash flow.
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Track occupancy, rent collection, lease health, and maintenance—everything you need to manage your portfolio confidently.
        </p>
      </div>

      {/* Module Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1">
          <TabsTrigger 
            value="properties" 
            className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
          >
            Properties
          </TabsTrigger>
          <TabsTrigger 
            value="leases" 
            className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
          >
            Leases
          </TabsTrigger>
          <TabsTrigger 
            value="payments" 
            className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
          >
            Payments
          </TabsTrigger>
          <TabsTrigger 
            value="maintenance" 
            className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
          >
            Maintenance
          </TabsTrigger>
        </TabsList>

        {/* Properties Tab */}
        <TabsContent value="properties" className="space-y-6">
          {/* KPI Cards Grid */}
          <DashboardMetrics compact={compact} />
          
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-8 w-8 text-green-600" />
                      <span className="text-2xl font-bold text-green-800">13</span>
                    </div>
                    <p className="text-green-700 font-medium">Active now</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Home className="h-8 w-8 text-blue-600" />
                      <span className="text-2xl font-bold text-blue-800">30</span>
                    </div>
                    <p className="text-blue-700 font-medium">In portfolio</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <PieChart className="h-8 w-8 text-purple-600" />
                    <span className="text-2xl font-bold text-purple-800">63.3%</span>
                  </div>
                  <p className="text-purple-700 font-medium">19/30 units</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '63.3%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-8 w-8 text-orange-600" />
                    <span className="text-2xl font-bold text-orange-800">KES 638,895</span>
                  </div>
                  <p className="text-orange-700 font-medium">This month</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Wallet className="h-8 w-8 text-emerald-600" />
                    <span className="text-2xl font-bold text-emerald-800">KES 29,351</span>
                  </div>
                  <p className="text-emerald-700 font-medium">This month</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                    <span className="text-2xl font-bold text-red-800">KES 609,544</span>
                  </div>
                  <p className="text-red-700 font-medium">Pending rent</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-cyan-50 to-cyan-100">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Wallet className="h-8 w-8 text-cyan-600" />
                    <span className="text-2xl font-bold text-cyan-800">KES 58,890</span>
                  </div>
                  <p className="text-cyan-700 font-medium">Surplus</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Wrench className="h-8 w-8 text-amber-600" />
                    <span className="text-2xl font-bold text-amber-800">1</span>
                  </div>
                  <p className="text-amber-700 font-medium">Open / recent</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rent Collection Trend Chart */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-800">
                  Rent Collection Trend Last 6 months
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-64 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <TrendingUp className="h-12 w-12 text-green-600 mx-auto" />
                    <p className="text-green-700 font-medium">Chart Component</p>
                    <p className="text-sm text-green-600">Rent collection visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Status Breakdown */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-800">
                  Payment Status Invoices breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">Total invoices: 85</p>
                  </div>
                  <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <PieChart className="h-12 w-12 text-blue-600 mx-auto" />
                      <p className="text-blue-700 font-medium">Donut Chart</p>
                      <p className="text-sm text-blue-600">Payment status visualization</p>
                    </div>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Closed 72</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Pending 13</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Cancelled 0</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Properties Overview */}
          <PropertyOverview compact={compact} />
          
          {/* Tenants Overview */}
          <TenantOverview compact={compact} />
        </TabsContent>

        {/* Leases Tab */}
        <TabsContent value="leases" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">Leases Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <FileText className="h-12 w-12 text-blue-600 mx-auto" />
                  <p className="text-blue-700 font-medium">Leases Dashboard</p>
                  <p className="text-sm text-blue-600">Coming soon...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <PaymentOverview compact={compact} />
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-6">
          <MaintenanceOverview compact={compact} />
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Ready</span>
            <span>•</span>
            <span>Accessibility: Good to go</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
