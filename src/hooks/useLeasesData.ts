import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, queryKeys } from "@/lib/api";
import type { ID, Lease, LeaseDocument, Property, Tenant } from "@/types/entities";
import { toast } from "@/components/ui/use-toast";

export type LeasesSortBy = "start" | "end" | "rent";

export interface LeasesFiltersState {
  search: string;
  status?: "Active" | "Expired" | "Pending Renewal" | "Pending" | "Archived";
  propertyId?: ID;
  tenantId?: ID;
  sortBy: LeasesSortBy;
  showArchived: boolean;
}

export function useLeasesData() {
  const qc = useQueryClient();
  const { data: leases = [], isLoading, isError } = useQuery({ queryKey: queryKeys.resource("leases"), queryFn: () => api.list("leases") });
  const { data: tenants = [] } = useQuery({ queryKey: queryKeys.resource("tenants"), queryFn: () => api.list("tenants") });
  const { data: properties = [] } = useQuery({ queryKey: queryKeys.resource("properties"), queryFn: () => api.list("properties") });

  const [filters, setFilters] = useState<LeasesFiltersState>({ search: "", status: undefined, propertyId: undefined, tenantId: undefined, sortBy: "end", showArchived: false });

  const tenantById = useMemo(() => new Map(tenants.map((t) => [t.id, t] as const)), [tenants]);
  const propertyById = useMemo(() => new Map(properties.map((p) => [p.id, p] as const)), [properties]);

  const computedStatus = (l: Lease): "Active" | "Expired" | "Pending Renewal" | "Pending" => {
    const now = new Date();
    const end = new Date(l.endDate);
    const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return "Expired";
    if (days <= 30) return "Pending Renewal";
    if (l.status === "Pending") return "Pending";
    return "Active";
  };

  const filtered = useMemo(() => {
    const includeArchived = filters.showArchived || filters.status === "Archived";
    let list = leases.filter((l) => (includeArchived ? true : !(l as unknown as { archived?: boolean }).archived));
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter((l) => [propertyById.get(l.propertyId)?.name, tenantById.get(l.tenantId)?.name, l.unit].filter(Boolean).some((v) => String(v).toLowerCase().includes(s)));
    }
    if (filters.status === "Archived") {
      list = list.filter((l) => (l as unknown as { archived?: boolean }).archived);
    } else if (filters.status) {
      list = list.filter((l) => computedStatus(l) === filters.status);
    }
    if (filters.propertyId) list = list.filter((l) => l.propertyId === filters.propertyId);
    if (filters.tenantId) list = list.filter((l) => l.tenantId === filters.tenantId);
    switch (filters.sortBy) {
      case "start": list = [...list].sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate)); break;
      case "rent": list = [...list].sort((a, b) => b.rentAmount - a.rentAmount); break;
      case "end": default: list = [...list].sort((a, b) => +new Date(a.endDate) - +new Date(b.endDate));
    }
    return list;
  }, [leases, filters, propertyById, tenantById]);

  const createLease = useMutation({
    mutationFn: (values: Omit<Lease, "id">) => api.create("leases", { ...values, archived: false } as Omit<Lease, "id">),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.resource("leases") }); toast({ title: "Lease created" }); },
  });
  const updateLease = useMutation({
    mutationFn: ({ id, values }: { id: ID; values: Partial<Lease> }) => api.update("leases", id, values),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.resource("leases") }); toast({ title: "Lease updated" }); },
  });
  const archiveLease = useMutation({
    mutationFn: ({ id, archived }: { id: ID; archived: boolean }) => api.update("leases", id, { archived } as Partial<Lease>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.resource("leases") }); toast({ title: "Lease updated" }); },
  });
  const deleteLeasePermanent = useMutation({
    mutationFn: async (id: ID) => {
      const docs = await api.list("leaseDocuments", { leaseId: id });
      await Promise.all((docs as LeaseDocument[]).map((d) => api.remove("leaseDocuments", d.id)));
      await api.remove("leases", id);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.resource("leases") }); toast({ title: "Lease permanently deleted" }); },
  });

  function setFilter<K extends keyof LeasesFiltersState>(key: K, value: LeasesFiltersState[K]) { setFilters((prev) => ({ ...prev, [key]: value })); }
  function resetFilters() { setFilters({ search: "", status: undefined, propertyId: undefined, tenantId: undefined, sortBy: "end", showArchived: false }); }

  return { leases, tenants, properties, tenantById, propertyById, filtered, computedStatus, isLoading, isError, filters, setFilter, resetFilters, createLease, updateLease, archiveLease, deleteLeasePermanent } as const;
}


