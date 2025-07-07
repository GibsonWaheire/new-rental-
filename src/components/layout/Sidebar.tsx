
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
  Bell
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const menuItems = [
    { icon: Home, label: "Dashboard", active: true, count: null },
    { icon: MapPin, label: "Properties", active: false, count: 5 },
    { icon: User, label: "Tenants", active: false, count: 23 },
    { icon: Calendar, label: "Leases", active: false, count: 18 },
    { icon: FileText, label: "Payments", active: false, count: null },
    { icon: Bell, label: "Maintenance", active: false, count: 3 },
    { icon: Settings, label: "Settings", active: false, count: null },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-20 ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
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

      {/* Toggle Button */}
      <div className="p-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onToggle}
          className="w-full justify-center"
        >
          {isOpen ? '←' : '→'}
        </Button>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.label}
            variant={item.active ? "default" : "ghost"}
            className={`w-full justify-start h-12 ${
              item.active 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {isOpen && (
              <>
                <span className="ml-3 flex-1 text-left">{item.label}</span>
                {item.count && (
                  <Badge variant="secondary" className="ml-2">
                    {item.count}
                  </Badge>
                )}
              </>
            )}
          </Button>
        ))}
      </nav>

      {/* User Profile */}
      {isOpen && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
                <p className="text-xs text-gray-500">Property Owner</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
