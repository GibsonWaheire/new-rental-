// src/components/Sidebar.tsx
import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  User,
  Calendar,
  Settings,
  MapPin,
  FileText,
  Bell,
  Plus,
} from "lucide-react";
import { useSidebarCounts } from "@/hooks/useSidebarCounts";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const counts = useSidebarCounts();
  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: MapPin, label: "Properties", path: "/properties" },
    { icon: User, label: "Tenants", path: "/tenants", count: counts.tenants },
    { icon: Calendar, label: "Leases", path: "/leases", count: counts.leases },
    { icon: FileText, label: "Payments", path: "/payments", count: counts.payments },
    { icon: Bell, label: "Maintenance", path: "/maintenance", count: counts.maintenance },
    { icon: Settings, label: "Settings", path: "/settings" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
    { icon: Plus, label: "Quick Add", path: "/quick-add" },
  ];

  return (
  <div
    className={clsx(
      "fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-20",
      isOpen ? "w-64" : "w-16"
    )}
  >
    {/* Logo */}
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
          <Home className="h-5 w-5 text-white" />
        </div>
        {isOpen && (
          <div>
            <h2 className="font-bold text-lg text-gray-900">KenRent</h2>
            <p className="text-xs text-gray-500">Manager</p>
          </div>
        )}
      </div>
    </div>

    {/* Toggle button */}
    <div className="p-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="w-full justify-center"
      >
        {isOpen ? "←" : "→"}
      </Button>
    </div>

    <Separator />

    {/* Navigation */}
    <nav className="p-4 space-y-2">
      {menuItems.map(({ icon: Icon, label, path, count }) => (
        <NavLink
          key={label}
          to={path}
          className={({ isActive }) =>
            clsx(
              "flex items-center rounded-lg w-full h-12 px-3 py-2 transition-colors",
              isActive
                ? "bg-green-600 text-white hover:bg-green-700"
                : "text-gray-700 hover:bg-gray-100"
            )
          }
        >
          <Icon className="h-5 w-5" />
          {isOpen && (
            <>
              <span className="ml-3 flex-1 text-left">{label}</span>
              {typeof count === "number" && (
                <Badge variant="secondary" className="ml-2">
                  {count}
                </Badge>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>

    {/* User profile */}
    {isOpen && (
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                John Doe
              </p>
              <p className="text-xs text-gray-500">Property Owner</p>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
  );
};
