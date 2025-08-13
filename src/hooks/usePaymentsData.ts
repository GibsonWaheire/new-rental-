import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { api, queryKeys } from "@/lib/api";
import type { ID, Lease, Payment, Property, Tenant } from "@/types/entities";
import { generatePaymentReceiptPDF } from "@/utils/pdf";
import { isPaymentArchived } from "@/utils/paymentsHelpers";

export type SortBy = "date" | "amount" | "status";

export interface PaymentsFiltersState {
  showArchived: boolean;
  search: string;
  filterTenant?: number;
  filterLease?: number;
  filterMethod?: string;
  filterStatus?: string;
  filterFrom: string;
  filterTo: string;
  sortBy: SortBy;
}

export function usePaymentsData() {
  const qc = useQueryClient();

  const { data: payments = [], isLoading, isError } = useQuery({
    queryKey: queryKeys.resource("payments"),
    queryFn: () => api.list("payments", { _sort: "date", _order: "desc" }),
  });
  const { data: tenants = [] } = useQuery({ queryKey: queryKeys.resource("tenants"), queryFn: () => api.list("tenants") });
  const { data: leases = [] } = useQuery({ queryKey: queryKeys.resource("leases"), queryFn: () => api.list("leases") });
  const { data: properties = [] } = useQuery({ queryKey: queryKeys.resource("properties"), queryFn: () => api.list("properties") });

  const [filters, setFilters] = useState<PaymentsFiltersState>({
    showArchived: false,
    search: "",
    filterTenant: undefined,
    filterLease: undefined,
    filterMethod: undefined,
    filterStatus: undefined,
    filterFrom: "",
    filterTo: "",
    sortBy: "date",
  });

  const tenantById = useMemo(() => new Map(tenants.map((t) => [t.id, t])), [tenants]);
  const leaseById = useMemo(() => new Map(leases.map((l) => [l.id, l])), [leases]);
  const propertyById = useMemo(() => new Map(properties.map((p) => [p.id, p])), [properties]);

  const filtered = useMemo(() => {
    const { showArchived, search, filterTenant, filterLease, filterMethod, filterStatus, filterFrom, filterTo, sortBy } = filters;
    let list = payments.filter((p) => (showArchived ? true : !isPaymentArchived(p)));
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((p) => [
        tenantById.get(p.tenantId)?.name,
        propertyById.get(leaseById.get(p.leaseId)?.propertyId ?? -1)?.name,
        p.reference,
      ].filter(Boolean).some((v) => String(v).toLowerCase().includes(s)));
    }
    if (filterTenant) list = list.filter((p) => p.tenantId === filterTenant);
    if (filterLease) list = list.filter((p) => p.leaseId === filterLease);
    if (filterMethod) list = list.filter((p) => p.method === filterMethod);
    if (filterStatus) list = list.filter((p) => p.status === filterStatus);
    if (filterFrom) list = list.filter((p) => +new Date(p.date) >= +new Date(filterFrom));
    if (filterTo) list = list.filter((p) => +new Date(p.date) <= +new Date(filterTo));
    switch (sortBy) {
      case "amount": list = [...list].sort((a, b) => b.amount - a.amount); break;
      case "status": list = [...list].sort((a, b) => a.status.localeCompare(b.status)); break;
      case "date": default: list = [...list].sort((a, b) => +new Date(b.date) - +new Date(a.date));
    }
    return list;
  }, [payments, filters, tenantById, leaseById, propertyById]);

  const stats = useMemo(() => {
    const totalCount = filtered.length;
    let completedCount = 0; let pendingCount = 0; let overdueCount = 0;
    let totalAmount = 0;
    for (const p of filtered) {
      totalAmount += p.amount;
      if (p.status === "Completed") completedCount++;
      else if (p.status === "Pending") pendingCount++;
      else if (p.status === "Overdue") overdueCount++;
    }
    return { totalCount, completedCount, pendingCount, overdueCount, totalAmount } as const;
  }, [filtered]);

  const createPayment = useMutation({
    mutationFn: (values: Omit<Payment, "id">) => api.create("payments", { ...values, archived: false } as Omit<Payment, "id">),
    onSuccess: async (payment) => {
      qc.invalidateQueries({ queryKey: queryKeys.resource("payments") });
      toast({ title: "Payment created" });
      const blob = await generatePaymentReceiptPDF(
        payment as Payment,
        tenantById.get(payment.tenantId as ID),
        leaseById.get(payment.leaseId as ID),
        propertyById.get(leaseById.get(payment.leaseId as ID)?.propertyId ?? -1 as ID)
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `receipt-${payment.id}.pdf`; a.click(); URL.revokeObjectURL(url);
    },
  });

  const updatePayment = useMutation({
    mutationFn: ({ id, values }: { id: ID; values: Partial<Payment> }) => api.update("payments", id, values),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.resource("payments") }); toast({ title: "Payment updated" }); },
  });

  const deletePayment = useMutation({
    mutationFn: (id: ID) => api.remove("payments", id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.resource("payments") }); toast({ title: "Payment deleted" }); },
  });

  const archivePayment = useMutation({
    mutationFn: ({ id, archived }: { id: ID; archived: boolean }) => api.update("payments", id, { archived } as Partial<Payment>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.resource("payments") }); toast({ title: "Payment updated" }); },
  });

  async function bulkDelete(ids: ID[]) {
    await Promise.all(ids.map((id) => deletePayment.mutateAsync(id)));
  }
  async function bulkMarkPaid(ids: ID[]) {
    await Promise.all(ids.map((id) => updatePayment.mutateAsync({ id, values: { status: "Completed" } })));
  }

  function setFilter<K extends keyof PaymentsFiltersState>(key: K, value: PaymentsFiltersState[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function resetFilters() {
    setFilters({
      showArchived: false,
      search: "",
      filterTenant: undefined,
      filterLease: undefined,
      filterMethod: undefined,
      filterStatus: undefined,
      filterFrom: "",
      filterTo: "",
      sortBy: "date",
    });
  }

  function isArchived(p: Payment) { return isPaymentArchived(p); }

  return {
    // data
    payments, tenants, leases, properties,
    tenantById, leaseById, propertyById,
    filtered, isLoading, isError, stats,
    // filters
    filters, setFilter, resetFilters,
    // mutations and helpers
    createPayment, updatePayment, deletePayment, archivePayment,
    bulkDelete, bulkMarkPaid,
    isArchived,
  } as const;
}


