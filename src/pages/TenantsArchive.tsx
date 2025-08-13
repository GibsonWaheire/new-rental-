import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, FileSpreadsheet, FileText } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useTenantsData } from "@/hooks/useTenantsData";
import TenantsFilters from "@/components/tenants/TenantsFilters";
import TenantsTable from "@/components/tenants/TenantsTable";
import { generateTenantsPDF } from "@/utils/pdf";
import type { ID } from "@/types/entities";

export default function TenantsArchivePage() {
  const { properties, propertyById, filtered, isLoading, isError, filters, setFilter, resetFilters, updateTenant, archiveTenant, deleteTenantPermanent } = useTenantsData();

  const archived = filtered.filter((t) => t.archived);
  const [confirmPermanentId, setConfirmPermanentId] = useState<ID | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<ID | null>(null);

  const exportCSV = () => {
    const rows = [["Name", "Unit", "Phone", "Rent", "Status", "Payment", "Property"], ...archived.map((t) => [
      t.name, t.unit, t.phone, String(t.rentAmount), t.status, t.paymentStatus, propertyById.get(t.propertyId)?.name ?? String(t.propertyId),
    ])];
    const escape = (val: unknown) => String(val).replace(/"/g, '""');
    const csv = rows.map((r) => r.map((v) => `"${escape(v)}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `tenants-archive-${Date.now()}.csv`; a.click(); URL.revokeObjectURL(url);
  };
  const exportPDF = async () => {
    const map = new Map<number, string>(properties.map((p) => [p.id, p.name] as [number, string]));
    const blob = await generateTenantsPDF(archived, map);
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `tenants-archive-${Date.now()}.pdf`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="space-y-1.5 p-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <CardTitle className="text-lg font-semibold">Tenants Archive</CardTitle>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <TenantsFilters
            search={filters.search}
            onSearchChange={(v) => setFilter("search", v)}
            properties={properties}
            status={filters.status}
            setStatus={(v) => setFilter("status", v)}
            propertyId={filters.propertyId}
            setPropertyId={(v) => setFilter("propertyId", v)}
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
        {isError && <div className="text-red-600">Failed to load tenants.</div>}
        {!isLoading && !isError && (
          <div className="w-full overflow-x-hidden">
            <TenantsTable
              data={archived}
              propertyById={propertyById}
              onEdit={(t) => updateTenant.mutate({ id: t.id, values: {} })}
              onArchiveToggle={(id) => setConfirmRestore(id)}
              onDelete={(id) => setConfirmPermanentId(id)}
            />
          </div>
        )}
      </CardContent>
      <ConfirmDialog
        open={confirmRestore !== null}
        title="Restore tenant?"
        message="This will restore the tenant to the active list."
        onCancel={() => setConfirmRestore(null)}
        onConfirm={async () => { if (confirmRestore != null) await archiveTenant.mutateAsync({ id: confirmRestore, archived: false }); setConfirmRestore(null); }}
      />
      <ConfirmDialog
        open={confirmPermanentId !== null}
        title="Permanently delete tenant?"
        message="This action will permanently remove the tenant and related data. This cannot be undone."
        onCancel={() => setConfirmPermanentId(null)}
        onConfirm={async () => { if (confirmPermanentId != null) await deleteTenantPermanent.mutateAsync(confirmPermanentId); setConfirmPermanentId(null); }}
      />
    </Card>
  );
}


