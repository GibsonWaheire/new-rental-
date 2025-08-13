import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, queryKeys } from "@/lib/api";
import type { ID, Lease, Payment, Property, Tenant } from "@/types/entities";
import { toast } from "@/components/ui/use-toast";

export type TenantSortBy = "name" | "rent" | "payment";

export interface TenantsFiltersState {
  search: string;
  status?: Tenant["status"];
  propertyId?: ID;
  sortBy: TenantSortBy;
  showArchived: boolean;
}

export function useTenantsData() {
  const qc = useQueryClient();
  const { data: tenants = [], isLoading, isError } = useQuery({ queryKey: queryKeys.resource("tenants"), queryFn: () => api.list("tenants") });
  const { data: properties = [] } = useQuery({ queryKey: queryKeys.resource("properties"), queryFn: () => api.list("properties") });

  const [filters, setFilters] = useState<TenantsFiltersState>({ search: "", status: undefined, propertyId: undefined, sortBy: "name", showArchived: false });

  const propertyById = useMemo(() => new Map(properties.map((p) => [p.id, p] as const)), [properties]);

  const filtered = useMemo(() => {
    let list = tenants.filter((t) => (filters.showArchived ? true : !t.archived));
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter((t) => [t.name, t.unit, t.phone, propertyById.get(t.propertyId)?.name]
        .filter(Boolean).some((v) => String(v).toLowerCase().includes(s)));
    }
    if (filters.status) list = list.filter((t) => t.status === filters.status);
    if (filters.propertyId) list = list.filter((t) => t.propertyId === filters.propertyId);
    switch (filters.sortBy) {
      case "rent": list = [...list].sort((a, b) => b.rentAmount - a.rentAmount); break;
      case "payment": list = [...list].sort((a, b) => a.paymentStatus.localeCompare(b.paymentStatus)); break;
      case "name": default: list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [tenants, filters, propertyById]);

  const createTenant = useMutation({
    mutationFn: (values: Omit<Tenant, "id">) => api.create("tenants", { ...values, archived: false } as Omit<Tenant, "id">),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.resource("tenants") }); toast({ title: "Tenant created" }); },
  });
  const updateTenant = useMutation({
    mutationFn: ({ id, values }: { id: ID; values: Partial<Tenant> }) => api.update("tenants", id, values),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.resource("tenants") }); toast({ title: "Tenant updated" }); },
  });
  const archiveTenant = useMutation({
    mutationFn: ({ id, archived }: { id: ID; archived: boolean }) => api.update("tenants", id, { archived }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.resource("tenants") }); toast({ title: "Tenant updated" }); },
  });
  const deleteTenantPermanent = useMutation({
    mutationFn: async (id: ID) => {
      const leases = await api.list("leases", { tenantId: id });
      await Promise.all((leases as Lease[]).map((l) => api.remove("leases", l.id)));
      const payments = await api.list("payments", { tenantId: id });
      await Promise.all((payments as Payment[]).map((p) => api.remove("payments", p.id)));
      await api.remove("tenants", id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.resource("tenants") });
      qc.invalidateQueries({ queryKey: queryKeys.resource("leases") });
      qc.invalidateQueries({ queryKey: queryKeys.resource("payments") });
      toast({ title: "Tenant permanently deleted" });
    },
  });

  function setFilter<K extends keyof TenantsFiltersState>(key: K, value: TenantsFiltersState[K]) { setFilters((prev) => ({ ...prev, [key]: value })); }
  function resetFilters() { setFilters({ search: "", status: undefined, propertyId: undefined, sortBy: "name", showArchived: false }); }

  return { tenants, properties, propertyById, filtered, isLoading, isError, filters, setFilter, resetFilters, createTenant, updateTenant, archiveTenant, deleteTenantPermanent } as const;
}


