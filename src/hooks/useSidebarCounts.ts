import { useQuery } from "@tanstack/react-query";
import { api, queryKeys } from "@/lib/api";
import type { Lease, MaintenanceRequest, Payment, Tenant } from "@/types/entities";

export function useSidebarCounts() {
  const tenantsQ = useQuery({ queryKey: queryKeys.resource("tenants"), queryFn: () => api.list("tenants") });
  const leasesQ = useQuery({ queryKey: queryKeys.resource("leases"), queryFn: () => api.list("leases") });
  const paymentsQ = useQuery({ queryKey: queryKeys.resource("payments"), queryFn: () => api.list("payments") });
  const maintenanceQ = useQuery({ queryKey: queryKeys.resource("maintenanceRequests"), queryFn: () => api.list("maintenanceRequests") });

  const tenants = (tenantsQ.data as Tenant[] | undefined) ?? [];
  const leases = (leasesQ.data as Lease[] | undefined) ?? [];
  const payments = (paymentsQ.data as Payment[] | undefined) ?? [];
  const maintenance = (maintenanceQ.data as MaintenanceRequest[] | undefined) ?? [];

  const activeCount = (arr: { archived?: boolean }[]) => arr.filter((x) => !x.archived).length;

  return {
    tenants: activeCount(tenants),
    leases: activeCount(leases),
    payments: activeCount(payments),
    maintenance: activeCount(maintenance),
    isLoading: tenantsQ.isLoading || leasesQ.isLoading || paymentsQ.isLoading || maintenanceQ.isLoading,
  } as const;
}


