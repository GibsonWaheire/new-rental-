import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, queryKeys } from "@/lib/api";
import type { AppSettings } from "@/types/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading, isError } = useQuery({
    queryKey: queryKeys.resource("settings"),
    queryFn: async () => {
      // json-server stores settings as an object. Fetch id 1 for simplicity
      return api.get("settings", 1);
    },
  });

  const mutation = useMutation({
    mutationFn: (partial: Partial<AppSettings>) => api.update("settings", 1, partial),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.resource("settings") }),
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError || !settings) return <div className="text-red-600">Failed to load settings.</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Input
            id="currency"
            defaultValue={settings.currency}
            onBlur={(e) => mutation.mutate({ currency: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="locale">Locale</Label>
          <Input
            id="locale"
            defaultValue={settings.locale}
            onBlur={(e) => mutation.mutate({ locale: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="theme">Theme</Label>
          <Select defaultValue={settings.theme} onValueChange={(v) => mutation.mutate({ theme: v as AppSettings["theme"] })}>
            <SelectTrigger id="theme">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-full mt-4">
          <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: queryKeys.resource("settings") })}>
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


