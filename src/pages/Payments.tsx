import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { api, queryKeys } from "@/lib/api";
import type { Payment, Tenant, Lease, Property, ID } from "@/types/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import { generatePaymentReceiptPDF } from "@/utils/pdf";
import { MoreHorizontal, FileDown, FileSpreadsheet, FileText, Plus, List, Pencil, Archive as ArchiveIcon, FileText as FileTextIcon, Mail, CheckCircle, ChevronDown, ChevronUp, CreditCard } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const paymentSchema = z.object({
  tenantId: z.coerce.number().int().positive(),
  leaseId: z.coerce.number().int().positive(),
  amount: z.coerce.number().positive(),
  method: z.enum(["M-Pesa", "Bank Transfer", "Cash", "Card"]).default("Cash"),
  date: z.string(),
  status: z.enum(["Completed", "Pending", "Overdue"]).default("Completed"),
  reference: z.string().min(1),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

function usePayments() {
  return useQuery({ queryKey: queryKeys.resource("payments"), queryFn: () => api.list("payments", { _sort: "date", _order: "desc" }) });
}
function useTenants() { return useQuery({ queryKey: queryKeys.resource("tenants"), queryFn: () => api.list("tenants") }); }
function useLeases() { return useQuery({ queryKey: queryKeys.resource("leases"), queryFn: () => api.list("leases") }); }
function useProperties() { return useQuery({ queryKey: queryKeys.resource("properties"), queryFn: () => api.list("properties") }); }

export default function PaymentsPage() {
  const qc = useQueryClient();
  const { data: payments = [], isLoading, isError } = usePayments();
  const { data: tenants = [] } = useTenants();
  const { data: leases = [] } = useLeases();
  const { data: properties = [] } = useProperties();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [search, setSearch] = useState("");
  const [filterTenant, setFilterTenant] = useState<number | undefined>(undefined);
  const [filterLease, setFilterLease] = useState<number | undefined>(undefined);
  const [filterMethod, setFilterMethod] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [filterFrom, setFilterFrom] = useState<string>("");
  const [filterTo, setFilterTo] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("date");
  const [selected, setSelected] = useState<Set<ID>>(new Set());
  const [confirmPaymentId, setConfirmPaymentId] = useState<ID | null>(null);
  const [confirmArchive, setConfirmArchive] = useState<{ id: ID; archived: boolean } | null>(null);
  const [compact, setCompact] = useState(false);
  const [expanded, setExpanded] = useState<Set<ID>>(new Set());

  const tById = useMemo(() => new Map(tenants.map((t) => [t.id, t])), [tenants]);
  const lById = useMemo(() => new Map(leases.map((l) => [l.id, l])), [leases]);
  const pById = useMemo(() => new Map(properties.map((p) => [p.id, p])), [properties]);

  const isArchived = (p: Payment) => Boolean((p as unknown as { archived?: boolean }).archived);

  const filtered = useMemo(() => {
    let list = payments.filter((p) => (showArchived ? true : !isArchived(p)));
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((p) => [
        tById.get(p.tenantId)?.name,
        pById.get(lById.get(p.leaseId)?.propertyId ?? -1)?.name,
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
  }, [payments, showArchived, search, filterTenant, filterLease, filterMethod, filterStatus, filterFrom, filterTo, sortBy, tById, lById, pById]);

  const createPayment = useMutation({
    mutationFn: (values: PaymentFormValues) => api.create("payments", { ...values, archived: false } as Omit<Payment, "id">),
    onSuccess: async (payment) => {
      qc.invalidateQueries({ queryKey: queryKeys.resource("payments") });
      toast({ title: "Payment created" });
      setOpen(false);
      const blob = await generatePaymentReceiptPDF(payment as Payment, tById.get(payment.tenantId), lById.get(payment.leaseId), pById.get(lById.get(payment.leaseId)?.propertyId ?? -1));
      const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `receipt-${payment.id}.pdf`; a.click(); URL.revokeObjectURL(url);
    },
  });
  const updatePayment = useMutation({
    mutationFn: ({ id, values }: { id: ID; values: Partial<Payment> }) => api.update("payments", id, values),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.resource("payments") }); toast({ title: "Payment updated" }); setOpen(false); },
  });
  const deletePayment = useMutation({
    mutationFn: (id: ID) => api.remove("payments", id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.resource("payments") }); toast({ title: "Payment deleted" }); },
  });
  const archivePayment = useMutation({
    mutationFn: ({ id, archived }: { id: ID; archived: boolean }) => api.update("payments", id, { archived } as Partial<Payment>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.resource("payments") }); toast({ title: "Payment updated" }); },
  });

  const bulkDelete = async () => {
    await Promise.all([...selected].map((id) => deletePayment.mutateAsync(id)));
    setSelected(new Set());
  };
  const bulkMarkPaid = async () => {
    await Promise.all([...selected].map((id) => updatePayment.mutateAsync({ id, values: { status: "Completed" } })));
    setSelected(new Set());
  };

  const exportCSV = () => {
    const rows = [["Tenant","Property","Lease","Amount","Method","Date","Status","Reference"], ...filtered.map((p) => [
      tById.get(p.tenantId)?.name ?? p.tenantId,
      pById.get(lById.get(p.leaseId)?.propertyId ?? -1)?.name ?? "-",
      p.leaseId,
      String(p.amount),
      p.method,
      new Date(p.date).toLocaleString(),
      p.status,
      p.reference,
    ])];
    const escape = (val: unknown) => String(val).replace(/"/g, '""');
    const csv = rows.map((r) => r.map((v) => `"${escape(v)}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `payments-${Date.now()}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const exportPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 40;
    doc.setFontSize(18); doc.text("Payments", margin, margin);
    doc.setDrawColor(220); doc.line(margin, margin + 8, doc.internal.pageSize.getWidth() - margin, margin + 8);
    doc.setFontSize(10);
    const headers = ["Tenant","Property","Lease","Amount","Method","Date","Status","Ref"];
    const colWidths = [110, 110, 50, 80, 80, 120, 70, 80];
    let x = margin; let y = margin + 28;
    headers.forEach((h, i) => { doc.text(h, x, y); x += colWidths[i]; });
    y += 16;
    filtered.slice(0, 40).forEach((p) => {
      x = margin;
      const cols = [
        tById.get(p.tenantId)?.name ?? String(p.tenantId),
        pById.get(lById.get(p.leaseId)?.propertyId ?? -1)?.name ?? "-",
        `#${p.leaseId}`,
        `KES ${p.amount.toLocaleString()}`,
        p.method,
        new Date(p.date).toLocaleString(),
        p.status,
        p.reference,
      ];
      cols.forEach((c, i) => { doc.text(String(c), x, y); x += colWidths[i]; });
      y += 16;
    });
    doc.save(`payments-${Date.now()}.pdf`);
  };

  const badge = (status: Payment["status"]) => status === "Completed" ? "bg-green-100 text-green-800" : status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800";
  const methodBadge = (method: Payment["method"]) =>
    method === "M-Pesa" ? "bg-green-100 text-green-800" : method === "Bank Transfer" ? "bg-blue-100 text-blue-800" : method === "Card" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800";
  const formatAmount = (n: number) => `KES ${n.toLocaleString()}`;
  const formatShortDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  const formatDateTime = (iso: string) => new Date(iso).toLocaleString();

  const toggleExpanded = (id: ID) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpanded(next);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Payments</CardTitle>
          <p className="text-sm text-muted-foreground">{filtered.length} result{filtered.length === 1 ? "" : "s"}</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <Collapsible defaultOpen className="w-full">
            <div className="flex items-center gap-2">
              <Input placeholder="Search payments..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-[180px]" />
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="md:hidden">Filters</Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="mt-2 md:mt-0 md:block data-[state=closed]:hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row gap-2">
                <Select value={filterTenant ? String(filterTenant) : undefined} onValueChange={(v) => setFilterTenant(Number(v))}>
                  <SelectTrigger className="min-w-[160px]"><SelectValue placeholder="Tenant" /></SelectTrigger>
                  <SelectContent>{tenants.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={filterLease ? String(filterLease) : undefined} onValueChange={(v) => setFilterLease(Number(v))}>
                  <SelectTrigger className="min-w-[160px]"><SelectValue placeholder="Lease" /></SelectTrigger>
                  <SelectContent>{leases.map((l) => <SelectItem key={l.id} value={String(l.id)}>#{l.id}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={filterMethod} onValueChange={(v) => setFilterMethod(v)}>
                  <SelectTrigger className="min-w-[160px]"><SelectValue placeholder="Method" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M-Pesa">M-Pesa</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v)}>
                  <SelectTrigger className="min-w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} />
                <Input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} />
                <Select value={sortBy} onValueChange={(v) => setSortBy(v)}>
                  <SelectTrigger className="min-w-[160px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CollapsibleContent>
          </Collapsible>
          <Button variant={compact ? "secondary" : "outline"} onClick={() => setCompact((v) => !v)}>
            <List className="h-4 w-4 mr-2" /> {compact ? "Compact On" : "Compact Off"}
          </Button>
          <Button variant="outline" onClick={() => setShowArchived((s) => !s)}>{showArchived ? "Hide Archived" : "Show Archived"}</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline"><FileDown className="h-4 w-4 mr-2" /> Export</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={exportCSV}><FileSpreadsheet className="h-4 w-4 mr-2" /> CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={exportPDF}><FileText className="h-4 w-4 mr-2" /> PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
            <DialogTrigger asChild><Button className="bg-green-600 hover:bg-green-700"><Plus className="h-4 w-4 mr-2" /> Add Payment</Button></DialogTrigger>
            <PaymentDialog key={editing?.id ?? "new"} editing={editing} tenants={tenants} leases={leases} onSubmit={(values) => { if (editing) updatePayment.mutate({ id: editing.id, values }); else createPayment.mutate(values); }} />
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <div>Loading...</div>}
        {isError && <div className="text-red-600">Failed to load payments.</div>}
        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <div className="flex items-center gap-2 mb-2">
              <Button variant="outline" onClick={() => setSelected(new Set())}>Clear Selection</Button>
              <Button variant="outline" onClick={() => setConfirmPaymentId(-1 as ID)} disabled={selected.size === 0}>Bulk Delete</Button>
              <Button variant="outline" onClick={bulkMarkPaid} disabled={selected.size === 0}>Mark Paid</Button>
            </div>
            <Table className="w-full text-sm table-fixed">
              <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
                <TableRow>
                  <TableHead className="w-[44px] px-4 py-2"><input type="checkbox" onChange={(e) => {
                    if (e.target.checked) setSelected(new Set(filtered.map((p) => p.id)));
                    else setSelected(new Set());
                  }} /></TableHead>
                  <TableHead className="sticky left-0 z-20 bg-white px-4 py-2">Tenant</TableHead>
                  <TableHead className="text-right px-4 py-2 w-[120px]">Amount</TableHead>
                  <TableHead className="px-4 py-2 w-[110px]">Status</TableHead>
                  <TableHead className="px-4 py-2 w-[110px]">Date</TableHead>
                  <TableHead className="px-4 py-2 truncate max-w-[180px] md:max-w-[260px]">Lease / Ref</TableHead>
                  {!compact && (
                    <TableHead className="text-center px-4 py-2 w-[80px]">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="inline-flex items-center justify-center w-full">
                            <CreditCard className="h-4 w-4" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Method</TooltipContent>
                      </Tooltip>
                    </TableHead>
                  )}
                  <TableHead className="text-right px-4 py-2 w-[72px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <>
                    <TableRow key={p.id} className="odd:bg-gray-50 hover:bg-gray-100/60">
                      <TableCell className="align-middle px-4 py-2">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={selected.has(p.id)} onChange={(e) => {
                            const copy = new Set(selected); if (e.target.checked) copy.add(p.id); else copy.delete(p.id); setSelected(copy);
                          }} />
                          <Button variant="ghost" size="icon" aria-label="More details" onClick={() => toggleExpanded(p.id)}>
                            {expanded.has(p.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium sticky left-0 z-10 bg-white/80 backdrop-blur-sm px-4 py-2 truncate max-w-[160px] md:max-w-[220px]" title={tById.get(p.tenantId)?.name ?? String(p.tenantId)}>{tById.get(p.tenantId)?.name ?? p.tenantId}</TableCell>
                      <TableCell className="text-green-700 text-right tabular-nums whitespace-nowrap px-4 py-2">{formatAmount(p.amount)}</TableCell>
                      <TableCell className="px-4 py-2 whitespace-nowrap"><Badge className={`${badge(p.status)} uppercase tracking-wide px-2 py-0.5`}>{p.status}</Badge></TableCell>
                      <TableCell className="px-4 py-2 whitespace-nowrap w-[110px]" title={formatDateTime(p.date)}>{formatShortDate(p.date)}</TableCell>
                      <TableCell className="px-4 py-2 truncate max-w-[180px] md:max-w-[260px]" title={`#${p.leaseId} • ${p.reference}`}>#{p.leaseId} • {p.reference}</TableCell>
                      {!compact && (
                        <TableCell className="px-4 py-2"><Badge className={`${methodBadge(p.method)} uppercase tracking-wide px-2 py-0.5`}>{p.method}</Badge></TableCell>
                      )}
                      <TableCell className="text-right px-4 py-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" aria-label="Actions">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => { setEditing(p); setOpen(true); }}><Pencil className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setConfirmArchive({ id: p.id, archived: !isArchived(p) })}><ArchiveIcon className="h-4 w-4 mr-2" /> {isArchived(p) ? "Unarchive" : "Archive"}</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={async () => {
                              const blob = await generatePaymentReceiptPDF(p, tById.get(p.tenantId), lById.get(p.leaseId), pById.get(lById.get(p.leaseId)?.propertyId ?? -1));
                              const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `receipt-${p.id}.pdf`; a.click(); URL.revokeObjectURL(url);
                            }}><FileTextIcon className="h-4 w-4 mr-2" /> View receipt</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast({ title: "Receipt resent", description: p.reference })}><Mail className="h-4 w-4 mr-2" /> Resend receipt</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updatePayment.mutate({ id: p.id, values: { status: "Completed" } })}><CheckCircle className="h-4 w-4 mr-2" /> Mark as paid</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => setConfirmPaymentId(p.id)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    {expanded.has(p.id) && (
                      <TableRow className="bg-white/70">
                        <TableCell colSpan={compact ? 7 : 8} className="py-4 px-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
                            <div><span className="font-medium text-foreground">Property:</span> {pById.get(lById.get(p.leaseId)?.propertyId ?? -1)?.name ?? "-"}</div>
                            <div><span className="font-medium text-foreground">Method:</span> <Badge className={`${methodBadge(p.method)} uppercase tracking-wide px-2 py-0.5 ml-1`}>{p.method}</Badge></div>
                            <div className="sm:col-span-2 truncate" title={p.reference}><span className="font-medium text-foreground">Reference:</span> {p.reference}</div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-sm text-muted-foreground py-8">No payments found. Adjust filters or search.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <ConfirmDialog
        open={confirmPaymentId !== null}
        title={confirmPaymentId === -1 ? "Delete selected payments?" : "Delete payment?"}
        message={confirmPaymentId === -1 ? "This will permanently remove the selected payments." : "This will permanently remove the payment."}
        onCancel={() => setConfirmPaymentId(null)}
        onConfirm={async () => {
          if (confirmPaymentId === -1) { await bulkDelete(); }
          else if (confirmPaymentId != null) { await deletePayment.mutateAsync(confirmPaymentId); }
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

function PaymentDialog({ editing, tenants, leases, onSubmit }: { editing: Payment | null; tenants: Tenant[]; leases: Lease[]; onSubmit: (values: PaymentFormValues) => void }) {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: editing ? {
      tenantId: editing.tenantId,
      leaseId: editing.leaseId,
      amount: editing.amount,
      method: editing.method,
      date: editing.date.slice(0, 16),
      status: editing.status,
      reference: editing.reference,
    } : {
      tenantId: tenants[0]?.id ?? 1,
      leaseId: leases[0]?.id ?? 1,
      amount: 0,
      method: "Cash",
      date: new Date().toISOString().slice(0, 16),
      status: "Completed",
      reference: `REF-${Date.now()}`,
    }
  });

  const submit = form.handleSubmit((values) => onSubmit({ ...values, date: new Date(values.date).toISOString() }));

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{editing ? "Edit Payment" : "Add Payment"}</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
        <div>
          <Label htmlFor="tenantId">Tenant</Label>
          <Select defaultValue={String(form.getValues("tenantId"))} onValueChange={(v) => form.setValue("tenantId", Number(v))}>
            <SelectTrigger id="tenantId"><SelectValue /></SelectTrigger>
            <SelectContent>{tenants.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="leaseId">Lease</Label>
          <Select defaultValue={String(form.getValues("leaseId"))} onValueChange={(v) => form.setValue("leaseId", Number(v))}>
            <SelectTrigger id="leaseId"><SelectValue /></SelectTrigger>
            <SelectContent>{leases.map((l) => <SelectItem key={l.id} value={String(l.id)}>#{l.id}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="amount">Amount (KES)</Label>
          <Input id="amount" type="number" min={1} {...form.register("amount", { valueAsNumber: true })} />
        </div>
        <div>
          <Label htmlFor="method">Method</Label>
          <Select defaultValue={form.getValues("method")} onValueChange={(v) => form.setValue("method", v as PaymentFormValues["method"]) }>
            <SelectTrigger id="method"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="M-Pesa">M-Pesa</SelectItem>
              <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Card">Card</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="datetime-local" {...form.register("date")} />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select defaultValue={form.getValues("status")} onValueChange={(v) => form.setValue("status", v as PaymentFormValues["status"]) }>
            <SelectTrigger id="status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="reference">Reference</Label>
          <Input id="reference" {...form.register("reference")} />
        </div>
      </div>
      <Separator className="my-2" />
      <DialogFooter>
        <Button variant="outline" onClick={() => form.reset()}>Reset</Button>
        <Button onClick={submit} className="bg-green-600 hover:bg-green-700">{editing ? "Save Changes" : "Create Payment"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}


