import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ConfirmDialog";
import LeasesFilters from "@/components/leases/LeasesFilters";
import LeasesTable from "@/components/leases/LeasesTable";
import { useLeasesData } from "@/hooks/useLeasesData";
import type { ID, Lease } from "@/types/entities";
import { FileDown, FileSpreadsheet, FileText } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { generateLeasePDF } from "@/utils/pdf";

export default function LeasesArchivePage() {
  const { tenants, properties, tenantById, propertyById, filtered, computedStatus, isLoading, isError, filters, setFilter, resetFilters, updateLease, archiveLease, deleteLeasePermanent } = useLeasesData();
  const archived = filtered.filter((l) => (l as unknown as { archived?: boolean }).archived);
  const [confirmPermanentId, setConfirmPermanentId] = useState<ID | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<ID | null>(null);

  const exportCSV = () => {
    const rows = [["Property","Tenant","Unit","Period","Rent","Status"], ...archived.map((l) => [
      propertyById.get(l.propertyId)?.name ?? l.propertyId,
      tenantById.get(l.tenantId)?.name ?? l.tenantId,
      l.unit,
      `${new Date(l.startDate).toLocaleDateString()} - ${new Date(l.endDate).toLocaleDateString()}`,
      String(l.rentAmount),
      computedStatus(l),
    ])];
    const escape = (val: unknown) => String(val).replace(/"/g, '""');
    const csv = rows.map((r) => r.map((v) => `"${escape(v)}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `leases-archive-${Date.now()}.csv`; a.click(); URL.revokeObjectURL(url);
  };
  const exportPDF = async () => {
    const blob = await (async () => {
      const items = archived.slice(0, 50);
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const margin = 40; doc.setFontSize(18); doc.text("Leases (Archive)", margin, margin); doc.setDrawColor(220); doc.line(margin, margin+8, doc.internal.pageSize.getWidth()-margin, margin+8);
      doc.setFontSize(10); const headers = ["Property","Tenant","Unit","Period","Rent","Status"]; const colWidths = [120, 120, 70, 140, 80, 80]; let x=margin; let y=margin+28; headers.forEach((h,i)=>{doc.text(h,x,y); x+=colWidths[i];}); y+=16;
      items.forEach((l)=>{ x=margin; const cells=[ propertyById.get(l.propertyId)?.name ?? String(l.propertyId), tenantById.get(l.tenantId)?.name ?? String(l.tenantId), l.unit, `${new Date(l.startDate).toLocaleDateString()} - ${new Date(l.endDate).toLocaleDateString()}`, `KES ${l.rentAmount.toLocaleString()}`, computedStatus(l) ]; cells.forEach((c,i)=>{doc.text(String(c),x,y); x+=colWidths[i];}); y+=16; });
      return doc.output("blob") as Blob;
    })();
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `leases-archive-${Date.now()}.pdf`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="space-y-1.5 p-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <CardTitle>Leases Archive</CardTitle>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <LeasesFilters
            search={filters.search}
            onSearchChange={(v) => setFilter("search", v)}
            properties={properties}
            tenants={tenants}
            status={filters.status}
            setStatus={(v) => setFilter("status", v)}
            propertyId={filters.propertyId}
            setPropertyId={(v) => setFilter("propertyId", v)}
            tenantId={filters.tenantId}
            setTenantId={(v) => setFilter("tenantId", v)}
            sortBy={filters.sortBy}
            setSortBy={(v) => setFilter("sortBy", v)}
            onReset={resetFilters}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline"><FileDown className="h-4 w-4 mr-2" /> Export</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={exportCSV}><FileSpreadsheet className="h-4 w-4 mr-2" /> CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={exportPDF}><FileText className="h-4 w-4 mr-2" /> PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <div>Loading...</div>}
        {isError && <div className="text-red-600">Failed to load leases.</div>}
        {!isLoading && !isError && (
          <div className="w-full overflow-x-hidden">
            <LeasesTable
              data={archived}
              propertyById={propertyById}
              tenantById={tenantById}
              computedStatus={computedStatus}
              onEdit={(l) => updateLease.mutate({ id: l.id, values: {} })}
              onArchiveToggle={(id) => setConfirmRestore(id)}
              onDelete={(id) => setConfirmPermanentId(id)}
              onDownload={(l) => { /* optional */ }}
              onRenew={(l) => { /* optional */ }}
              onReminder={(l) => { /* optional */ }}
            />
          </div>
        )}
      </CardContent>
      <ConfirmDialog
        open={confirmRestore !== null}
        title="Restore lease?"
        message="This will restore the lease to the active list."
        onCancel={() => setConfirmRestore(null)}
        onConfirm={async () => { if (confirmRestore != null) await archiveLease.mutateAsync({ id: confirmRestore, archived: false }); setConfirmRestore(null); }}
      />
      <ConfirmDialog
        open={confirmPermanentId !== null}
        title="Permanently delete lease?"
        message="This action will permanently remove the lease and its documents. This cannot be undone."
        onCancel={() => setConfirmPermanentId(null)}
        onConfirm={async () => { if (confirmPermanentId != null) await deleteLeasePermanent.mutateAsync(confirmPermanentId); setConfirmPermanentId(null); }}
      />
    </Card>
  );
}


