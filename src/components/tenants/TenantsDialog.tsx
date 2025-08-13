import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { Property, Tenant } from "@/types/entities";

const tenantSchema = z.object({
  name: z.string().min(2),
  unit: z.string().min(1),
  phone: z.string().min(7),
  rentAmount: z.coerce.number().nonnegative(),
  status: z.enum(["Active", "Inactive"]).default("Active"),
  paymentStatus: z.enum(["Paid", "Pending", "Overdue"]).default("Pending"),
  propertyId: z.coerce.number().int().positive(),
});

export type TenantFormValues = z.infer<typeof tenantSchema>;

export default function TenantsDialog({ editing, properties, onSubmit }: { editing: Tenant | null; properties: Property[]; onSubmit: (values: TenantFormValues) => void }) {
  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: editing ? {
      name: editing.name,
      unit: editing.unit,
      phone: editing.phone,
      rentAmount: editing.rentAmount,
      status: editing.status,
      paymentStatus: editing.paymentStatus,
      propertyId: editing.propertyId,
    } : {
      name: "",
      unit: "",
      phone: "",
      rentAmount: 0,
      status: "Active",
      paymentStatus: "Pending",
      propertyId: properties[0]?.id ?? 1,
    }
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
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...form.register("phone")} />
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
          <Label htmlFor="status">Status</Label>
          <Select defaultValue={form.getValues("status")} onValueChange={(v) => form.setValue("status", v as TenantFormValues["status"]) }>
            <SelectTrigger id="status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
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
        </div>
        <div>
          <Label htmlFor="propertyId">Property</Label>
          <Select defaultValue={String(form.getValues("propertyId"))} onValueChange={(v) => form.setValue("propertyId", Number(v)) }>
            <SelectTrigger id="propertyId"><SelectValue /></SelectTrigger>
            <SelectContent>
              {properties.map((p) => (<SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>))}
            </SelectContent>
          </Select>
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


