import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { api, queryKeys } from "@/lib/api";
import type { Property, Tenant, Lease, Payment, MaintenanceRequest } from "@/types/entities";
import { useNavigate } from "react-router-dom";

export const DashboardMetrics = ({ compact = false }: { compact?: boolean }) => {
  const navigate = useNavigate();
  const { data: tenants = [] } = useQuery<Tenant[]>({ queryKey: queryKeys.resource("tenants"), queryFn: () => api.list("tenants") });
  const { data: leases = [] } = useQuery<Lease[]>({ queryKey: queryKeys.resource("leases"), queryFn: () => api.list("leases") });
  const { data: payments = [] } = useQuery<Payment[]>({ queryKey: queryKeys.resource("payments"), queryFn: () => api.list("payments") });
  const { data: maintenance = [] } = useQuery<MaintenanceRequest[]>({ queryKey: queryKeys.resource("maintenanceRequests"), queryFn: () => api.list("maintenanceRequests") });
  const { data: properties = [] } = useQuery<Property[]>({ queryKey: queryKeys.resource("properties"), queryFn: () => api.list("properties") });

  const activeTenants = tenants.filter((t) => !t.archived && t.status === "Active").length;
  const pendingPayments = payments.filter((p) => !p.archived && p.status === "Pending").length;
  const overduePayments = payments.filter((p) => !p.archived && p.status === "Overdue").length;
  const openMaintenance = maintenance.filter((m) => !m.archived && m.status !== "Completed").length;
  const upcomingRenewals = leases.filter((l) => {
    const end = new Date(l.endDate).getTime();
    const now = Date.now();
    const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return !l.archived && days <= 30 && days >= 0;
  }).length;
  const totalProperties = properties.filter((p) => !p.archived).length;
  const revenueThisMonth = payments
    .filter((p) => !p.archived && p.status === "Completed" && new Date(p.date).getMonth() === new Date().getMonth() && new Date(p.date).getFullYear() === new Date().getFullYear())
    .reduce((sum, p) => sum + p.amount, 0);

  const cards = [
    { title: "Active Tenants", value: String(activeTenants), icon: "👥", onClick: () => navigate(`/tenants?status=Active`) },
    { title: "Pending Payments", value: String(pendingPayments), icon: "🧾", onClick: () => navigate(`/payments?status=Pending`) },
    { title: "Overdue Payments", value: String(overduePayments), icon: "⚠️", onClick: () => navigate(`/payments?status=Overdue`) },
    { title: "Open Maintenance", value: String(openMaintenance), icon: "🛠️", onClick: () => navigate(`/maintenance?status=Open`) },
    { title: "Upcoming Renewals", value: String(upcomingRenewals), icon: "📅", onClick: () => navigate(`/leases?status=Pending%20Renewal`) },
    { title: "Properties", value: String(totalProperties), icon: "🏢", onClick: () => navigate(`/properties`) },
    { title: "Revenue (mo)", value: `KES ${revenueThisMonth.toLocaleString()}`, icon: "💰", onClick: () => navigate(`/payments?status=Completed`) },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((c) => (
        <Card key={c.title} className="hover:shadow-md transition-shadow cursor-pointer" onClick={c.onClick}>
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${compact ? "pb-1" : "pb-2"}`}>
            <CardTitle className="text-sm font-medium text-gray-600">{c.title}</CardTitle>
            <span className={compact ? "text-xl" : "text-2xl"}>{c.icon}</span>
          </CardHeader>
          <CardContent>
            <div className={`${compact ? "text-xl" : "text-2xl"} font-bold text-gray-900 mb-1`}>{c.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
