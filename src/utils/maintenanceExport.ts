import type { ID, MaintenanceRequest, Property, Tenant } from "@/types/entities";

export function exportMaintenanceCSV(requests: MaintenanceRequest[], propertyById: Map<ID, Property>, tenantById: Map<ID, Tenant>) {
  const rows = [["Title","Property","Tenant","Priority","Status","Date","Est. Cost"], ...requests.map((r) => [
    r.title,
    propertyById.get(r.propertyId)?.name ?? r.propertyId,
    r.tenantId ? (tenantById.get(r.tenantId)?.name ?? r.tenantId) : "-",
    r.priority,
    r.status,
    new Date(r.dateSubmitted).toLocaleDateString(),
    r.estimatedCost != null ? String(r.estimatedCost) : "-",
  ])];
  const escape = (val: unknown) => String(val).replace(/"/g, '""');
  const csv = rows.map((r) => r.map((v) => `"${escape(v)}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `maintenance-${Date.now()}.csv`; a.click(); URL.revokeObjectURL(url);
}

export async function exportMaintenancePDF(requests: MaintenanceRequest[], propertyById: Map<ID, Property>, tenantById: Map<ID, Tenant>) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  doc.setFontSize(18); doc.text("Maintenance Requests", margin, margin);
  doc.setDrawColor(220); doc.line(margin, margin + 8, doc.internal.pageSize.getWidth() - margin, margin + 8);
  doc.setFontSize(10);
  const headers = ["Title","Property","Tenant","Priority","Status","Date","Cost"];
  const colWidths = [140, 120, 120, 70, 80, 90, 80];
  let x = margin; let y = margin + 28;
  headers.forEach((h, i) => { doc.text(h, x, y); x += colWidths[i]; });
  y += 16;
  requests.slice(0, 50).forEach((r) => {
    x = margin;
    const cells = [
      r.title,
      propertyById.get(r.propertyId)?.name ?? r.propertyId,
      r.tenantId ? (tenantById.get(r.tenantId)?.name ?? r.tenantId) : "-",
      r.priority,
      r.status,
      new Date(r.dateSubmitted).toLocaleDateString(),
      r.estimatedCost != null ? `KES ${r.estimatedCost.toLocaleString()}` : "-",
    ];
    cells.forEach((c, i) => { doc.text(String(c), x, y); x += colWidths[i]; });
    y += 16;
  });
  doc.save(`maintenance-${Date.now()}.pdf`);
}


