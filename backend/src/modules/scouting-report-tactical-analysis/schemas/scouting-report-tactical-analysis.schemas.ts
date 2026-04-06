import { z } from 'zod';

const phaseTypeSchema = z.enum([
  'attack',
  'defense',
  'attacking_transition',
  'defensive_transition',
  'set_piece',
]);

const blockTypeSchema = z.enum([
  'high_block',
  'mid_block',
  'low_block',
  'corner',
  'wide_free_kick',
  'central_free_kick',
  'throw_in',
  'other',
]);

const keyPointSchema = z.string().trim().min(1).max(300);
const pitchPlayerPositionSchema = z.object({
  playerNumber: z.coerce.number().int().min(1).max(11),
  x: z.coerce.number().min(0).max(100),
  y: z.coerce.number().min(0).max(100),
});

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
      playerPositions: z.array(pitchPlayerPositionSchema).max(11).optional(),
    }),
  ),
});
