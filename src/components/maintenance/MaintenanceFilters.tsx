import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { ID, MaintenanceRequest, Property, Tenant } from "@/types/entities";

interface MaintenanceFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  properties: Property[];
  tenants: Tenant[];
  status?: MaintenanceRequest["status"];
  setStatus: (s?: MaintenanceRequest["status"]) => void;
  priority?: MaintenanceRequest["priority"];
  setPriority: (p?: MaintenanceRequest["priority"]) => void;
  propertyId?: ID;
  setPropertyId: (id?: ID) => void;
  tenantId?: ID;
  setTenantId: (id?: ID) => void;
  from: string; setFrom: (v: string) => void;
  to: string; setTo: (v: string) => void;
  sortBy: "date" | "priority" | "status" | "cost";
  setSortBy: (v: "date" | "priority" | "status" | "cost") => void;
  onReset: () => void;
}

export default function MaintenanceFilters({ search, onSearchChange, properties, tenants, status, setStatus, priority, setPriority, propertyId, setPropertyId, tenantId, setTenantId, from, setFrom, to, setTo, sortBy, setSortBy, onReset }: MaintenanceFiltersProps) {
  return (
    <Collapsible defaultOpen className="w-full">
      <div className="flex items-center gap-2">
        <Input placeholder="Search maintenance..." value={search} onChange={(e) => onSearchChange(e.target.value)} className="flex-1 min-w-[200px]" />
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="md:hidden">Filters</Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="mt-2 md:mt-0 md:block data-[state=closed]:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row gap-2">
          <Select value={propertyId ? String(propertyId) : undefined} onValueChange={(v) => setPropertyId(Number(v) as ID)}>
            <SelectTrigger className="min-w-[180px]"><SelectValue placeholder="Property" /></SelectTrigger>
            <SelectContent>{properties.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={tenantId ? String(tenantId) : undefined} onValueChange={(v) => setTenantId(Number(v) as ID)}>
            <SelectTrigger className="min-w-[160px]"><SelectValue placeholder="Tenant" /></SelectTrigger>
            <SelectContent>{tenants.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={priority} onValueChange={(v) => setPriority(v as MaintenanceRequest["priority"]) }>
            <SelectTrigger className="min-w-[160px]"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Critical">Critical</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => setStatus(v as MaintenanceRequest["status"]) }>
            <SelectTrigger className="min-w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as MaintenanceFiltersProps["sortBy"]) }>
            <SelectTrigger className="min-w-[160px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="cost">Est. Cost</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={onReset}>Reset</Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}


