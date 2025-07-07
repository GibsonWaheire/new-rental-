
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

export const MaintenanceOverview = () => {
  const requests = [
    {
      id: 1,
      title: "Leaking Kitchen Faucet",
      tenant: "Mary Wanjiku",
      unit: "Royal Court - Unit 3A",
      priority: "Medium",
      status: "In Progress",
      dateSubmitted: "2024-01-08",
      estimatedCost: "KES 3,500"
    },
    {
      id: 2,
      title: "Broken Window Lock",
      tenant: "James Kiprotich", 
      unit: "Green Valley - Unit 12B",
      priority: "Low",
      status: "Pending",
      dateSubmitted: "2024-01-07",
      estimatedCost: "KES 1,200"
    },
    {
      id: 3,
      title: "Power Outlet Not Working",
      tenant: "Grace Achieng",
      unit: "Sunrise - Unit 2C", 
      priority: "High",
      status: "Open",
      dateSubmitted: "2024-01-09",
      estimatedCost: "KES 2,800"
    }
  ];

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Open':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Maintenance Requests</CardTitle>
        <Button size="sm" variant="outline">
          <Bell className="h-4 w-4 mr-2" />
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">{request.title}</h4>
                  <p className="text-sm text-gray-600">{request.tenant} • {request.unit}</p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <Badge className={getPriorityBadgeColor(request.priority)}>
                    {request.priority}
                  </Badge>
                  <Badge className={getStatusBadgeColor(request.status)}>
                    {request.status}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Submitted</p>
                  <p className="font-semibold">{new Date(request.dateSubmitted).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Est. Cost</p>
                  <p className="font-semibold text-orange-600">{request.estimatedCost}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
