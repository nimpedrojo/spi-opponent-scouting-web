import { z } from 'zod';

const phaseTypeSchema = z.enum([
  'attack',
  'defense',
  'attacking_transition',
  'defensive_transition',
  'set_piece',
]);

const blockTypeSchema = z.enum(['high_block', 'mid_block', 'low_block']);

const keyPointSchema = z.string().trim().min(1).max(300);

export const scoutingReportTacticalAnalysisParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const replaceScoutingReportTacticalAnalysisBodySchema = z.object({
  items: z.array(
    z.object({
      phaseType: phaseTypeSchema,
      blockType: blockTypeSchema.nullable(),
      narrative: z.string().trim().min(1).max(4000),
      keyPoints: z.array(keyPointSchema).max(20).optional(),
    }),
  ),
});
