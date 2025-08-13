import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, queryKeys } from "@/lib/api";
import type { MaintenanceRequest, Tenant, Property } from "@/types/entities";
import { Link } from "react-router-dom";

export const MaintenanceOverview = () => {
  const { data: requests = [], isLoading } = useQuery({ queryKey: queryKeys.resource("maintenanceRequests"), queryFn: () => api.list("maintenanceRequests", { _sort: "dateSubmitted", _order: "desc", _limit: 5 }) });
  const { data: tenants = [] } = useQuery({ queryKey: queryKeys.resource("tenants"), queryFn: () => api.list("tenants") });
  const { data: properties = [] } = useQuery({ queryKey: queryKeys.resource("properties"), queryFn: () => api.list("properties") });
  const tById = new Map((tenants as Tenant[]).map((t) => [t.id, t] as const));
  const pById = new Map((properties as Property[]).map((p) => [p.id, p] as const));

  const getPriorityBadgeColor = (priority: MaintenanceRequest["priority"]) => {
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

  const getStatusBadgeColor = (status: MaintenanceRequest["status"]) => {
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
        <Button asChild size="sm" variant="outline">
          <Link to="/maintenance">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && <div className="text-sm text-muted-foreground">Loading requests...</div>}
        {!isLoading && (requests as MaintenanceRequest[]).length === 0 && (
          <div className="text-sm text-muted-foreground">No recent requests.</div>
        )}
        <div className="space-y-4">
          {(requests as MaintenanceRequest[]).filter((r) => !r.archived).map((request) => (
            <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">{request.title}</h4>
                  <p className="text-sm text-gray-600">{tById.get(request.tenantId ?? -1)?.name ?? "-"} • {pById.get(request.propertyId)?.name ?? request.propertyId}</p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <Badge className={getPriorityBadgeColor(request.priority)}>{request.priority}</Badge>
                  <Badge className={getStatusBadgeColor(request.status)}>{request.status}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Submitted</p>
                  <p className="font-semibold">{new Date(request.dateSubmitted).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Est. Cost</p>
                  <p className="font-semibold text-orange-600">{request.estimatedCost != null ? `KES ${request.estimatedCost.toLocaleString()}` : "-"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
