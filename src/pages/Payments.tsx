import { useEffect, useState } from "react";
import type { ID, Payment } from "@/types/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { FileDown, FileSpreadsheet, FileText, List, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ConfirmDialog from "@/components/ConfirmDialog";
import PaymentsFilters from "@/components/payments/PaymentsFilters";
import PaymentsTable from "@/components/payments/PaymentsTable";
import PaymentDialog from "@/components/payments/PaymentDialog";
import { usePaymentsData } from "@/hooks/usePaymentsData";
import { exportPaymentsCSV, exportPaymentsPDF } from "@/utils/paymentsExport";
import { generatePaymentReceiptPDF } from "@/utils/pdf";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "react-router-dom";
import { formatAmountKES } from "@/utils/paymentsHelpers";

export default function PaymentsPage() {
  const { tenants, leases, tenantById, leaseById, propertyById, filtered, isLoading, isError, filters, setFilter, resetFilters, stats, createPayment, updatePayment, deletePayment, archivePayment, bulkDelete, bulkMarkPaid, isArchived } = usePaymentsData();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [selected, setSelected] = useState<Set<ID>>(new Set());
  const [confirmPaymentId, setConfirmPaymentId] = useState<ID | null>(null);
  const [confirmArchive, setConfirmArchive] = useState<{ id: ID; archived: boolean } | null>(null);
  const [compact, setCompact] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = compact ? 10 : 7;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const location = useLocation();
  useEffect(() => {
    setPage(1);
  }, [filters, compact]);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("status");
    if (status) setFilter("filterStatus", status);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  return (
    <Card className="h-[calc(100vh-2rem)] flex flex-col">
      <CardHeader className="space-y-1.5 p-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Payments</CardTitle>
          <p className="text-sm text-muted-foreground">{filtered.length} result{filtered.length === 1 ? "" : "s"}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Total: {formatAmountKES(stats.totalAmount)}</Badge>
            <Badge className="bg-green-100 text-green-800">Completed: {stats.completedCount}</Badge>
            <Badge className="bg-yellow-100 text-yellow-800">Pending: {stats.pendingCount}</Badge>
            <Badge className="bg-red-100 text-red-800">Overdue: {stats.overdueCount}</Badge>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <PaymentsFilters
            search={filters.search}
            onSearchChange={(v) => setFilter("search", v)}
            tenants={tenants}
            leases={leases}
            filterTenant={filters.filterTenant}
            setFilterTenant={(v) => setFilter("filterTenant", v)}
            filterLease={filters.filterLease}
            setFilterLease={(v) => setFilter("filterLease", v)}
            filterMethod={filters.filterMethod}
            setFilterMethod={(v) => setFilter("filterMethod", v)}
            filterStatus={filters.filterStatus}
            setFilterStatus={(v) => setFilter("filterStatus", v)}
            filterFrom={filters.filterFrom}
            setFilterFrom={(v) => setFilter("filterFrom", v)}
            filterTo={filters.filterTo}
            setFilterTo={(v) => setFilter("filterTo", v)}
            sortBy={filters.sortBy}
            setSortBy={(v) => setFilter("sortBy", v)}
          />
          <Button variant={compact ? "secondary" : "outline"} onClick={() => setCompact((v) => !v)}>
            <List className="h-4 w-4 mr-2" /> {compact ? "Compact On" : "Compact Off"}
          </Button>
          <Button variant="outline" onClick={() => setFilter("showArchived", !filters.showArchived)}>{filters.showArchived ? "Hide Archived" : "Show Archived"}</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline"><FileDown className="h-4 w-4 mr-2" /> Export</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => exportPaymentsCSV(filtered, tenantById, leaseById, propertyById)}><FileSpreadsheet className="h-4 w-4 mr-2" /> CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportPaymentsPDF(filtered, tenantById, leaseById, propertyById)}><FileText className="h-4 w-4 mr-2" /> PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild variant="outline">
            <Link to="/payments?status=Archived">View Archive</Link>
          </Button>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
            <DialogTrigger asChild><Button className="bg-green-600 hover:bg-green-700"><Plus className="h-4 w-4 mr-2" /> Add Payment</Button></DialogTrigger>
            <PaymentDialog key={editing?.id ?? "new"} editing={editing} tenants={tenants} leases={leases} onSubmit={(values) => {
              if (editing) {
                updatePayment.mutate({ id: editing.id, values }, { onSuccess: () => setOpen(false) });
              } else {
                createPayment.mutate(values as unknown as Omit<Payment, "id">, { onSuccess: () => setOpen(false) });
              }
            }} />
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-hidden">
        {isLoading && <div>Loading...</div>}
        {isError && <div className="text-red-600">Failed to load payments.</div>}
        {!isLoading && !isError && (
          <div className="w-full h-full overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 mb-2 shrink-0">
              <Button variant="outline" onClick={() => setSelected(new Set())}>Clear Selection</Button>
              <Button variant="outline" onClick={() => setConfirmPaymentId(-1 as ID)} disabled={selected.size === 0}>Bulk Archive</Button>
              <Button variant="outline" onClick={() => bulkMarkPaid([...selected])} disabled={selected.size === 0}>Mark Paid</Button>
            </div>
            <div className="flex-1 min-h-0 w-full overflow-hidden rounded-md">
              <PaymentsTable
                data={pageData}
                compact={compact}
                selected={selected}
                setSelected={setSelected}
                tenantById={tenantById}
                leaseById={leaseById}
                propertyById={propertyById}
                onEdit={(p) => { setEditing(p); setOpen(true); }}
                onArchiveToggle={(id, archived) => setConfirmArchive({ id, archived })}
                onDelete={(id) => setConfirmPaymentId(id)}
                onMarkPaid={(id) => updatePayment.mutate({ id, values: { status: "Completed" } })}
                isArchived={isArchived}
                onViewReceipt={async (p) => {
                  const blob = await generatePaymentReceiptPDF(p, tenantById.get(p.tenantId), leaseById.get(p.leaseId), propertyById.get(leaseById.get(p.leaseId)?.propertyId ?? -1 as ID));
                  const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `receipt-${p.id}.pdf`; a.click(); URL.revokeObjectURL(url);
                }}
                containerClassName="w-full max-w-full"
              />
            </div>
            <div className="mt-2 flex items-center justify-between shrink-0">
              <div className="text-xs text-muted-foreground">Page {page} of {totalPages}</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <ConfirmDialog
        open={confirmPaymentId !== null}
        title={confirmPaymentId === -1 ? "Archive selected payments?" : "Archive payment?"}
        message={confirmPaymentId === -1 ? "You are about to delete these items. They will be moved to Archive and can be permanently deleted later." : "You are about to delete this item. It will be moved to Archive and can be permanently deleted later."}
        onCancel={() => setConfirmPaymentId(null)}
        onConfirm={async () => {
          if (confirmPaymentId === -1) { await bulkDelete([...selected]); setSelected(new Set()); }
          else if (confirmPaymentId != null) { await archivePayment.mutateAsync({ id: confirmPaymentId, archived: true }); }
          setConfirmPaymentId(null);
        }}
      />
      <ConfirmDialog
        open={confirmArchive !== null}
        title={confirmArchive?.archived ? "Unarchive payment?" : "Archive payment?"}
        message={confirmArchive?.archived ? "This will unarchive the payment." : "This will archive the payment."}
        onCancel={() => setConfirmArchive(null)}
        onConfirm={async () => {
          if (!confirmArchive) return;
          await archivePayment.mutateAsync({ id: confirmArchive.id, archived: confirmArchive.archived });
          setConfirmArchive(null);
        }}
      />
    </Card>
  );
}

