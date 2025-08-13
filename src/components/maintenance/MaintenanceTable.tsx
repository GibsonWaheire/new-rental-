import { Fragment, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Archive as ArchiveIcon, FileDown, FileText as FileTextIcon, Pencil, Trash, ChevronDown, ChevronUp } from "lucide-react";
import type { ID, MaintenanceRequest, Property, Tenant } from "@/types/entities";

function statusClass(status: MaintenanceRequest["status"]) {
  return status === "Completed" ? "bg-green-100 text-green-800"
    : status === "In Progress" ? "bg-blue-100 text-blue-800"
    : status === "Pending" ? "bg-yellow-100 text-yellow-800"
    : "bg-gray-100 text-gray-800";
}
function priorityClass(priority: MaintenanceRequest["priority"]) {
  return priority === "Critical" ? "bg-red-100 text-red-800"
    : priority === "High" ? "bg-orange-100 text-orange-800"
    : priority === "Medium" ? "bg-yellow-100 text-yellow-800"
    : "bg-green-100 text-green-800";
}

interface MaintenanceTableProps {
  data: MaintenanceRequest[];
  propertyById: Map<ID, Property>;
  tenantById: Map<ID, Tenant>;
  onEdit: (r: MaintenanceRequest) => void;
  onArchiveToggle: (id: ID, archived: boolean) => void;
  onDelete: (id: ID) => void;
  onExportPDF: (request: MaintenanceRequest) => void;
}

export default function MaintenanceTable({ data, propertyById, tenantById, onEdit, onArchiveToggle, onDelete, onExportPDF }: MaintenanceTableProps) {
  const [expanded, setExpanded] = useState<Set<ID>>(new Set());
  const toggle = (id: ID) => { 
    const next = new Set(expanded); 
    next.has(id) ? next.delete(id) : next.add(id); 
    setExpanded(next); 
  };

  return (
    <div className="w-full overflow-x-hidden">
      <Table className="w-full text-sm table-fixed">
        <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
          <TableRow>
            <TableHead className="w-[44px]" />
            <TableHead>Title</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Tenant</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="text-right w-[72px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((r) => (
            <Fragment key={`item-${r.id}`}>
              <TableRow key={`row-${r.id}`} className="odd:bg-gray-50 hover:bg-gray-100/60">
                <TableCell className="align-middle">
                  <Button variant="ghost" size="icon" aria-label="More details" onClick={() => toggle(r.id)}>
                    {expanded.has(r.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </TableCell>
                <TableCell className="font-medium truncate max-w-[220px]" title={r.title}>{r.title}</TableCell>
                <TableCell className="truncate max-w-[180px]" title={propertyById.get(r.propertyId)?.name}>{propertyById.get(r.propertyId)?.name ?? r.propertyId}</TableCell>
                <TableCell className="truncate max-w-[180px]" title={r.tenantId ? String(tenantById.get(r.tenantId)?.name || r.tenantId) : "-"}>{r.tenantId ? (tenantById.get(r.tenantId)?.name ?? r.tenantId) : "-"}</TableCell>
                <TableCell><Badge className={`${priorityClass(r.priority)} uppercase tracking-wide px-2 py-0.5`}>{r.priority}</Badge></TableCell>
                <TableCell><Badge className={`${statusClass(r.status)} uppercase tracking-wide px-2 py-0.5`}>{r.status}</Badge></TableCell>
                <TableCell className="whitespace-nowrap">{new Date(r.dateSubmitted).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" aria-label="Actions">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => onEdit(r)}><Pencil className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onArchiveToggle(r.id, !r.archived)}><ArchiveIcon className="h-4 w-4 mr-2" /> {r.archived ? "Unarchive" : "Archive"}</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onExportPDF(r)}><FileTextIcon className="h-4 w-4 mr-2" /> Export PDF</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => onDelete(r.id)}><Trash className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              {expanded.has(r.id) && (
                <TableRow key={`expand-${r.id}`} className="bg-white/70">
                  <TableCell colSpan={8} className="py-4 px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
                      <div><span className="font-medium text-foreground">Property:</span> {propertyById.get(r.propertyId)?.name ?? r.propertyId}</div>
                      <div><span className="font-medium text-foreground">Tenant:</span> {r.tenantId ? (tenantById.get(r.tenantId)?.name ?? r.tenantId) : "-"}</div>
                      <div className="sm:col-span-2"><span className="font-medium text-foreground">Cost:</span> {r.estimatedCost != null ? `KES ${r.estimatedCost.toLocaleString()}` : "-"}</div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">No requests found. Adjust filters or search.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}


