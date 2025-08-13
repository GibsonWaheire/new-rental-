import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, queryKeys } from "@/lib/api";
import type { Payment, Tenant } from "@/types/entities";
import { Link } from "react-router-dom";

export const PaymentOverview = ({ compact = false }: { compact?: boolean }) => {
  const { data: payments = [], isLoading } = useQuery<Payment[]>({ queryKey: queryKeys.resource("payments"), queryFn: () => api.list("payments", { _sort: "date", _order: "desc", _limit: 5 }) });
  const { data: tenants = [] } = useQuery<Tenant[]>({ queryKey: queryKeys.resource("tenants"), queryFn: () => api.list("tenants") });
  const tenantById = new Map(tenants.map((t) => [t.id, t] as const));

  const getStatusBadgeColor = (status: Payment["status"]) => status === "Completed" ? "bg-green-100 text-green-800" : status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800";
  const getMethodIcon = (method: Payment["method"]) => method === "M-Pesa" ? "📱" : method === "Bank Transfer" ? "🏦" : method === "Cash" ? "💵" : "💳";

  return (
    <Card>
      <CardHeader className={`flex flex-row items-center justify-between ${compact ? "py-3" : ""}`}>
        <CardTitle className="text-lg font-semibold">Recent Payments</CardTitle>
        <Button asChild size="sm" variant="outline">
          <Link to="/payments">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && <div className="text-sm text-muted-foreground">Loading payments...</div>}
        {!isLoading && payments.length === 0 && (
          <div className="text-sm text-muted-foreground">No recent payments.</div>
        )}
        <div className="space-y-4">
          {payments.filter((p) => !p.archived).map((payment) => (
            <div key={payment.id} className={`border rounded-lg ${compact ? "p-3" : "p-4"} hover:bg-gray-50 transition-colors`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">{tenantById.get(payment.tenantId)?.name ?? payment.tenantId}</h4>
                  <p className="text-sm text-gray-600">Ref: {payment.reference}</p>
                </div>
                <Badge className={getStatusBadgeColor(payment.status)}>
                  {payment.status}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Amount</p>
                  <p className="font-semibold text-green-600">KES {payment.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Method</p>
                  <p className="font-semibold flex items-center">
                    <span className="mr-1">{getMethodIcon(payment.method)}</span>
                    {payment.method}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Date</p>
                  <p className="font-semibold">{new Date(payment.date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
