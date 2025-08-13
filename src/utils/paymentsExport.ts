import type { ID, Lease, Payment, Property, Tenant } from "@/types/entities";

export function exportPaymentsCSV(
  filtered: Payment[],
  tenantById: Map<ID, Tenant>,
  leaseById: Map<ID, Lease>,
  propertyById: Map<ID, Property>
) {
  const rows = [
    ["Tenant","Property","Lease","Amount","Method","Date","Status","Reference"],
    ...filtered.map((p) => [
      tenantById.get(p.tenantId)?.name ?? p.tenantId,
      propertyById.get(leaseById.get(p.leaseId)?.propertyId ?? -1 as ID)?.name ?? "-",
      p.leaseId,
      String(p.amount),
      p.method,
      new Date(p.date).toLocaleString(),
      p.status,
      p.reference,
    ]),
  ];
  const escape = (val: unknown) => String(val).replace(/"/g, '""');
  const csv = rows.map((r) => r.map((v) => `"${escape(v)}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `payments-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportPaymentsPDF(
  filtered: Payment[],
  tenantById: Map<ID, Tenant>,
  leaseById: Map<ID, Lease>,
  propertyById: Map<ID, Property>
) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  doc.setFontSize(18);
  doc.text("Payments", margin, margin);
  doc.setDrawColor(220);
  doc.line(margin, margin + 8, doc.internal.pageSize.getWidth() - margin, margin + 8);
  doc.setFontSize(10);
  const headers = ["Tenant","Property","Lease","Amount","Method","Date","Status","Ref"];
  const colWidths = [110, 110, 50, 80, 80, 120, 70, 80];
  let x = margin; let y = margin + 28;
  headers.forEach((h, i) => { doc.text(h, x, y); x += colWidths[i]; });
  y += 16;
  filtered.slice(0, 40).forEach((p) => {
    x = margin;
    const cols = [
      tenantById.get(p.tenantId)?.name ?? String(p.tenantId),
      propertyById.get(leaseById.get(p.leaseId)?.propertyId ?? -1 as ID)?.name ?? "-",
      `#${p.leaseId}`,
      `KES ${p.amount.toLocaleString()}`,
      p.method,
      new Date(p.date).toLocaleString(),
      p.status,
      p.reference,
    ];
    cols.forEach((c, i) => { doc.text(String(c), x, y); x += colWidths[i]; });
    y += 16;
  });
  doc.save(`payments-${Date.now()}.pdf`);
}


