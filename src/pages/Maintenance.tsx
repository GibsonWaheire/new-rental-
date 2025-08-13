import { useQuery } from "@tanstack/react-query";
import { api, queryKeys } from "@/lib/api";
import type { MaintenanceRequest } from "@/types/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function MaintenancePage() {
  const { data: requests = [], isLoading, isError } = useQuery({
    queryKey: queryKeys.resource("maintenanceRequests"),
    queryFn: () => api.list("maintenanceRequests", { _sort: "dateSubmitted", _order: "desc" }),
  });

  const statusClass = (status: MaintenanceRequest["status"]) =>
    status === "Completed"
      ? "bg-green-100 text-green-800"
      : status === "In Progress"
      ? "bg-blue-100 text-blue-800"
      : status === "Pending"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-gray-100 text-gray-800";

  const priorityClass = (priority: MaintenanceRequest["priority"]) =>
    priority === "Critical"
      ? "bg-red-100 text-red-800"
      : priority === "High"
      ? "bg-orange-100 text-orange-800"
      : priority === "Medium"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-green-100 text-green-800";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <div>Loading...</div>}
        {isError && <div className="text-red-600">Failed to load maintenance requests.</div>}
        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Est. Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r: MaintenanceRequest) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.title}</TableCell>
                    <TableCell>{r.propertyId}</TableCell>
                    <TableCell>{r.tenantId ?? "-"}</TableCell>
                    <TableCell><Badge className={priorityClass(r.priority)}>{r.priority}</Badge></TableCell>
                    <TableCell><Badge className={statusClass(r.status)}>{r.status}</Badge></TableCell>
                    <TableCell>{new Date(r.dateSubmitted).toLocaleDateString()}</TableCell>
                    <TableCell className="text-orange-700">{r.estimatedCost?.toLocaleString() ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


