import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { api, queryKeys } from "@/lib/api";
import type { Property, Tenant, Payment } from "@/types/entities";
import { toast } from "@/components/ui/use-toast";

const propertySchema = z.object({
  name: z.string().min(2),
  location: z.string().min(2),
});
type QuickProperty = z.infer<typeof propertySchema>;

const tenantSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(7),
});
type QuickTenant = z.infer<typeof tenantSchema>;

const paymentSchema = z.object({
  tenantId: z.coerce.number().int().positive(),
  amount: z.coerce.number().positive(),
});
type QuickPayment = z.infer<typeof paymentSchema>;

export default function QuickAddPage() {
  const qc = useQueryClient();

  const createProperty = useMutation({
    mutationFn: (v: QuickProperty) =>
      api.create("properties", {
        name: v.name,
        location: v.location,
        totalUnits: 0,
        occupiedUnits: 0,
        monthlyRevenue: 0,
        status: "Active",
        archived: false,
      } as Omit<Property, "id">),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.resource("properties") });
      toast({ title: "Property added" });
    },
  });

  const createTenant = useMutation({
    mutationFn: (v: QuickTenant) =>
      api.create("tenants", {
        name: v.name,
        phone: v.phone,
        unit: "",
        rentAmount: 0,
        status: "Active",
        paymentStatus: "Pending",
        propertyId: 1,
        archived: false,
      } as Omit<Tenant, "id">),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.resource("tenants") });
      toast({ title: "Tenant added" });
    },
  });

  const createPayment = useMutation({
    mutationFn: (v: QuickPayment) =>
      api.create("payments", {
        tenantId: v.tenantId,
        leaseId: 1,
        amount: v.amount,
        method: "Cash",
        date: new Date().toISOString(),
        status: "Completed",
        reference: `QK-${Date.now()}`,
        archived: false,
      } as unknown as Omit<Payment, "id">),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.resource("payments") });
      toast({ title: "Payment added" });
    },
  });

  const pf = useForm<QuickProperty>({ resolver: zodResolver(propertySchema) });
  const tf = useForm<QuickTenant>({ resolver: zodResolver(tenantSchema) });
  const payf = useForm<QuickPayment>({ resolver: zodResolver(paymentSchema) });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Quick Property</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="p-name">Name</Label>
            <Input id="p-name" {...pf.register("name")} />
          </div>
          <div>
            <Label htmlFor="p-location">Location</Label>
            <Input id="p-location" {...pf.register("location")} />
          </div>
          <Button onClick={pf.handleSubmit((v) => createProperty.mutate(v))} className="bg-green-600 hover:bg-green-700">
            Add Property
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Tenant</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="t-name">Name</Label>
            <Input id="t-name" {...tf.register("name")} />
          </div>
          <div>
            <Label htmlFor="t-phone">Phone</Label>
            <Input id="t-phone" {...tf.register("phone")} />
          </div>
          <Button onClick={tf.handleSubmit((v) => createTenant.mutate(v))} className="bg-green-600 hover:bg-green-700">
            Add Tenant
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="pay-tenant">Tenant ID</Label>
            <Input id="pay-tenant" type="number" min={1} {...payf.register("tenantId", { valueAsNumber: true })} />
          </div>
          <div>
            <Label htmlFor="pay-amount">Amount (KES)</Label>
            <Input id="pay-amount" type="number" min={1} {...payf.register("amount", { valueAsNumber: true })} />
          </div>
          <Button onClick={payf.handleSubmit((v) => createPayment.mutate(v))} className="bg-green-600 hover:bg-green-700">
            Add Payment
          </Button>
        </CardContent>
      </Card>

      <div className="lg:col-span-3">
        <Separator />
      </div>
    </div>
  );
}


