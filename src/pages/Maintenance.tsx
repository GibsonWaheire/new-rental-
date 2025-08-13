import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { FileDown, FileSpreadsheet, FileText, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ConfirmDialog from "@/components/ConfirmDialog";
import MaintenanceFilters from "@/components/maintenance/MaintenanceFilters";
import MaintenanceTable from "@/components/maintenance/MaintenanceTable";
import MaintenanceDialog from "@/components/maintenance/MaintenanceDialog";
import { useMaintenanceData } from "@/hooks/useMaintenanceData";
import { exportMaintenanceCSV, exportMaintenancePDF } from "@/utils/maintenanceExport";
import type { ID, MaintenanceRequest } from "@/types/entities";

export default function MaintenancePage() {
  const { properties, tenants, filtered, propertyById, tenantById, isLoading, isError, filters, setFilter, resetFilters, createRequest, updateRequest, deleteRequest, archiveRequest } = useMaintenanceData();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MaintenanceRequest | null>(null);
  const [confirmId, setConfirmId] = useState<ID | null>(null);
  const [confirmArchive, setConfirmArchive] = useState<{ id: ID; archived: boolean } | null>(null);

  return (
    <Card>
      <CardHeader className="space-y-1.5 p-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Maintenance</CardTitle>
          <p className="text-sm text-muted-foreground">{filtered.length} result{filtered.length === 1 ? "" : "s"}</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <MaintenanceFilters
            search={filters.search}
            onSearchChange={(v) => setFilter("search", v)}
            properties={properties}
            tenants={tenants}
            status={filters.status}
            setStatus={(v) => setFilter("status", v)}
            priority={filters.priority}
            setPriority={(v) => setFilter("priority", v)}
            propertyId={filters.propertyId}
            setPropertyId={(v) => setFilter("propertyId", v)}
            tenantId={filters.tenantId}
            setTenantId={(v) => setFilter("tenantId", v)}
            from={filters.from}
            setFrom={(v) => setFilter("from", v)}
            to={filters.to}
            setTo={(v) => setFilter("to", v)}
            sortBy={filters.sortBy}
            setSortBy={(v) => setFilter("sortBy", v)}
            onReset={resetFilters}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline"><FileDown className="h-4 w-4 mr-2" /> Export</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => exportMaintenanceCSV(filtered, propertyById, tenantById)}><FileSpreadsheet className="h-4 w-4 mr-2" /> CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportMaintenancePDF(filtered, propertyById, tenantById)}><FileText className="h-4 w-4 mr-2" /> PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
            <DialogTrigger asChild><Button className="bg-green-600 hover:bg-green-700"><Plus className="h-4 w-4 mr-2" /> Add Request</Button></DialogTrigger>
            <MaintenanceDialog key={editing?.id ?? "new"} editing={editing} properties={properties} tenants={tenants} onSubmit={(values) => {
              if (editing) updateRequest.mutate({ id: editing.id, values }, { onSuccess: () => setOpen(false) });
              else createRequest.mutate(values as unknown as Omit<MaintenanceRequest, "id">, { onSuccess: () => setOpen(false) });
            }} />
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <div>Loading...</div>}
        {isError && <div className="text-red-600">Failed to load maintenance requests.</div>}
        {!isLoading && !isError && (
          <div className="w-full overflow-x-hidden">
            <MaintenanceTable
              data={filtered}
              propertyById={propertyById}
              tenantById={tenantById}
              onEdit={(r) => { setEditing(r); setOpen(true); }}
              onArchiveToggle={(id, archived) => setConfirmArchive({ id, archived })}
              onDelete={(id) => setConfirmId(id)}
              onExportPDF={() => { /* per-row export optional */ }}
            />
          </div>
        )}
      </CardContent>
      <ConfirmDialog
        open={confirmId !== null}
        title={"Delete request?"}
        message={"This will permanently remove the request."}
        onCancel={() => setConfirmId(null)}
        onConfirm={async () => {
          if (confirmId != null) await deleteRequest.mutateAsync(confirmId);
          setConfirmId(null);
        }}
      />
      <ConfirmDialog
        open={confirmArchive !== null}
        title={confirmArchive?.archived ? "Unarchive request?" : "Archive request?"}
        message={confirmArchive?.archived ? "This will unarchive the request." : "This will archive the request."}
        onCancel={() => setConfirmArchive(null)}
        onConfirm={async () => {
          if (!confirmArchive) return;
          await archiveRequest.mutateAsync({ id: confirmArchive.id, archived: confirmArchive.archived });
          setConfirmArchive(null);
        }}
      />
    </Card>
  );
}


