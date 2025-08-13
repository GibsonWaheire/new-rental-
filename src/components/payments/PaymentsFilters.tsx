import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { ID, Lease, Tenant } from "@/types/entities";

interface PaymentsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  tenants: Tenant[];
  leases: Lease[];
  filterTenant?: number;
  setFilterTenant: (id?: number) => void;
  filterLease?: number;
  setFilterLease: (id?: number) => void;
  filterMethod?: string;
  setFilterMethod: (method?: string) => void;
  filterStatus?: string;
  setFilterStatus: (status?: string) => void;
  filterFrom: string;
  setFilterFrom: (value: string) => void;
  filterTo: string;
  setFilterTo: (value: string) => void;
  sortBy: "date" | "amount" | "status";
  setSortBy: (v: "date" | "amount" | "status") => void;
}

export default function PaymentsFilters({
  search, onSearchChange,
  tenants, leases,
  filterTenant, setFilterTenant,
  filterLease, setFilterLease,
  filterMethod, setFilterMethod,
  filterStatus, setFilterStatus,
  filterFrom, setFilterFrom,
  filterTo, setFilterTo,
  sortBy, setSortBy,
}: PaymentsFiltersProps) {
  return (
    <Collapsible defaultOpen className="w-full">
      <div className="flex items-center gap-2">
        <Input placeholder="Search payments..." value={search} onChange={(e) => onSearchChange(e.target.value)} className="flex-1 min-w-[180px]" />
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="md:hidden">Filters</Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="mt-2 md:mt-0 md:block data-[state=closed]:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row gap-2">
          <Select value={filterTenant ? String(filterTenant) : undefined} onValueChange={(v) => setFilterTenant(Number(v) as ID)}>
            <SelectTrigger className="min-w-[160px]"><SelectValue placeholder="Tenant" /></SelectTrigger>
            <SelectContent>{tenants.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filterLease ? String(filterLease) : undefined} onValueChange={(v) => setFilterLease(Number(v) as ID)}>
            <SelectTrigger className="min-w-[160px]"><SelectValue placeholder="Lease" /></SelectTrigger>
            <SelectContent>{leases.map((l) => <SelectItem key={l.id} value={String(l.id)}>#{l.id}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filterMethod} onValueChange={(v) => setFilterMethod(v)}>
            <SelectTrigger className="min-w-[160px]"><SelectValue placeholder="Method" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="M-Pesa">M-Pesa</SelectItem>
              <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Card">Card</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v)}>
            <SelectTrigger className="min-w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} />
          <Input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} />
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as PaymentsFiltersProps["sortBy"]) }>
            <SelectTrigger className="min-w-[160px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}


