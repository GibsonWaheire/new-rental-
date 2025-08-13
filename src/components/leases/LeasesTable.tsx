import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Pencil, Archive as ArchiveIcon, Trash2, FileText as FileTextIcon, Repeat, Bell } from "lucide-react";
import type { ID, Lease, Property, Tenant } from "@/types/entities";

interface LeasesTableProps {
  data: Lease[];
  propertyById: Map<ID, Property>;
  tenantById: Map<ID, Tenant>;
  computedStatus: (l: Lease) => string;
  onEdit: (l: Lease) => void;
  onArchiveToggle: (id: ID, archived: boolean) => void;
  onDelete: (id: ID) => void;
  onDownload: (l: Lease) => void;
  onRenew: (l: Lease) => void;
  onReminder: (l: Lease) => void;
}

export default function LeasesTable({ data, propertyById, tenantById, computedStatus, onEdit, onArchiveToggle, onDelete, onDownload, onRenew, onReminder }: LeasesTableProps) {
  return (
    <div className="w-full overflow-x-hidden">
      <Table className="w-full text-sm">
        <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
          <TableRow>
            <TableHead>Property</TableHead>
            <TableHead>Tenant</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Period</TableHead>
            <TableHead className="text-right">Rent</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((l) => {
            const status = computedStatus(l);
            const statusClass = status === "Expired" ? "bg-red-100 text-red-800" : status === "Pending Renewal" ? "bg-yellow-100 text-yellow-800" : status === "Pending" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800";
            return (
              <TableRow key={l.id} className="odd:bg-gray-50 hover:bg-gray-100/60">
                <TableCell>{propertyById.get(l.propertyId)?.name ?? l.propertyId}</TableCell>
                <TableCell>{tenantById.get(l.tenantId)?.name ?? l.tenantId}</TableCell>
                <TableCell>{l.unit}</TableCell>
                <TableCell>{new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</TableCell>
                <TableCell className="text-green-700 text-right tabular-nums whitespace-nowrap">KES {l.rentAmount.toLocaleString()}</TableCell>
                <TableCell><Badge className={`${statusClass} uppercase tracking-wide px-2 py-0.5`}>{status}</Badge></TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" aria-label="Actions">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => onEdit(l)}><Pencil className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onArchiveToggle(l.id, !(l as unknown as { archived?: boolean }).archived)}><ArchiveIcon className="h-4 w-4 mr-2" /> {(l as unknown as { archived?: boolean }).archived ? "Unarchive" : "Archive"}</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onDownload(l)}><FileTextIcon className="h-4 w-4 mr-2" /> Download</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onRenew(l)}><Repeat className="h-4 w-4 mr-2" /> Renew</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onReminder(l)}><Bell className="h-4 w-4 mr-2" /> Reminder</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => onDelete(l.id)}><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">No leases found. Adjust filters or search.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}


