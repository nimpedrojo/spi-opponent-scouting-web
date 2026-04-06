import type { FastifyPluginCallback } from 'fastify';

import { validateRequestPart } from '../../../shared/http/validation.js';
import { OpponentController } from '../controllers/opponent.controller.js';
import type {
  CreateOpponentBodyDto,
  GetOpponentByIdParamsDto,
  ListOpponentsQueryDto,
  UpdateOpponentBodyDto,
  UpdateOpponentParamsDto,
} from '../dtos/opponent-request.dto.js';
import type { OpponentRepository } from '../repositories/opponent.repository.js';
import {
  createOpponentBodySchema,
  listOpponentsQuerySchema,
  opponentIdParamsSchema,
  updateOpponentBodySchema,
} from '../schemas/opponent.schemas.js';
import { OpponentService } from '../services/opponent.service.js';

export interface OpponentRoutesOptions {
  opponentRepository: OpponentRepository;
}

export const opponentRoutes: FastifyPluginCallback<OpponentRoutesOptions> = (
  fastify,
  options,
  done,
) => {
  const opponentService = new OpponentService(options.opponentRepository);
  const opponentController = new OpponentController(opponentService);

  fastify.post<{ Body: CreateOpponentBodyDto }>(
    '/',
    {
      preHandler: [validateRequestPart(createOpponentBodySchema, 'body')],
    },
    opponentController.createOpponent.bind(opponentController),
  );

  fastify.put<{
    Params: UpdateOpponentParamsDto;
    Body: UpdateOpponentBodyDto;
  }>(
    '/:opponentId',
    {
      preHandler: [
        validateRequestPart(opponentIdParamsSchema, 'params'),
        validateRequestPart(updateOpponentBodySchema, 'body'),
      ],
    },
    opponentController.updateOpponent.bind(opponentController),
  );

  fastify.get<{ Params: GetOpponentByIdParamsDto }>(
    '/:opponentId',
    {
      preHandler: [validateRequestPart(opponentIdParamsSchema, 'params')],
    },
    opponentController.getOpponentById.bind(opponentController),
  );

  fastify.get<{ Querystring: ListOpponentsQueryDto }>(
    '/',
    {
      preHandler: [validateRequestPart(listOpponentsQuerySchema, 'query')],
    },
    opponentController.listOpponents.bind(opponentController),
  );

  done();
};
