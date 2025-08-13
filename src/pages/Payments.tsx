import { useQuery } from "@tanstack/react-query";
import { api, queryKeys } from "@/lib/api";
import type { Payment } from "@/types/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function PaymentsPage() {
  const { data: payments = [], isLoading, isError } = useQuery({
    queryKey: queryKeys.resource("payments"),
    queryFn: () => api.list("payments", { _sort: "date", _order: "desc" }),
  });

  const badge = (status: Payment["status"]) =>
    status === "Completed"
      ? "bg-green-100 text-green-800"
      : status === "Pending"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-red-100 text-red-800";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payments</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <div>Loading...</div>}
        {isError && <div className="text-red-600">Failed to load payments.</div>}
        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Amount (KES)</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p: Payment) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.tenantId}</TableCell>
                    <TableCell className="text-green-700">{p.amount.toLocaleString()}</TableCell>
                    <TableCell>{p.method}</TableCell>
                    <TableCell>{new Date(p.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={badge(p.status)}>{p.status}</Badge>
                    </TableCell>
                    <TableCell>{p.reference}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


