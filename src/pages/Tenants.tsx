import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { api, queryKeys } from "@/lib/api";
import type { Tenant, Property, Lease, ID } from "@/types/entities";
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
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ConfirmDialog from "@/components/ConfirmDialog";

const tenantSchema = z.object({
  name: z.string().min(2),
  unit: z.string().min(1),
  phone: z.string().min(7),
  rentAmount: z.coerce.number().nonnegative(),
  status: z.enum(["Active", "Inactive"]).default("Active"),
  paymentStatus: z.enum(["Paid", "Pending", "Overdue"]).default("Pending"),
  propertyId: z.coerce.number().int().positive(),
});

type TenantFormValues = z.infer<typeof tenantSchema>;

function useTenants() {
  return useQuery({
    queryKey: queryKeys.resource("tenants"),
    queryFn: () => api.list("tenants"),
  });
}

function useProperties() {
  return useQuery({
    queryKey: queryKeys.resource("properties"),
    queryFn: () => api.list("properties"),
  });
}

export default function TenantsPage() {
  const queryClient = useQueryClient();
  const { data: tenants = [], isLoading, isError } = useTenants();
  const { data: properties = [] } = useProperties();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [filterProperty, setFilterProperty] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>("name");

  const propertyById = useMemo(() => {
    const map = new Map<number, Property>();
    properties.forEach((p) => map.set(p.id, p));
    return map;
  }, [properties]);

  const filtered = useMemo(() => {
    let list = tenants.filter((t) => (showArchived ? true : !t.archived));
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((t) =>
        [t.name, t.unit, t.phone, propertyById.get(t.propertyId)?.name]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(s))
      );
    }
    if (filterStatus) list = list.filter((t) => t.status === filterStatus);
    if (filterProperty) list = list.filter((t) => t.propertyId === filterProperty);
    switch (sortBy) {
      case "rent":
        list = [...list].sort((a, b) => b.rentAmount - a.rentAmount);
        break;
      case "payment":
        list = [...list].sort((a, b) => a.paymentStatus.localeCompare(b.paymentStatus));
        break;
      default:
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [tenants, showArchived, search, filterStatus, filterProperty, sortBy, propertyById]);

  const exportCSV = () => {
    const rows = [
      ["Name", "Unit", "Phone", "Rent", "Status", "Payment", "Property"],
      ...filtered.map((t) => [
        t.name,
        t.unit,
        t.phone,
        String(t.rentAmount),
        t.status,
        t.paymentStatus,
        properties.find((p) => p.id === t.propertyId)?.name ?? String(t.propertyId),
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tenants-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFontSize(14);
    doc.text("Tenants", 40, 40);
    doc.setFontSize(10);
    const startY = 70;
    const rowH = 18;
    const headers = ["Name", "Unit", "Phone", "Rent", "Status", "Payment", "Property"];
    headers.forEach((h, i) => doc.text(h, 40 + i * 80, startY));
    filtered.slice(0, 35).forEach((t, idx) => {
      const y = startY + (idx + 1) * rowH;
      const cols = [
        t.name,
        t.unit,
        t.phone,
        `KES ${t.rentAmount.toLocaleString()}`,
        t.status,
        t.paymentStatus,
        properties.find((p) => p.id === t.propertyId)?.name ?? String(t.propertyId),
      ];
      cols.forEach((c, i) => doc.text(String(c), 40 + i * 80, y));
    });
    doc.save(`tenants-${Date.now()}.pdf`);
  };

  const createMutation = useMutation({
    mutationFn: (values: TenantFormValues) => api.create("tenants", { ...values, archived: false } as Omit<Tenant, "id">),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resource("tenants") });
      toast({ title: "Tenant created" });
      setOpen(false);
    },
    onError: (err: unknown) => toast({ title: "Create failed", description: String(err) }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: ID; values: Partial<Tenant> }) => api.update("tenants", id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resource("tenants") });
      toast({ title: "Tenant updated" });
      setOpen(false);
    },
    onError: (err: unknown) => toast({ title: "Update failed", description: String(err) }),
  });

  const deleteCascade = async (id: ID) => {
    const leases = await api.list("leases", { tenantId: id });
    await Promise.all(leases.map((l) => api.remove("leases", l.id)));
    const payments = await api.list("payments", { tenantId: id });
    await Promise.all(payments.map((p) => api.remove("payments", p.id)));
    await api.remove("tenants", id);
  };

  const deleteMutation = useMutation({
    mutationFn: (id: ID) => deleteCascade(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resource("tenants") });
      queryClient.invalidateQueries({ queryKey: queryKeys.resource("leases") });
      queryClient.invalidateQueries({ queryKey: queryKeys.resource("payments") });
      toast({ title: "Tenant and related data deleted" });
    },
    onError: (err: unknown) => toast({ title: "Delete failed", description: String(err) }),
  });

  const archiveMutation = useMutation({
    mutationFn: ({ id, archived }: { id: ID; archived: boolean }) => api.update("tenants", id, { archived }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resource("tenants") });
      toast({ title: "Tenant updated" });
    },
    onError: (err: unknown) => toast({ title: "Archive failed", description: String(err) }),
  });

  const [confirmDeleteId, setConfirmDeleteId] = useState<ID | null>(null);
  const [confirmArchive, setConfirmArchive] = useState<{ id: ID; archived: boolean } | null>(null);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <CardTitle className="text-lg font-semibold">Tenants</CardTitle>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <Input placeholder="Search tenants..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v)}>
            <SelectTrigger className="min-w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterProperty ? String(filterProperty) : undefined} onValueChange={(v) => setFilterProperty(Number(v))}>
            <SelectTrigger className="min-w-[160px]"><SelectValue placeholder="Property" /></SelectTrigger>
            <SelectContent>
              {properties.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v)}>
            <SelectTrigger className="min-w-[160px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="rent">Rent</SelectItem>
              <SelectItem value="payment">Payment Status</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setShowArchived((s) => !s)}>
            {showArchived ? "Hide Archived" : "Show Archived"}
          </Button>
          <Button variant="outline" onClick={exportCSV}>Export CSV</Button>
          <Button variant="outline" onClick={exportPDF}>Export PDF</Button>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">Add Tenant</Button>
            </DialogTrigger>
            <TenantDialog
              key={editing?.id ?? "new"}
              editing={editing}
              properties={properties}
              onSubmit={(values) => {
                if (editing) updateMutation.mutate({ id: editing.id, values });
                else createMutation.mutate(values);
              }}
            />
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <div>Loading...</div>}
        {isError && <div className="text-red-600">Failed to load tenants.</div>}

        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <Table className="w-full text-sm">
              <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Rent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Archived</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow key={t.id} className="odd:bg-gray-50 hover:bg-gray-100/60">
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>{t.unit}</TableCell>
                    <TableCell>
                      {t.phone}
                      <Button variant="link" className="ml-2 p-0" onClick={() => updateMutation.mutate({ id: t.id, values: { phone: prompt("Update phone", t.phone) || t.phone } })}>
                        Edit
                      </Button>
                    </TableCell>
                    <TableCell className="text-green-700 text-right tabular-nums whitespace-nowrap">KES {t.rentAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={`${t.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"} uppercase tracking-wide px-2 py-0.5`}>{t.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${t.paymentStatus === "Paid" ? "bg-green-100 text-green-800" : t.paymentStatus === "Overdue" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"} uppercase tracking-wide px-2 py-0.5`}>{t.paymentStatus}</Badge>
                    </TableCell>
                    <TableCell>{properties.find((p) => p.id === t.propertyId)?.name ?? t.propertyId}</TableCell>
                    <TableCell>{t.archived ? <Badge className="bg-gray-200 text-gray-800">Yes</Badge> : <Badge variant="secondary">No</Badge>}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" aria-label="Actions">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => { setEditing(t); setOpen(true); }}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setConfirmArchive({ id: t.id, archived: !t.archived })}>{t.archived ? "Unarchive" : "Archive"}</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link to="/leases">View lease</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast({ title: "Reminder sent", description: `Reminder sent to ${t.name}` })}>Send reminder</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => setConfirmDeleteId(t.id)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-8">No tenants found. Adjust filters or search.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Delete tenant?"
        message="This will permanently remove the tenant and related leases and payments."
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={async () => {
          if (confirmDeleteId == null) return;
          await deleteMutation.mutateAsync(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
      />
      <ConfirmDialog
        open={confirmArchive !== null}
        title={confirmArchive?.archived ? "Unarchive tenant?" : "Archive tenant?"}
        message={confirmArchive?.archived ? "This will unarchive the tenant." : "This will archive the tenant."}
        onCancel={() => setConfirmArchive(null)}
        onConfirm={async () => {
          if (!confirmArchive) return;
          await archiveMutation.mutateAsync({ id: confirmArchive.id, archived: confirmArchive.archived });
          setConfirmArchive(null);
        }}
      />
    </Card>
  );
}

function TenantDialog({ editing, properties, onSubmit }: { editing: Tenant | null; properties: Property[]; onSubmit: (values: TenantFormValues) => void }) {
  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: editing
      ? {
          name: editing.name,
          unit: editing.unit,
          phone: editing.phone,
          rentAmount: editing.rentAmount,
          status: editing.status,
          paymentStatus: editing.paymentStatus,
          propertyId: editing.propertyId,
        }
      : {
          name: "",
          unit: "",
          phone: "",
          rentAmount: 0,
          status: "Active",
          paymentStatus: "Pending",
          propertyId: properties[0]?.id ?? 1,
        },
  });

  const submit = form.handleSubmit((values) => onSubmit(values));

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{editing ? "Edit Tenant" : "Add Tenant"}</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...form.register("name")} />
          {form.formState.errors.name && <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...form.register("phone")} />
          {form.formState.errors.phone && <p className="text-sm text-red-600 mt-1">{form.formState.errors.phone.message}</p>}
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
          <Label htmlFor="status">Status</Label>
          <Select defaultValue={form.getValues("status")} onValueChange={(v) => form.setValue("status", v as TenantFormValues["status"]) }>
            <SelectTrigger id="status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.status && <p className="text-sm text-red-600 mt-1">{form.formState.errors.status.message}</p>}
        </div>
        <div>
          <Label htmlFor="paymentStatus">Payment Status</Label>
          <Select defaultValue={form.getValues("paymentStatus")} onValueChange={(v) => form.setValue("paymentStatus", v as TenantFormValues["paymentStatus"]) }>
            <SelectTrigger id="paymentStatus"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.paymentStatus && <p className="text-sm text-red-600 mt-1">{form.formState.errors.paymentStatus.message}</p>}
        </div>
        <div>
          <Label htmlFor="propertyId">Property</Label>
          <Select defaultValue={String(form.getValues("propertyId"))} onValueChange={(v) => form.setValue("propertyId", Number(v)) }>
            <SelectTrigger id="propertyId"><SelectValue /></SelectTrigger>
            <SelectContent>
              {properties.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.propertyId && <p className="text-sm text-red-600 mt-1">{form.formState.errors.propertyId.message}</p>}
        </div>
      </div>
      <Separator className="my-2" />
      <DialogFooter>
        <Button variant="outline" onClick={() => form.reset()}>Reset</Button>
        <Button onClick={submit} className="bg-green-600 hover:bg-green-700">{editing ? "Save Changes" : "Create Tenant"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}
