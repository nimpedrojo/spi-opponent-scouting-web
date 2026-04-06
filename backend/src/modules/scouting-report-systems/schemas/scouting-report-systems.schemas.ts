import { z } from 'zod';

const systemCodeSchema = z.string().trim().min(1).max(20);

export const scoutingReportSystemsParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const replaceScoutingReportSystemsBodySchema = z.object({
  primarySystem: systemCodeSchema,
  alternateSystems: z.array(systemCodeSchema).max(10),
});
