import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { PropertyOverview } from "@/components/property/PropertyOverview";
import { TenantOverview } from "@/components/tenant/TenantOverview";
import { PaymentOverview } from "@/components/payment/PaymentOverview";
import { MaintenanceOverview } from "@/components/maintenance/MaintenanceOverview";

export default function Index() {
  return (
    <div className="space-y-6">
      <DashboardMetrics />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PropertyOverview />
        <TenantOverview />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PaymentOverview />
        <MaintenanceOverview />
      </div>
    </div>
  );
}
