import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { MaintenanceRequest, Property, Tenant } from "@/types/entities";
import { maintenanceSchema, type MaintenanceFormValues } from "@/utils/maintenanceSchema";

export default function MaintenanceDialog({ editing, properties, tenants, onSubmit }: { editing: MaintenanceRequest | null; properties: Property[]; tenants: Tenant[]; onSubmit: (values: MaintenanceFormValues) => void }) {
  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: editing ? {
      title: editing.title,
      propertyId: editing.propertyId,
      tenantId: editing.tenantId,
      priority: editing.priority,
      status: editing.status,
      dateSubmitted: editing.dateSubmitted,
      estimatedCost: editing.estimatedCost,
      documents: [],
    } : {
      title: "",
      propertyId: properties[0]?.id ?? 1,
      tenantId: tenants[0]?.id,
      priority: "Low",
      status: "Open",
      dateSubmitted: new Date().toISOString().slice(0, 10),
      estimatedCost: undefined,
      documents: [],
    }
  });

  const submit = form.handleSubmit((values) => onSubmit(values));

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files; if (!files) return;
    const list: MaintenanceFormValues["documents"] = [];
    for (const f of Array.from(files)) {
      const dataUrl = await new Promise<string>((resolve) => { const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.readAsDataURL(f); });
      list.push({ name: f.name, mimeType: f.type, size: f.size, dataUrl });
    }
    form.setValue("documents", list);
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{editing ? "Edit Request" : "Add Request"}</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
        <div className="md:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...form.register("title")} />
        </div>
        <div>
          <Label htmlFor="propertyId">Property</Label>
          <Select defaultValue={String(form.getValues("propertyId"))} onValueChange={(v) => form.setValue("propertyId", Number(v))}>
            <SelectTrigger id="propertyId"><SelectValue /></SelectTrigger>
            <SelectContent>{properties.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="tenantId">Tenant</Label>
          <Select defaultValue={form.getValues("tenantId") ? String(form.getValues("tenantId")) : undefined} onValueChange={(v) => form.setValue("tenantId", Number(v))}>
            <SelectTrigger id="tenantId"><SelectValue placeholder="Optional" /></SelectTrigger>
            <SelectContent>{tenants.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select defaultValue={form.getValues("priority")} onValueChange={(v) => form.setValue("priority", v as MaintenanceFormValues["priority"]) }>
            <SelectTrigger id="priority"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Critical">Critical</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select defaultValue={form.getValues("status")} onValueChange={(v) => form.setValue("status", v as MaintenanceFormValues["status"]) }>
            <SelectTrigger id="status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="dateSubmitted">Date</Label>
          <Input id="dateSubmitted" type="date" {...form.register("dateSubmitted")} />
        </div>
        <div>
          <Label htmlFor="estimatedCost">Estimated Cost</Label>
          <Input id="estimatedCost" type="number" min={0} step={100} {...form.register("estimatedCost", { valueAsNumber: true })} />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="documents">Documents</Label>
          <Input id="documents" type="file" accept="image/*,application/pdf" multiple onChange={handleFiles} />
        </div>
      </div>
      <Separator className="my-2" />
      <DialogFooter>
        <Button variant="outline" onClick={() => form.reset()}>Reset</Button>
        <Button onClick={submit} className="bg-green-600 hover:bg-green-700">{editing ? "Save Changes" : "Create"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}


