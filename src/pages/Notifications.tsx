import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, queryKeys } from "@/lib/api";
import type { Notification, ID } from "@/types/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data: notifications = [], isLoading, isError } = useQuery({
    queryKey: queryKeys.resource("notifications"),
    queryFn: () => api.list("notifications", { _sort: "createdAt", _order: "desc" }),
  });

  const markRead = useMutation({
    mutationFn: ({ id, read }: { id: ID; read: boolean }) => api.update("notifications", id, { read }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.resource("notifications") }),
  });

  const remove = useMutation({
    mutationFn: (id: ID) => api.remove("notifications", id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.resource("notifications") }),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <div>Loading...</div>}
        {isError && <div className="text-red-600">Failed to load notifications.</div>}
        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((n: Notification) => (
                  <TableRow key={n.id}>
                    <TableCell className="font-medium">{n.title}</TableCell>
                    <TableCell>{n.message}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          n.type === "success"
                            ? "bg-green-100 text-green-800"
                            : n.type === "warning"
                            ? "bg-yellow-100 text-yellow-800"
                            : n.type === "error"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }
                      >
                        {n.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(n.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => markRead.mutate({ id: n.id, read: !n.read })}>
                        {n.read ? "Mark Unread" : "Mark Read"}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => remove.mutate(n.id)}>
                        Delete
                      </Button>
                    </TableCell>
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


