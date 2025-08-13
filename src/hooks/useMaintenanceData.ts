import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, queryKeys } from "@/lib/api";
import type { ID, MaintenanceRequest, Property, Tenant } from "@/types/entities";
import { toast } from "@/components/ui/use-toast";

export type MaintenanceSortBy = "date" | "priority" | "status" | "cost";

export interface MaintenanceFiltersState {
  search: string;
  propertyId?: ID;
  tenantId?: ID;
  status?: MaintenanceRequest["status"];
  priority?: MaintenanceRequest["priority"];
  from: string;
  to: string;
  showArchived: boolean;
  sortBy: MaintenanceSortBy;
}

export function useMaintenanceData() {
  const qc = useQueryClient();

  const { data: requests = [], isLoading, isError } = useQuery({
    queryKey: queryKeys.resource("maintenanceRequests"),
    queryFn: () => api.list("maintenanceRequests", { _sort: "dateSubmitted", _order: "desc" }),
  });
  const { data: properties = [] } = useQuery({ queryKey: queryKeys.resource("properties"), queryFn: () => api.list("properties") });
  const { data: tenants = [] } = useQuery({ queryKey: queryKeys.resource("tenants"), queryFn: () => api.list("tenants") });

  const [filters, setFilters] = useState<MaintenanceFiltersState>({
    search: "",
    propertyId: undefined,
    tenantId: undefined,
    status: undefined,
    priority: undefined,
    from: "",
    to: "",
    showArchived: false,
    sortBy: "date",
  });

  const propertyById = useMemo(() => new Map(properties.map((p) => [p.id, p])), [properties]);
  const tenantById = useMemo(() => new Map(tenants.map((t) => [t.id, t])), [tenants]);

  const filtered = useMemo(() => {
    let list = requests.filter((r) => (filters.showArchived ? true : !r.archived));
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter((r) => [r.title, propertyById.get(r.propertyId)?.name, tenantById.get(r.tenantId ?? -1)?.name]
        .filter(Boolean).some((v) => String(v).toLowerCase().includes(s)));
    }
    if (filters.propertyId) list = list.filter((r) => r.propertyId === filters.propertyId);
    if (filters.tenantId) list = list.filter((r) => r.tenantId === filters.tenantId);
    if (filters.status) list = list.filter((r) => r.status === filters.status);
    if (filters.priority) list = list.filter((r) => r.priority === filters.priority);
    if (filters.from) list = list.filter((r) => +new Date(r.dateSubmitted) >= +new Date(filters.from));
    if (filters.to) list = list.filter((r) => +new Date(r.dateSubmitted) <= +new Date(filters.to));
    switch (filters.sortBy) {
      case "priority": list = [...list].sort((a, b) => a.priority.localeCompare(b.priority)); break;
      case "status": list = [...list].sort((a, b) => a.status.localeCompare(b.status)); break;
      case "cost": list = [...list].sort((a, b) => (b.estimatedCost ?? 0) - (a.estimatedCost ?? 0)); break;
      case "date": default: list = [...list].sort((a, b) => +new Date(b.dateSubmitted) - +new Date(a.dateSubmitted));
    }
    return list;
  }, [requests, filters, propertyById, tenantById]);

  const createRequest = useMutation({
    mutationFn: (body: Omit<MaintenanceRequest, "id">) => api.create("maintenanceRequests", { ...body, archived: false } as Omit<MaintenanceRequest, "id">),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.resource("maintenanceRequests") }); toast({ title: "Request created" }); },
  });
  const updateRequest = useMutation({
    mutationFn: ({ id, values }: { id: ID; values: Partial<MaintenanceRequest> }) => api.update("maintenanceRequests", id, values),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.resource("maintenanceRequests") }); toast({ title: "Request updated" }); },
  });
  const deleteRequest = useMutation({
    mutationFn: (id: ID) => api.remove("maintenanceRequests", id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.resource("maintenanceRequests") }); toast({ title: "Request deleted" }); },
  });
  const archiveRequest = useMutation({
    mutationFn: ({ id, archived }: { id: ID; archived: boolean }) => api.update("maintenanceRequests", id, { archived } as Partial<MaintenanceRequest>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.resource("maintenanceRequests") }); toast({ title: "Request updated" }); },
  });

  function setFilter<K extends keyof MaintenanceFiltersState>(key: K, value: MaintenanceFiltersState[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }
  function resetFilters() {
    setFilters({ search: "", propertyId: undefined, tenantId: undefined, status: undefined, priority: undefined, from: "", to: "", showArchived: false, sortBy: "date" });
  }

  return { properties, tenants, requests, filtered, propertyById, tenantById, isLoading, isError, filters, setFilter, resetFilters, createRequest, updateRequest, deleteRequest, archiveRequest } as const;
}


