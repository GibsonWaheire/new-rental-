import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, queryKeys } from "@/lib/api";
import type { Tenant } from "@/types/entities";
import { Link } from "react-router-dom";

export const TenantOverview = () => {
  const { data: tenants = [], isLoading } = useQuery({ queryKey: queryKeys.resource("tenants"), queryFn: () => api.list("tenants", { _limit: 5 }) });
  const getPaymentBadgeColor = (status: Tenant["paymentStatus"]) => status === "Paid" ? "bg-green-100 text-green-800" : status === "Overdue" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Recent Tenants</CardTitle>
        <Button asChild size="sm" variant="outline">
          <Link to="/tenants">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && <div className="text-sm text-muted-foreground">Loading tenants...</div>}
        {!isLoading && (tenants as Tenant[]).length === 0 && (
          <div className="text-sm text-muted-foreground">No tenants yet.</div>
        )}
        <div className="space-y-4">
          {(tenants as Tenant[]).filter((t) => !t.archived).map((tenant) => (
            <div key={tenant.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{tenant.name}</h4>
                  <p className="text-sm text-gray-600">{tenant.unit}</p>
                  <p className="text-sm text-gray-500">{tenant.phone}</p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <Badge variant="default" className="bg-blue-100 text-blue-800">{tenant.status}</Badge>
                  <Badge className={getPaymentBadgeColor(tenant.paymentStatus)}>{tenant.paymentStatus}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Monthly Rent</p>
                  <p className="font-semibold text-green-600">KES {tenant.rentAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Lease Ends</p>
                  <p className="font-semibold">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
