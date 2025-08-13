import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Pencil, Archive as ArchiveIcon, Trash2 } from "lucide-react";
import type { ID, Property, Tenant } from "@/types/entities";

function statusBadgeClass(status: Tenant["status"]) {
  return status === "Active" ? "bg-green-200 text-green-900" : "bg-gray-200 text-gray-900";
}
function paymentBadgeClass(ps: Tenant["paymentStatus"]) {
  return ps === "Paid" ? "bg-green-200 text-green-900" : ps === "Overdue" ? "bg-red-200 text-red-900" : "bg-yellow-200 text-yellow-900";
}

interface TenantsTableProps {
  data: Tenant[];
  propertyById: Map<ID, Property>;
  onEdit: (t: Tenant) => void;
  onArchiveToggle: (id: ID, archived: boolean) => void;
  onDelete: (id: ID) => void;
}

export default function TenantsTable({ data, propertyById, onEdit, onArchiveToggle, onDelete }: TenantsTableProps) {
  return (
    <div className="w-full overflow-x-hidden">
      <Table className="w-full text-sm">
        <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="text-right">Rent</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="hidden md:table-cell">Property</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((t) => (
            <TableRow key={t.id} className="odd:bg-gray-50 hover:bg-gray-100/60">
              <TableCell className="font-medium">{t.name}</TableCell>
              <TableCell>{t.unit}</TableCell>
              <TableCell>{t.phone}</TableCell>
              <TableCell className="text-green-700 text-right tabular-nums whitespace-nowrap">KES {t.rentAmount.toLocaleString()}</TableCell>
              <TableCell><Badge className={`${statusBadgeClass(t.status)} uppercase tracking-wide px-2 py-0.5`}>{t.status}</Badge></TableCell>
              <TableCell><Badge className={`${paymentBadgeClass(t.paymentStatus)} uppercase tracking-wide px-2 py-0.5`}>{t.paymentStatus}</Badge></TableCell>
              <TableCell className="hidden md:table-cell">{propertyById.get(t.propertyId)?.name ?? t.propertyId}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" aria-label="Actions">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => onEdit(t)}><Pencil className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onArchiveToggle(t.id, !t.archived)}><ArchiveIcon className="h-4 w-4 mr-2" /> {t.archived ? "Unarchive" : "Archive"}</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600" onClick={() => onDelete(t.id)}><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">No tenants found. Adjust filters or search.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}


