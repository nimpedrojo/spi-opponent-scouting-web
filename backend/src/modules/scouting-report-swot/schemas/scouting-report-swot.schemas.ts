import { z } from 'zod';

const swotTypeSchema = z.enum([
  'strength',
  'weakness',
  'opportunity',
  'threat',
]);

export const scoutingReportSwotParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const replaceScoutingReportSwotBodySchema = z.object({
  items: z.array(
    z.object({
      swotType: swotTypeSchema,
      description: z.string().trim().min(1).max(2000),
      priority: z.coerce
        .number()
        .int()
        .positive()
        .max(10)
        .nullable()
        .optional(),
    }),
  ),
});
