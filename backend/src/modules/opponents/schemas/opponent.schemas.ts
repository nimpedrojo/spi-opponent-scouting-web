import { z } from 'zod';

const optionalTextField = z.string().trim().min(1).max(120).optional();

export const createOpponentBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  countryName: optionalTextField,
  competitionName: optionalTextField,
});

export const updateOpponentBodySchema = createOpponentBodySchema;

export const opponentIdParamsSchema = z.object({
  opponentId: z.coerce.number().int().positive(),
});

export const listOpponentsQuerySchema = z.object({
  category: z.string().trim().min(1).max(120).optional(),
  season: z.coerce.number().int().min(2000).max(3000).optional(),
  status: z.enum(['draft', 'published']).optional(),
  search: z.string().trim().min(1).max(120).optional(),
});
