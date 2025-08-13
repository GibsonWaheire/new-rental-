import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { ID, Property, Tenant } from "@/types/entities";

interface TenantsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  properties: Property[];
  status?: Tenant["status"];
  setStatus: (s?: Tenant["status"]) => void;
  propertyId?: ID;
  setPropertyId: (id?: ID) => void;
  sortBy: "name" | "rent" | "payment";
  setSortBy: (v: "name" | "rent" | "payment") => void;
  onReset: () => void;
}

export default function TenantsFilters({ search, onSearchChange, properties, status, setStatus, propertyId, setPropertyId, sortBy, setSortBy, onReset }: TenantsFiltersProps) {
  return (
    <Collapsible defaultOpen className="w-full">
      <div className="flex items-center gap-2">
        <Input placeholder="Search tenants..." value={search} onChange={(e) => onSearchChange(e.target.value)} className="flex-1 min-w-[180px]" />
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="md:hidden">Filters</Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="mt-2 md:mt-0 md:block data-[state=closed]:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row gap-2">
          <Select value={status} onValueChange={(v) => setStatus(v as Tenant["status"]) }>
            <SelectTrigger className="min-w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={propertyId ? String(propertyId) : undefined} onValueChange={(v) => setPropertyId(Number(v) as ID)}>
            <SelectTrigger className="min-w-[160px]"><SelectValue placeholder="Property" /></SelectTrigger>
            <SelectContent>{properties.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as TenantsFiltersProps["sortBy"]) }>
            <SelectTrigger className="min-w-[160px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="rent">Rent</SelectItem>
              <SelectItem value="payment">Payment Status</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={onReset}>Reset</Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}


