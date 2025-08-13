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
import ConfirmDialog from "@/components/ConfirmDialog";
import { 
  Plus, 
  Upload, 
  Search, 
  Filter, 
  SortAsc, 
  Edit, 
  Trash2, 
  ToggleLeft,
  Building2,
  Home,
  MapPin
} from "lucide-react";

const propertySchema = z.object({
  name: z.string().min(2, "Name is required"),
  location: z.string().min(2, "Location is required"),
  totalUnits: z.coerce.number().int().nonnegative(),
  occupiedUnits: z.coerce
    .number()
    .int()
    .nonnegative(),
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
  const [confirmArchiveId, setConfirmArchiveId] = useState<ID | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortBy, setSortBy] = useState("");

  const filtered = useMemo(
    () => properties.filter((p) => (showArchived ? true : !p.archived)),
    [properties, showArchived]
  );

  const createMutation = useMutation({
    mutationFn: (values: PropertyFormValues) =>
      api.create("properties", { ...values, monthlyRevenue: 0, archived: false } as Omit<Property, "id">),
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
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-green-600">Properties</h1>
      </div>

      {/* Action and Filter Bar */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Top Row - Action Buttons */}
            <div className="flex items-center justify-between">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add New Property
              </Button>
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                <Upload className="h-4 w-4 mr-2" />
                Import Tenancies (Units + Tenants + Leases)
              </Button>
            </div>

            {/* Bottom Row - Filters */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by name or address"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="-- Filter by Type --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="Apartment">Apartment</SelectItem>
                  <SelectItem value="Single-family home">Single-family home</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="-- Sort By --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Default</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="location">Location</SelectItem>
                  <SelectItem value="totalUnits">Total Units</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading && (
            <div className="p-8 text-center text-gray-500">Loading properties...</div>
          )}
          {isError && (
            <div className="p-8 text-center text-red-600">Failed to load properties.</div>
          )}

          {!isLoading && !isError && (
            <div className="w-full overflow-x-hidden">
              <Table className="w-full text-sm">
                <TableHeader className="sticky top-0 z-10 bg-gray-50">
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead className="w-24">Image</TableHead>
                    <TableHead>Name & Address</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="w-32">Status</TableHead>
                    <TableHead className="w-48 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p, index) => (
                    <TableRow key={p.id} className="odd:bg-gray-50 hover:bg-gray-100/60">
                      <TableCell className="font-medium text-gray-500">{index + 1}</TableCell>
                      <TableCell>
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-blue-600" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-900">{p.name}</div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-3 w-3 mr-1" />
                            {p.location}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              {p.totalUnits > 1 ? "Apartment" : "Single-family home"}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            {p.totalUnits} unit{p.totalUnits !== 1 ? 's' : ''}
                          </div>
                          <div className="text-sm text-gray-600">
                            Rent: KES {p.monthlyRevenue?.toLocaleString() || "0"} - {p.monthlyRevenue?.toLocaleString() || "0"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-gray-100 text-gray-800">Available</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Dialog onOpenChange={(v) => { if (!v) setEditing(null); }}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => { setEditing(p); setOpen(true); }}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setConfirmArchiveId(p.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="flex items-center space-x-2">
                            <ToggleLeft className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-gray-600">Available</span>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                        No properties found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Property Dialog */}
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
        <DialogTrigger asChild>
          <div className="hidden" />
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

      {/* Confirm Archive Dialog */}
      <ConfirmDialog
        open={confirmArchiveId !== null}
        title="Delete property?"
        message="You are about to delete this item. It will be moved to Archive and can be permanently deleted later."
        onCancel={() => setConfirmArchiveId(null)}
        onConfirm={async () => {
          if (confirmArchiveId == null) return;
          await archiveMutation.mutateAsync({ id: confirmArchiveId, archived: true });
          setConfirmArchiveId(null);
        }}
      />
    </div>
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
          status: editing.status,
        }
      : {
          name: "",
          location: "",
          totalUnits: 0,
          occupiedUnits: 0,
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
    <DialogContent className="max-w-2xl">
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


