import { Fragment, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MoreHorizontal, Pencil, Archive as ArchiveIcon, FileText as FileTextIcon, Mail, CheckCircle, ChevronDown, ChevronUp, CreditCard } from "lucide-react";
import type { ID, Lease, Payment, Property, Tenant } from "@/types/entities";
import { badgeClassForMethod, badgeClassForStatus, formatAmountKES, formatDateTime, formatShortDate } from "@/utils/paymentsHelpers";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface PaymentsTableProps {
  data: Payment[];
  compact: boolean;
  selected: Set<ID>;
  setSelected: (next: Set<ID>) => void;
  tenantById: Map<ID, Tenant>;
  leaseById: Map<ID, Lease>;
  propertyById: Map<ID, Property>;
  onEdit: (payment: Payment) => void;
  onArchiveToggle: (id: ID, archived: boolean) => void;
  onDelete: (id: ID) => void;
  onMarkPaid: (id: ID) => void;
  isArchived: (p: Payment) => boolean;
  onViewReceipt: (p: Payment) => Promise<void> | void;
  containerClassName?: string;
}

export default function PaymentsTable({ data, compact, selected, setSelected, tenantById, leaseById, propertyById, onEdit, onArchiveToggle, onDelete, onMarkPaid, isArchived, onViewReceipt, containerClassName }: PaymentsTableProps) {
  const [expanded, setExpanded] = useState<Set<ID>>(new Set());

  const toggleExpanded = (id: ID) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpanded(next);
  };

  return (
    <div className={cn("w-full overflow-x-hidden", containerClassName)}>
      <Table className="w-full text-sm table-fixed">
        <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
          <TableRow>
            <TableHead className="w-[44px] px-4 py-2"><input type="checkbox" onChange={(e) => {
              if (e.target.checked) setSelected(new Set(data.map((p) => p.id)));
              else setSelected(new Set());
            }} /></TableHead>
            <TableHead className="sticky left-0 z-20 bg-white px-4 py-2">Tenant</TableHead>
            <TableHead className="text-right px-4 py-2 w-[120px]">Amount</TableHead>
            <TableHead className="px-4 py-2 w-[110px]">Status</TableHead>
            <TableHead className="px-4 py-2 w-[110px]">Date</TableHead>
            <TableHead className="px-4 py-2 truncate max-w-[180px] md:max-w-[260px]">Lease / Ref</TableHead>
            {!compact && (
              <TableHead className="text-center px-4 py-2 w-[80px]">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center justify-center w-full">
                      <CreditCard className="h-4 w-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Method</TooltipContent>
                </Tooltip>
              </TableHead>
            )}
            <TableHead className="text-right px-4 py-2 w-[72px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((p) => (
            <Fragment key={`item-${p.id}`}>
              <TableRow key={`row-${p.id}`} className="odd:bg-gray-50 hover:bg-gray-100/60">
                <TableCell className="align-middle px-4 py-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={selected.has(p.id)} onChange={(e) => {
                      const copy = new Set(selected); if (e.target.checked) copy.add(p.id); else copy.delete(p.id); setSelected(copy);
                    }} />
                    <Button variant="ghost" size="icon" aria-label="More details" onClick={() => toggleExpanded(p.id)}>
                      {expanded.has(p.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="font-medium sticky left-0 z-10 bg-white/80 backdrop-blur-sm px-4 py-2 truncate max-w-[160px] md:max-w-[220px]" title={tenantById.get(p.tenantId)?.name ?? String(p.tenantId)}>{tenantById.get(p.tenantId)?.name ?? p.tenantId}</TableCell>
                <TableCell className="text-green-700 text-right tabular-nums whitespace-nowrap px-4 py-2">{formatAmountKES(p.amount)}</TableCell>
                <TableCell className="px-4 py-2 whitespace-nowrap"><Badge className={`${badgeClassForStatus(p.status)} uppercase tracking-wide px-2 py-0.5`}>{p.status}</Badge></TableCell>
                <TableCell className="px-4 py-2 whitespace-nowrap w-[110px]" title={formatDateTime(p.date)}>{formatShortDate(p.date)}</TableCell>
                <TableCell className="px-4 py-2 truncate max-w-[180px] md:max-w-[260px]" title={`#${p.leaseId} • ${p.reference}`}>#{p.leaseId} • {p.reference}</TableCell>
                {!compact && (
                  <TableCell className="px-4 py-2"><Badge className={`${badgeClassForMethod(p.method)} uppercase tracking-wide px-2 py-0.5`}>{p.method}</Badge></TableCell>
                )}
                <TableCell className="text-right px-4 py-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" aria-label="Actions">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => onEdit(p)}><Pencil className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onArchiveToggle(p.id, !isArchived(p))}><ArchiveIcon className="h-4 w-4 mr-2" /> {isArchived(p) ? "Unarchive" : "Archive"}</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onViewReceipt(p)}><FileTextIcon className="h-4 w-4 mr-2" /> View receipt</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast({ title: "Receipt resent", description: p.reference })}><Mail className="h-4 w-4 mr-2" /> Resend receipt</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onMarkPaid(p.id)}><CheckCircle className="h-4 w-4 mr-2" /> Mark as paid</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => onDelete(p.id)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              {expanded.has(p.id) && (
                <TableRow key={`expand-${p.id}`} className="bg-white/70">
                  <TableCell colSpan={compact ? 7 : 8} className="py-4 px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
                      <div><span className="font-medium text-foreground">Property:</span> {propertyById.get(leaseById.get(p.leaseId)?.propertyId ?? -1 as ID)?.name ?? "-"}</div>
                      <div><span className="font-medium text-foreground">Method:</span> <Badge className={`${badgeClassForMethod(p.method)} uppercase tracking-wide px-2 py-0.5 ml-1`}>{p.method}</Badge></div>
                      <div className="sm:col-span-2 truncate" title={p.reference}><span className="font-medium text-foreground">Reference:</span> {p.reference}</div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={10} className="text-center text-sm text-muted-foreground py-8">No payments found. Adjust filters or search.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}


