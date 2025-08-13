import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Bell, Plus } from "lucide-react";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {location.pathname === "/" ? "Dashboard" : location.pathname.replace("/", "").replace(/^[a-z]/, (c) => c.toUpperCase())}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button asChild variant="outline" size="sm">
                <Link to="/notifications">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Link>
              </Button>
              <Button asChild className="bg-green-600 hover:bg-green-700" size="sm">
                <Link to="/quick-add">
                  <Plus className="h-4 w-4 mr-2" />
                  Quick Add
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


