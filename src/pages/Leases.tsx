import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "react-router-dom";

import { api, queryKeys } from "@/lib/api";
import type { Lease, Tenant, Property, ID, LeaseDocument, Notification } from "@/types/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import { generateLeasePDF } from "@/utils/pdf";
import LeasesFilters from "@/components/leases/LeasesFilters";
import LeasesTable from "@/components/leases/LeasesTable";
import { useLeasesData, type LeasesSortBy } from "../hooks/useLeasesData";

type SortKey = "start" | "end" | "rent";

interface LeaseDocumentMeta {
  id: ID;
  leaseId: ID;
  name: string;
  mimeType: string;
  size: number;
  dataUrl: string; // stored as data URI for mock backend
}

const leaseSchema = z.object({
  propertyId: z.coerce.number().int().positive(),
  tenantId: z.coerce.number().int().positive(),
  unit: z.string().min(1),
  startDate: z.string().min(4),
  endDate: z.string().min(4),
  rentAmount: z.coerce.number().nonnegative(),
  status: z.enum(["Active", "Terminated", "Pending"]).default("Active"),
});

type LeaseFormValues = z.infer<typeof leaseSchema>;

function useLeases() {
  return useQuery({ queryKey: queryKeys.resource("leases"), queryFn: () => api.list("leases") });
}
function useTenants() {
  return useQuery({ queryKey: queryKeys.resource("tenants"), queryFn: () => api.list("tenants") });
}
function useProperties() {
  return useQuery({ queryKey: queryKeys.resource("properties"), queryFn: () => api.list("properties") });
}

