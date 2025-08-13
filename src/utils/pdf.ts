import type { Payment, Tenant, Lease, Property } from "@/types/entities";

export async function generatePaymentReceiptPDF(
  payment: Payment,
  tenant?: Tenant,
  lease?: Lease,
  property?: Property
): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;

  doc.setFontSize(18);
  doc.text("Payment Receipt", margin, margin);

  doc.setFontSize(11);
  const lines: string[] = [
    `Receipt Ref: ${payment.reference}`,
    `Payment ID: ${payment.id}`,
    `Tenant: ${tenant?.name ?? payment.tenantId}`,
    `Property: ${property?.name ?? "-"}`,
    `Lease: ${lease ? `#${lease.id} (${lease.unit})` : payment.leaseId}`,
    `Amount: KES ${payment.amount.toLocaleString()}`,
    `Method: ${payment.method}`,
    `Date: ${new Date(payment.date).toLocaleString()}`,
    `Status: ${payment.status}`,
  ];

  lines.forEach((t, i) => doc.text(t, margin, margin + 24 + i * 16));

  const blob = doc.output("blob");
  return blob as Blob;
}


