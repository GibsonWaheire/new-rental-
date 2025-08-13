import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { ID, Property, Tenant } from "@/types/entities";

interface LeasesFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  properties: Property[];
  tenants: Tenant[];
  status?: "Active" | "Expired" | "Pending Renewal" | "Pending" | "Archived";
  setStatus: (s?: "Active" | "Expired" | "Pending Renewal" | "Pending" | "Archived") => void;
  propertyId?: ID;
  setPropertyId: (id?: ID) => void;
  tenantId?: ID;
  setTenantId: (id?: ID) => void;
  sortBy: "start" | "end" | "rent";
  setSortBy: (v: "start" | "end" | "rent") => void;
  onReset: () => void;
}

export default function LeasesFilters({ search, onSearchChange, properties, tenants, status, setStatus, propertyId, setPropertyId, tenantId, setTenantId, sortBy, setSortBy, onReset }: LeasesFiltersProps) {
  return (
    <Collapsible defaultOpen className="w-full">
      <div className="flex items-center gap-2">
        <Input placeholder="Search leases..." value={search} onChange={(e) => onSearchChange(e.target.value)} className="flex-1 min-w-[180px]" />
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="md:hidden">Filters</Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="mt-2 md:mt-0 md:block data-[state=closed]:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row gap-2">
          <Select value={status} onValueChange={(v) => setStatus(v as LeasesFiltersProps["status"]) }>
            <SelectTrigger className="min-w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Pending Renewal">Pending Renewal</SelectItem>
              <SelectItem value="Expired">Expired</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={propertyId ? String(propertyId) : undefined} onValueChange={(v) => setPropertyId(Number(v) as ID)}>
            <SelectTrigger className="min-w-[160px]"><SelectValue placeholder="Property" /></SelectTrigger>
            <SelectContent>{properties.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={tenantId ? String(tenantId) : undefined} onValueChange={(v) => setTenantId(Number(v) as ID)}>
            <SelectTrigger className="min-w-[160px]"><SelectValue placeholder="Tenant" /></SelectTrigger>
            <SelectContent>{tenants.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as LeasesFiltersProps["sortBy"]) }>
            <SelectTrigger className="min-w-[160px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="start">Start date</SelectItem>
              <SelectItem value="end">End date</SelectItem>
              <SelectItem value="rent">Rent</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={onReset}>Reset</Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}


