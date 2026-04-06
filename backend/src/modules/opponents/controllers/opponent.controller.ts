import type { FastifyReply, FastifyRequest } from 'fastify';

import type {
  CreateOpponentBodyDto,
  GetOpponentByIdParamsDto,
  ListOpponentsQueryDto,
  UpdateOpponentBodyDto,
  UpdateOpponentParamsDto,
} from '../dtos/opponent-request.dto.js';
import type { OpponentService } from '../services/opponent.service.js';

export class OpponentController {
  constructor(private readonly opponentService: OpponentService) {}

  async createOpponent(
    request: FastifyRequest<{ Body: CreateOpponentBodyDto }>,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    const opponent = await this.opponentService.createOpponent(request.body);

    return reply.status(201).send(opponent);
  }

  async updateOpponent(
    request: FastifyRequest<{
      Params: UpdateOpponentParamsDto;
      Body: UpdateOpponentBodyDto;
    }>,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    const opponent = await this.opponentService.updateOpponent(
      request.params.opponentId,
      request.body,
    );

    return reply.status(200).send(opponent);
  }

  async getOpponentById(
    request: FastifyRequest<{ Params: GetOpponentByIdParamsDto }>,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    const opponent = await this.opponentService.getOpponentById(
      request.params.opponentId,
    );

    return reply.status(200).send(opponent);
  }

  async listOpponents(
    request: FastifyRequest<{ Querystring: ListOpponentsQueryDto }>,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    const response = await this.opponentService.listOpponents(request.query);

    return reply.status(200).send(response);
  }
}
