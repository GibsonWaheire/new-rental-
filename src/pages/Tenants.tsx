import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, FileSpreadsheet, FileText, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useTenantsData } from "@/hooks/useTenantsData";
import TenantsFilters from "@/components/tenants/TenantsFilters";
import TenantsTable from "@/components/tenants/TenantsTable";
import TenantsDialog from "@/components/tenants/TenantsDialog";
import { generateTenantsPDF } from "@/utils/pdf";
import type { ID, Tenant } from "@/types/entities";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Link, useLocation } from "react-router-dom";

export default function TenantsPage() {
  const { properties, propertyById, filtered, isLoading, isError, filters, setFilter, resetFilters, createTenant, updateTenant, archiveTenant, deleteTenantPermanent } = useTenantsData();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);
  const [confirmId, setConfirmId] = useState<ID | null>(null);
  const [confirmArchive, setConfirmArchive] = useState<{ id: ID; archived: boolean } | null>(null);

  const exportCSV = () => {
    const rows = [["Name", "Unit", "Phone", "Rent", "Status", "Payment", "Property"], ...filtered.map((t) => [
      t.name, t.unit, t.phone, String(t.rentAmount), t.status, t.paymentStatus, propertyById.get(t.propertyId)?.name ?? String(t.propertyId),
    ])];
    const escape = (val: unknown) => String(val).replace(/"/g, '""');
    const csv = rows.map((r) => r.map((v) => `"${escape(v)}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `tenants-${Date.now()}.csv`; a.click(); URL.revokeObjectURL(url);
  };
  const exportPDF = async () => {
    const map = new Map<number, string>(properties.map((p) => [p.id, p.name] as [number, string]));
    const blob = await generateTenantsPDF(filtered, map);
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `tenants-${Date.now()}.pdf`; a.click(); URL.revokeObjectURL(url);
  };

  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("status");
    if (status === "Active" || status === "Inactive") {
      setFilter("status", status as Tenant["status"]);
      setFilter("showArchived", false);
    }
    if (status === "Archived") {
      setFilter("status", undefined);
      setFilter("showArchived", true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  return (
    <Card>
      <CardHeader className="space-y-1.5 p-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <CardTitle className="text-lg font-semibold">Tenants</CardTitle>
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
          <Button asChild variant="outline">
            <Link to="/tenants/archive">View Archive</Link>
          </Button>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700"><Plus className="h-4 w-4 mr-2" /> Add Tenant</Button>
            </DialogTrigger>
            <TenantsDialog key={editing?.id ?? "new"} editing={editing} properties={properties} onSubmit={(values) => {
              if (editing) updateTenant.mutate({ id: editing.id, values }, { onSuccess: () => setOpen(false) });
              else createTenant.mutate(values as Omit<Tenant, "id">, { onSuccess: () => setOpen(false) });
            }} />
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <div>Loading...</div>}
        {isError && <div className="text-red-600">Failed to load tenants.</div>}
        {!isLoading && !isError && (
          <div className="w-full overflow-x-hidden">
            <TenantsTable
              data={filtered}
              propertyById={propertyById}
              onEdit={(t) => { setEditing(t); setOpen(true); }}
              onArchiveToggle={(id, archived) => setConfirmArchive({ id, archived })}
              onDelete={(id) => setConfirmId(id)}
            />
          </div>
        )}
      </CardContent>
      <ConfirmDialog
        open={confirmId !== null}
        title={"Delete tenant?"}
        message={"You are about to delete this item. It will be moved to Archive and can be permanently deleted later."}
        onCancel={() => setConfirmId(null)}
        onConfirm={async () => {
          if (confirmId != null) await archiveTenant.mutateAsync({ id: confirmId, archived: true });
          setConfirmId(null);
        }}
      />
      <ConfirmDialog
        open={confirmArchive !== null}
        title={confirmArchive?.archived ? "Unarchive tenant?" : "Archive tenant?"}
        message={confirmArchive?.archived ? "This will restore the tenant to the active list." : "This will move the tenant to the archive."}
        onCancel={() => setConfirmArchive(null)}
        onConfirm={async () => {
          if (!confirmArchive) return;
          await archiveTenant.mutateAsync({ id: confirmArchive.id, archived: confirmArchive.archived });
          setConfirmArchive(null);
        }}
      />
    </Card>
  );
}
