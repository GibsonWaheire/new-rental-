import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Plus } from "lucide-react";
import { api, queryKeys } from "@/lib/api";
import type { Property } from "@/types/entities";
import { toast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";

export const PropertyOverview = ({ compact = false }: { compact?: boolean }) => {
  const qc = useQueryClient();
  const { data: properties = [], isLoading } = useQuery({ queryKey: queryKeys.resource("properties"), queryFn: () => api.list("properties") });
  const [open, setOpen] = useState(false);
  const createProperty = useMutation({
    mutationFn: (values: Omit<Property, "id">) => api.create("properties", { ...values, archived: false } as Omit<Property, "id">),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.resource("properties") }); toast({ title: "Property added" }); setOpen(false); },
  });

  return (
    <Card>
      <CardHeader className={`flex flex-row items-center justify-between ${compact ? "py-3" : ""}`}>
        <CardTitle className="text-lg font-semibold">Properties Overview</CardTitle>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/properties">View All</Link>
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </DialogTrigger>
            <AddPropertyDialog onSubmit={(values) => createProperty.mutate(values)} />
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <div className="text-sm text-muted-foreground">Loading properties...</div>}
        {!isLoading && properties.length === 0 && (
          <div className="text-sm text-muted-foreground">No properties yet. Click Add Property to get started.</div>
        )}
        <div className="space-y-4">
          {properties.filter((p) => !p.archived).map((property) => (
            <div key={property.id} className={`border rounded-lg ${compact ? "p-3" : "p-4"} hover:bg-gray-50 transition-colors`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">{property.name}</h4>
                  <div className="flex items-center text-gray-600 text-sm mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.location}
                  </div>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  {property.status}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Occupancy</p>
                  <p className="font-semibold">{property.occupiedUnits}/{property.totalUnits} units</p>
                </div>
                <div>
                  <p className="text-gray-600">Rate</p>
                  <p className="font-semibold">{Math.round((property.occupiedUnits / property.totalUnits) * 100)}%</p>
                </div>
                {/* <div>
                  <p className="text-gray-600">Monthly Revenue</p>
                  <p className="font-semibold text-green-600">KES {property.monthlyRevenue.toLocaleString()}</p>
                </div> */}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

function AddPropertyDialog({ onSubmit }: { onSubmit: (values: Omit<Property, "id">) => void }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [totalUnits, setTotalUnits] = useState<number>(0);
  const [occupiedUnits, setOccupiedUnits] = useState<number>(0);
  // const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  const [status, setStatus] = useState<Property["status"]>("Active");

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Property</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="totalUnits">Total Units</Label>
          <Input id="totalUnits" type="number" value={totalUnits} onChange={(e) => setTotalUnits(Number(e.target.value))} />
        </div>
        <div>
          <Label htmlFor="occupiedUnits">Occupied Units</Label>
          <Input id="occupiedUnits" type="number" value={occupiedUnits} onChange={(e) => setOccupiedUnits(Number(e.target.value))} />
        </div>
        {/* <div>
          <Label htmlFor="monthlyRevenue">Monthly Revenue (KES)</Label>
          <Input id="monthlyRevenue" type="number" value={monthlyRevenue} onChange={(e) => setMonthlyRevenue(Number(e.target.value))} />
        </div> */}
        <div>
          <Label htmlFor="status">Status</Label>
          <Input id="status" value={status} onChange={(e) => setStatus(e.target.value as Property["status"])} />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={() => onSubmit({ name, location, totalUnits, occupiedUnits, monthlyRevenue: 0, status, archived: false })} className="bg-green-600 hover:bg-green-700">Save</Button>
      </DialogFooter>
    </DialogContent>
  );
}
