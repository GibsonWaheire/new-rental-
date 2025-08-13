import { z } from "zod";

export const maintenanceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  propertyId: z.coerce.number().int().positive(),
  tenantId: z.coerce.number().int().positive().optional().or(z.literal(NaN)).transform((v) => (Number.isNaN(v) ? undefined : v)),
  priority: z.enum(["Critical", "High", "Medium", "Low"]).default("Low"),
  status: z.enum(["Open", "Pending", "In Progress", "Completed"]).default("Open"),
  dateSubmitted: z.string(),
  estimatedCost: z.coerce.number().nonnegative().optional(),
  documents: z
    .array(
      z.object({
        id: z.number().optional(),
        name: z.string(),
        mimeType: z.string(),
        size: z.number(),
        dataUrl: z.string(),
      })
    )
    .optional(),
});

export type MaintenanceFormValues = z.infer<typeof maintenanceSchema>;


