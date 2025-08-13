export type ID = number;

export interface BaseEntity {
  id: ID;
  archived?: boolean;
}

export interface Property extends BaseEntity {
  name: string;
  location: string;
  totalUnits: number;
  occupiedUnits: number;
  monthlyRevenue: number;
  status: "Active" | "Inactive";
}

export interface Tenant extends BaseEntity {
  name: string;
  unit: string;
  phone: string;
  rentAmount: number;
  status: "Active" | "Inactive";
  paymentStatus: "Paid" | "Pending" | "Overdue";
  propertyId: ID;
}

export interface Lease extends BaseEntity {
  propertyId: ID;
  tenantId: ID;
  unit: string;
  startDate: string; // ISO
  endDate: string;   // ISO
  rentAmount: number;
  status: "Active" | "Terminated" | "Pending";
}

export interface Payment extends BaseEntity {
  tenantId: ID;
  leaseId: ID;
  amount: number;
  method: "M-Pesa" | "Bank Transfer" | "Cash" | "Card";
  date: string; // ISO
  status: "Completed" | "Pending" | "Overdue";
  reference: string;
}

export interface MaintenanceRequest extends BaseEntity {
  propertyId: ID;
  tenantId?: ID;
  title: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "Pending" | "In Progress" | "Completed";
  dateSubmitted: string; // ISO
  estimatedCost?: number;
}

export interface AppSettings extends BaseEntity {
  currency: string; // e.g., "KES"
  locale: string;   // e.g., "en-KE"
  theme: "light" | "dark";
  brandLogoUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  pushEnabled?: boolean;
}

export interface Notification extends BaseEntity {
  title: string;
  message: string;
  createdAt: string; // ISO
  read: boolean;
  type: "info" | "warning" | "success" | "error";
}

export interface LeaseDocument extends BaseEntity {
  leaseId: ID;
  name: string;
  mimeType: string;
  size: number;
  dataUrl: string;
}

export type EntityMap = {
  properties: Property;
  tenants: Tenant;
  leases: Lease;
  payments: Payment;
  maintenanceRequests: MaintenanceRequest;
  settings: AppSettings;
  notifications: Notification;
  leaseDocuments: LeaseDocument;
};


