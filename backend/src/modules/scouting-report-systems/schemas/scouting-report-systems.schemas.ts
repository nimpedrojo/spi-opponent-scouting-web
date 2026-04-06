import { z } from 'zod';

const systemCodeSchema = z.string().trim().min(1).max(20);
const pitchPlayerPositionSchema = z.object({
  playerNumber: z.coerce.number().int().min(1).max(11),
  x: z.coerce.number().min(0).max(100),
  y: z.coerce.number().min(0).max(100),
});
const systemSelectionSchema = z.object({
  systemCode: systemCodeSchema,
  playerPositions: z.array(pitchPlayerPositionSchema).max(11),
});

export const scoutingReportSystemsParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const replaceScoutingReportSystemsBodySchema = z.object({
  primarySystem: systemSelectionSchema,
  alternateSystems: z.array(systemSelectionSchema).max(10),
});
