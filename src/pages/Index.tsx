import { useState } from "react";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { PropertyOverview } from "@/components/property/PropertyOverview";
import { TenantOverview } from "@/components/tenant/TenantOverview";
import { PaymentOverview } from "@/components/payment/PaymentOverview";
import { MaintenanceOverview } from "@/components/maintenance/MaintenanceOverview";
import { Button } from "@/components/ui/button";
import { useIsFetching } from "@tanstack/react-query";

export default function Index() {
  const [compact, setCompact] = useState(false);
  const isFetching = useIsFetching();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-2">
          <Button variant={compact ? "secondary" : "outline"} size="sm" onClick={() => setCompact((v) => !v)}>
            {compact ? "Comfortable" : "Compact"}
          </Button>
        </div>
      </div>
      <DashboardMetrics compact={compact} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PropertyOverview compact={compact} />
        <TenantOverview compact={compact} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PaymentOverview compact={compact} />
        <MaintenanceOverview compact={compact} />
      </div>

      <div className="pt-2 border-t text-xs text-muted-foreground flex items-center justify-between">
        <div>{isFetching ? "Syncing…" : "All data up to date"}</div>
        <div className="flex items-center gap-3">
          <a href="/settings" className="underline">Settings</a>
          <a href="https://example.com/docs" target="_blank" rel="noreferrer" className="underline">Docs</a>
          <span>v0.0.0</span>
        </div>
      </div>
    </div>
  );
}
