import { z } from 'zod';

const optionalDateString = z.string().date().optional();

export const createScoutingReportBodySchema = z.object({
  opponentId: z.coerce.number().int().positive(),
  reportDate: optionalDateString,
});

export const scoutingReportIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const updateScoutingReportBodySchema = z
  .object({
    opponentId: z.coerce.number().int().positive().optional(),
    reportDate: z.union([z.string().date(), z.null()]).optional(),
  })
  .refine(
    (value) => value.opponentId !== undefined || value.reportDate !== undefined,
    {
      message: 'At least one report metadata field must be provided',
    },
  );

export const listScoutingReportsQuerySchema = z.object({
  opponentId: z.coerce.number().int().positive().optional(),
  status: z.enum(['draft', 'published']).optional(),
  season: z.coerce.number().int().min(2000).max(3000).optional(),
});
