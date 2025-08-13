import { z } from "zod";

export const paymentSchema = z.object({
  tenantId: z.coerce.number().int().positive(),
  leaseId: z.coerce.number().int().positive(),
  amount: z.coerce.number().positive(),
  method: z.enum(["M-Pesa", "Bank Transfer", "Cash", "Card"]).default("Cash"),
  date: z.string(),
  status: z.enum(["Completed", "Pending", "Overdue"]).default("Completed"),
  reference: z.string().min(1),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;


