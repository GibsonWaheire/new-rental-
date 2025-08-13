import type { Payment } from "@/types/entities";

export function badgeClassForStatus(status: Payment["status"]): string {
  return status === "Completed"
    ? "bg-green-100 text-green-800"
    : status === "Pending"
    ? "bg-yellow-100 text-yellow-800"
    : "bg-red-100 text-red-800";
}

export function badgeClassForMethod(method: Payment["method"]): string {
  return method === "M-Pesa"
    ? "bg-green-100 text-green-800"
    : method === "Bank Transfer"
    ? "bg-blue-100 text-blue-800"
    : method === "Card"
    ? "bg-purple-100 text-purple-800"
    : "bg-gray-100 text-gray-800";
}

export function formatAmountKES(amount: number): string {
  return `KES ${amount.toLocaleString()}`;
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function isPaymentArchived(payment: Payment): boolean {
  return Boolean((payment as unknown as { archived?: boolean }).archived);
}


