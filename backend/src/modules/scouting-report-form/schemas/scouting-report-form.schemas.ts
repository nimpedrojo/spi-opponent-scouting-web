import { z } from 'zod';

const optionalTrimmedTextSchema = z.string().trim().min(1).max(2000).nullable();

export const scoutingReportFormParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const upsertScoutingReportFormBodySchema = z.object({
  leaguePosition: z.coerce.number().int().positive().max(999).nullable(),
  points: z.coerce.number().int().min(0).max(999).nullable(),
  recentFormText: optionalTrimmedTextSchema,
  notes: optionalTrimmedTextSchema,
});
