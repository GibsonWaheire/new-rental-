import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, queryKeys, API_BASE_URL } from "@/lib/api";
import type { AppSettings } from "@/types/entities";
import { toast } from "@/components/ui/use-toast";

export function useSettingsData() {
  const qc = useQueryClient();

  const { data: settings, isLoading, isError } = useQuery({
    queryKey: queryKeys.resource("settings"),
    queryFn: async () => {
      // Try collection-style endpoint first
      try {
        return await api.get("settings", 1);
      } catch {
        // Fallback to single-object endpoint
        const resp = await fetch(`${API_BASE_URL}/settings`);
        if (!resp.ok) throw new Error("Failed to load settings");
        return (await resp.json()) as AppSettings;
      }
    },
  });

  const update = useMutation({
    mutationFn: async (partial: Partial<AppSettings & Record<string, unknown>>) => {
      // Try PATCH /settings/1, fallback to PATCH /settings
      try {
        return await api.update("settings", 1, partial);
      } catch {
        const resp = await fetch(`${API_BASE_URL}/settings`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(partial),
        });
        if (!resp.ok) throw new Error("Failed to update settings");
        return (await resp.json()) as AppSettings;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.resource("settings") }); toast({ title: "Settings saved" }); },
  });

  return { settings, isLoading, isError, update } as const;
}