export default function LeasesPage() {
  const qc = useQueryClient();
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("status");
    const allowed = ["Active","Expired","Pending Renewal","Pending","Archived"] as const;
    if (status && (allowed as readonly string[]).includes(status)) {
      setFilter("status", status as (typeof allowed)[number]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);
  const { tenants, properties, tenantById, propertyById, filtered, computedStatus, isLoading, isError, filters, setFilter, resetFilters, createLease, updateLease, archiveLease, deleteLeasePermanent } = useLeasesData();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Lease | null>(null);
  const [renewing, setRenewing] = useState<Lease | null>(null);
  

  

  // Mutations provided by useLeasesData hook: createLease, updateLease, archiveLease, deleteLeasePermanent

  const exportPDF = async (l: Lease) => {
    const blob = await generateLeasePDF(l, tenantById.get(l.tenantId), propertyById.get(l.propertyId));
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `lease-${l.id}.pdf`; a.click(); URL.revokeObjectURL(url);
  };

  const sendExpiryReminder = useMutation({
    mutationFn: async (l: Lease) => {
      const body: Omit<Notification, "id"> = {
        title: "Lease expiry reminder",
        message: `Lease ${l.id} for ${tenantById.get(l.tenantId)?.name ?? l.tenantId} ends on ${new Date(l.endDate).toLocaleDateString()}`,
        createdAt: new Date().toISOString(),
        read: false,
        type: "warning",
        archived: false,
      };
      return api.create<"notifications">("notifications", body);
    },
    onSuccess: () => toast({ title: "Reminder sent" }),
    onError: (e: unknown) => toast({ title: "Reminder failed", description: String(e) }),
  });

  const [confirmLeaseId, setConfirmLeaseId] = useState<ID | null>(null);
  const [confirmArchive, setConfirmArchive] = useState<{ id: ID; archived: boolean } | null>(null);

  return (
    <Card>
      <CardHeader className="space-y-1.5 p-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <CardTitle>Leases</CardTitle>
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
            setSortBy={(v) => setFilter("sortBy", v as LeasesSortBy)}
            onReset={resetFilters}
          />
          <Button asChild variant="outline">
            <Link to="/leases/archive">View Archive</Link>
          </Button>
          <Button variant="outline" onClick={() => setFilter("showArchived", !filters.showArchived)}>{filters.showArchived ? "Hide Archived" : "Show Archived"}</Button>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">Add Lease</Button>
            </DialogTrigger>
            <LeaseDialog
              key={editing?.id ?? "new"}
              editing={editing}
              tenants={tenants}
              properties={properties}
              onSubmit={(values) => {
                if (editing) updateLease.mutate({ id: editing.id, values }); else createLease.mutate(values as Omit<Lease, "id">);
              }}
            />
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <div>Loading...</div>}
        {isError && <div className="text-red-600">Failed to load leases.</div>}
        {!isLoading && !isError && (
          <div className="w-full overflow-x-hidden">
            <LeasesTable
              data={filtered}
              propertyById={propertyById}
              tenantById={tenantById}
              computedStatus={computedStatus}
              onEdit={(l) => { setEditing(l); setOpen(true); }}
              onArchiveToggle={(id, archived) => setConfirmArchive({ id, archived })}
              onDelete={(id) => setConfirmLeaseId(id)}
              onDownload={(l) => exportPDF(l)}
              onRenew={(l) => setRenewing(l)}
              onReminder={(l) => sendExpiryReminder.mutate(l)}
            />
          </div>
        )}
      </CardContent>

          <Dialog open={!!renewing} onOpenChange={(v) => { if (!v) setRenewing(null); }}>
        <DialogContent>
          {renewing && (
            <LeaseRenewDialog
              base={renewing}
              tenants={tenants}
              properties={properties}
              onSubmit={(values) => createLease.mutate(values as Omit<Lease, "id">)}
            />
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={confirmLeaseId !== null}
        title="Archive lease?"
        message="You are about to delete this item. It will be moved to Archive and can be permanently deleted later."
        onCancel={() => setConfirmLeaseId(null)}
        onConfirm={async () => {
          if (confirmLeaseId == null) return;
          await archiveLease.mutateAsync({ id: confirmLeaseId, archived: true });
          setConfirmLeaseId(null);
        }}
      />
      <ConfirmDialog
        open={confirmArchive !== null}
        title={confirmArchive?.archived ? "Unarchive lease?" : "Archive lease?"}
        message={confirmArchive?.archived ? "This will unarchive the lease." : "This will archive the lease."}
        onCancel={() => setConfirmArchive(null)}
        onConfirm={async () => {
          if (!confirmArchive) return;
          await archiveLease.mutateAsync({ id: confirmArchive.id, archived: confirmArchive.archived });
          setConfirmArchive(null);
        }}
      />
    </Card>
  );
}

function LeaseRow({ lease, propertyName, tenantName, status, onEdit, onArchive, onDelete, onDownload, onRenew, onReminder }: {
  lease: Lease;
  propertyName: string;
  tenantName: string;
  status: string;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onDownload: () => void;
  onRenew: () => void;
  onReminder: () => void;
}) {
  const [docsOpen, setDocsOpen] = useState(false);
  return (
    <TableRow className="odd:bg-gray-50 hover:bg-gray-100/60">
      <TableCell>{propertyName}</TableCell>
      <TableCell>{tenantName}</TableCell>
      <TableCell>{lease.unit}</TableCell>
      <TableCell>{new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}</TableCell>
      <TableCell className="text-green-700 text-right tabular-nums whitespace-nowrap">KES {lease.rentAmount.toLocaleString()}</TableCell>
      <TableCell>
        <Badge className={`${status === "Expired" ? "bg-red-100 text-red-800" : status === "Pending Renewal" ? "bg-yellow-100 text-yellow-800" : status === "Pending" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"} uppercase tracking-wide px-2 py-0.5`}>
          {status}
        </Badge>
      </TableCell>
      <TableCell className="text-right space-x-2">
        <Button variant="outline" size="sm" onClick={onEdit}>Edit</Button>
        <Button variant="outline" size="sm" onClick={onArchive}>{(lease as unknown as { archived?: boolean }).archived ? "Unarchive" : "Archive"}</Button>
        <Button variant="outline" size="sm" onClick={onDownload}>Download</Button>
        <Button variant="outline" size="sm" onClick={onRenew}>Renew</Button>
        <Button variant="outline" size="sm" onClick={onReminder}>Reminder</Button>
        <Dialog open={docsOpen} onOpenChange={setDocsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">Docs</Button>
          </DialogTrigger>
          <LeaseDocuments leaseId={lease.id} />
        </Dialog>
        <Button variant="destructive" size="sm" onClick={onDelete}>Delete</Button>
      </TableCell>
    </TableRow>
  );
}

function LeaseDialog({ editing, tenants, properties, onSubmit }: { editing: Lease | null; tenants: Tenant[]; properties: Property[]; onSubmit: (values: LeaseFormValues) => void }) {
  const form = useForm<LeaseFormValues>({
    resolver: zodResolver(leaseSchema),
    defaultValues: editing
      ? {
          propertyId: editing.propertyId,
          tenantId: editing.tenantId,
          unit: editing.unit,
          startDate: editing.startDate.slice(0, 10),
          endDate: editing.endDate.slice(0, 10),
          rentAmount: editing.rentAmount,
          status: editing.status,
        }
      : {
          propertyId: properties[0]?.id ?? 1,
          tenantId: tenants[0]?.id ?? 1,
          unit: "",
          startDate: new Date().toISOString().slice(0, 10),
          endDate: new Date(Date.now() + 31536000000).toISOString().slice(0, 10),
          rentAmount: 0,
          status: "Active",
        },
  });

  const submit = form.handleSubmit((values) => {
    if (new Date(values.endDate) <= new Date(values.startDate)) {
      form.setError("endDate", { message: "End date must be after start date" });
      return;
    }
    onSubmit({ ...values, startDate: new Date(values.startDate).toISOString(), endDate: new Date(values.endDate).toISOString() });
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{editing ? "Edit Lease" : "Add Lease"}</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
        <div>
          <Label htmlFor="propertyId">Property</Label>
          <Select defaultValue={String(form.getValues("propertyId"))} onValueChange={(v) => form.setValue("propertyId", Number(v))}>
            <SelectTrigger id="propertyId"><SelectValue /></SelectTrigger>
            <SelectContent>
              {properties.map((p) => (<SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="tenantId">Tenant</Label>
          <Select defaultValue={String(form.getValues("tenantId"))} onValueChange={(v) => form.setValue("tenantId", Number(v))}>
            <SelectTrigger id="tenantId"><SelectValue /></SelectTrigger>
            <SelectContent>
              {tenants.map((t) => (<SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="unit">Unit</Label>
          <Input id="unit" {...form.register("unit")} />
          {form.formState.errors.unit && <p className="text-sm text-red-600 mt-1">{form.formState.errors.unit.message}</p>}
        </div>
        <div>
          <Label htmlFor="rentAmount">Rent (KES)</Label>
          <Input id="rentAmount" type="number" min={0} {...form.register("rentAmount", { valueAsNumber: true })} />
          {form.formState.errors.rentAmount && <p className="text-sm text-red-600 mt-1">{form.formState.errors.rentAmount.message}</p>}
        </div>
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" type="date" {...form.register("startDate")} />
          {form.formState.errors.startDate && <p className="text-sm text-red-600 mt-1">{form.formState.errors.startDate.message}</p>}
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input id="endDate" type="date" {...form.register("endDate")} />
          {form.formState.errors.endDate && <p className="text-sm text-red-600 mt-1">{form.formState.errors.endDate.message}</p>}
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select defaultValue={form.getValues("status")} onValueChange={(v) => form.setValue("status", v as LeaseFormValues["status"]) }>
            <SelectTrigger id="status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Separator className="my-2" />
      <DialogFooter>
        <Button variant="outline" onClick={() => form.reset()}>Reset</Button>
        <Button onClick={submit} className="bg-green-600 hover:bg-green-700">{editing ? "Save Changes" : "Create Lease"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}

function LeaseRenewDialog({ base, tenants, properties, onSubmit }: { base: Lease; tenants: Tenant[]; properties: Property[]; onSubmit: (values: LeaseFormValues) => void }) {
  const form = useForm<LeaseFormValues>({
    resolver: zodResolver(leaseSchema),
    defaultValues: {
      propertyId: base.propertyId,
      tenantId: base.tenantId,
      unit: base.unit,
      startDate: new Date(base.endDate).toISOString().slice(0, 10),
      endDate: new Date(new Date(base.endDate).getTime() + 31536000000).toISOString().slice(0, 10),
      rentAmount: base.rentAmount,
      status: "Active",
    },
  });
  const submit = form.handleSubmit((values) => onSubmit({ ...values, startDate: new Date(values.startDate).toISOString(), endDate: new Date(values.endDate).toISOString() }));
  return (
    <>
      <DialogHeader>
        <DialogTitle>Renew Lease</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
        <div>
          <Label htmlFor="propertyId">Property</Label>
          <Select defaultValue={String(form.getValues("propertyId"))} onValueChange={(v) => form.setValue("propertyId", Number(v))}>
            <SelectTrigger id="propertyId"><SelectValue /></SelectTrigger>
            <SelectContent>
              {properties.map((p) => (<SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="tenantId">Tenant</Label>
          <Select defaultValue={String(form.getValues("tenantId"))} onValueChange={(v) => form.setValue("tenantId", Number(v))}>
            <SelectTrigger id="tenantId"><SelectValue /></SelectTrigger>
            <SelectContent>
              {tenants.map((t) => (<SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="unit">Unit</Label>
          <Input id="unit" {...form.register("unit")} />
        </div>
        <div>
          <Label htmlFor="rentAmount">Rent (KES)</Label>
          <Input id="rentAmount" type="number" min={0} {...form.register("rentAmount", { valueAsNumber: true })} />
        </div>
        <div>
          <Label htmlFor="startDate">New Start</Label>
          <Input id="startDate" type="date" {...form.register("startDate")} />
        </div>
        <div>
          <Label htmlFor="endDate">New End</Label>
          <Input id="endDate" type="date" {...form.register("endDate")} />
        </div>
      </div>
      <Separator className="my-2" />
      <DialogFooter>
        <Button variant="outline" onClick={() => form.reset()}>Reset</Button>
        <Button onClick={submit} className="bg-green-600 hover:bg-green-700">Create Renewal</Button>
      </DialogFooter>
    </>
  );
}

function LeaseDocuments({ leaseId }: { leaseId: ID }) {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { data: docs = [] } = useQuery({
    queryKey: ["leaseDocuments", leaseId],
    queryFn: () => api.list("leaseDocuments", { leaseId }) as Promise<LeaseDocument[]>,
  });

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });
      const meta: Omit<LeaseDocument, "id"> = {
        leaseId,
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        dataUrl,
      };
      return api.create("leaseDocuments", meta);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leaseDocuments", leaseId] });
      toast({ title: "Document uploaded" });
    },
    onError: (e: unknown) => toast({ title: "Upload failed", description: String(e) }),
  });
  const remove = useMutation({
    mutationFn: (id: ID) => api.remove("leaseDocuments", id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leaseDocuments", leaseId] }),
  });

  const [confirmDocId, setConfirmDocId] = useState<ID | null>(null);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Lease Documents</DialogTitle>
      </DialogHeader>
      <div className="space-y-3 py-2">
        <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload.mutate(f);
        }} />
        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Upload Document</Button>
        <div className="border rounded-md divide-y">
          {docs.length === 0 && <div className="p-3 text-sm text-gray-500">No documents uploaded.</div>}
          {docs.map((d: LeaseDocument) => (
            <div key={d.id} className="p-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium truncate">{d.name}</p>
                <p className="text-xs text-gray-500 truncate">{d.mimeType} • {(d.size / 1024).toFixed(1)} KB</p>
              </div>
              <div className="flex items-center gap-2">
                <a className="underline text-sm" href={d.dataUrl} download={d.name}>Download</a>
                <Button variant="destructive" size="sm" onClick={() => setConfirmDocId(d.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
        <ConfirmDialog
          open={confirmDocId !== null}
          title="Delete document?"
          message="This document will be permanently removed."
          onCancel={() => setConfirmDocId(null)}
          onConfirm={async () => {
            if (confirmDocId == null) return;
            await remove.mutateAsync(confirmDocId);
            setConfirmDocId(null);
          }}
        />
      </div>
    </DialogContent>
  );
}


