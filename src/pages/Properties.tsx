import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { Property, ID } from "@/types/entities";
import { api, queryKeys } from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";

const propertySchema = z.object({
  name: z.string().min(2, "Name is required"),
  location: z.string().min(2, "Location is required"),
  totalUnits: z.coerce.number().int().nonnegative(),
  occupiedUnits: z.coerce
    .number()
    .int()
    .nonnegative(),
  monthlyRevenue: z.coerce.number().nonnegative(),
  status: z.enum(["Active", "Inactive"]).default("Active"),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

function useProperties() {
  return useQuery({
    queryKey: queryKeys.resource("properties"),
    queryFn: () => api.list("properties"),
  });
}

export default function PropertiesPage() {
  const queryClient = useQueryClient();
  const { data: properties = [], isLoading, isError } = useProperties();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const filtered = useMemo(
    () => properties.filter((p) => (showArchived ? true : !p.archived)),
    [properties, showArchived]
  );

  const createMutation = useMutation({
    mutationFn: (values: PropertyFormValues) =>
      api.create("properties", { ...values, archived: false } as Omit<Property, "id">),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resource("properties") });
      toast({ title: "Property created" });
      setOpen(false);
    },
    onError: (err: unknown) => toast({ title: "Create failed", description: String(err) }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: ID; values: Partial<Property> }) => api.update("properties", id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resource("properties") });
      toast({ title: "Property updated" });
      setOpen(false);
    },
    onError: (err: unknown) => toast({ title: "Update failed", description: String(err) }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: ID) => api.remove("properties", id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resource("properties") });
      toast({ title: "Property deleted" });
    },
    onError: (err: unknown) => toast({ title: "Delete failed", description: String(err) }),
  });

  const archiveMutation = useMutation({
    mutationFn: ({ id, archived }: { id: ID; archived: boolean }) => api.update("properties", id, { archived }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resource("properties") });
      toast({ title: "Property updated" });
    },
    onError: (err: unknown) => toast({ title: "Archive failed", description: String(err) }),
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Properties</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowArchived((s) => !s)}>
            {showArchived ? "Hide Archived" : "Show Archived"}
          </Button>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">Add Property</Button>
            </DialogTrigger>
            <PropertyDialog
              key={editing?.id ?? "new"}
              editing={editing}
              onSubmit={(values) => {
                if (editing) {
                  updateMutation.mutate({ id: editing.id, values });
                } else {
                  createMutation.mutate(values);
                }
              }}
            />
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <div>Loading...</div>}
        {isError && <div className="text-red-600">Failed to load properties.</div>}

        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Occupancy</TableHead>
                  <TableHead>Monthly Revenue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Archived</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.location}</TableCell>
                    <TableCell>
                      {p.occupiedUnits}/{p.totalUnits} ({Math.round((p.occupiedUnits / Math.max(p.totalUnits, 1)) * 100)}%)
                    </TableCell>
                    <TableCell className="text-green-700">KES {p.monthlyRevenue.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={p.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {p.archived ? (
                        <Badge className="bg-gray-200 text-gray-800">Yes</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Dialog onOpenChange={(v) => { if (!v) setEditing(null); }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => { setEditing(p); setOpen(true); }}>
                            Edit
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => archiveMutation.mutate({ id: p.id, archived: !p.archived })}
                      >
                        {p.archived ? "Unarchive" : "Archive"}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(p.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PropertyDialog({ editing, onSubmit }: { editing: Property | null; onSubmit: (values: PropertyFormValues) => void }) {
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: editing
      ? {
          name: editing.name,
          location: editing.location,
          totalUnits: editing.totalUnits,
          occupiedUnits: editing.occupiedUnits,
          monthlyRevenue: editing.monthlyRevenue,
          status: editing.status,
        }
      : {
          name: "",
          location: "",
          totalUnits: 0,
          occupiedUnits: 0,
          monthlyRevenue: 0,
          status: "Active",
        },
  });

  const submit = form.handleSubmit((values) => {
    if (values.occupiedUnits > values.totalUnits) {
      form.setError("occupiedUnits", { message: "Occupied units cannot exceed total units" });
      return;
    }
    onSubmit(values);
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{editing ? "Edit Property" : "Add Property"}</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" {...form.register("location")} />
          {form.formState.errors.location && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.location.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="totalUnits">Total Units</Label>
          <Input id="totalUnits" type="number" min={0} {...form.register("totalUnits", { valueAsNumber: true })} />
          {form.formState.errors.totalUnits && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.totalUnits.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="occupiedUnits">Occupied Units</Label>
          <Input id="occupiedUnits" type="number" min={0} {...form.register("occupiedUnits", { valueAsNumber: true })} />
          {form.formState.errors.occupiedUnits && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.occupiedUnits.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="monthlyRevenue">Monthly Revenue (KES)</Label>
          <Input id="monthlyRevenue" type="number" min={0} {...form.register("monthlyRevenue", { valueAsNumber: true })} />
          {form.formState.errors.monthlyRevenue && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.monthlyRevenue.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            defaultValue={form.getValues("status")}
            onValueChange={(v) => form.setValue("status", v as PropertyFormValues["status"]) }
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.status && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.status.message}</p>
          )}
        </div>
      </div>
      <Separator className="my-2" />
      <DialogFooter>
        <Button variant="outline" onClick={() => form.reset()}>Reset</Button>
        <Button onClick={submit} className="bg-green-600 hover:bg-green-700">
          {editing ? "Save Changes" : "Create Property"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}


