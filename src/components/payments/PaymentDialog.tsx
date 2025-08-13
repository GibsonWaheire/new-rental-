import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { Lease, Payment, Tenant } from "@/types/entities";
import { paymentSchema, type PaymentFormValues } from "@/utils/paymentsSchema";

export default function PaymentDialog({ editing, tenants, leases, onSubmit }: { editing: Payment | null; tenants: Tenant[]; leases: Lease[]; onSubmit: (values: PaymentFormValues) => void }) {
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


