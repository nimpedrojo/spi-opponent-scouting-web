import type { FastifyReply, FastifyRequest } from 'fastify';

import type {
  ReplaceScoutingReportSwotBodyDto,
  ScoutingReportSwotParamsDto,
} from '../dtos/scouting-report-swot-request.dto.js';
import type { ScoutingReportSwotService } from '../services/scouting-report-swot.service.js';

export class ScoutingReportSwotController {
  constructor(
    private readonly scoutingReportSwotService: ScoutingReportSwotService,
  ) {}

  async getItemsByReportId(
    request: FastifyRequest<{ Params: ScoutingReportSwotParamsDto }>,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    const response = await this.scoutingReportSwotService.getItemsByReportId(
      request.params.id,
    );

    return reply.status(200).send(response);
  }

  async replaceItemsByReportId(
    request: FastifyRequest<{
      Params: ScoutingReportSwotParamsDto;
      Body: ReplaceScoutingReportSwotBodyDto;
    }>,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    const response =
      await this.scoutingReportSwotService.replaceItemsByReportId(
        request.params.id,
        request.body,
      );

    return reply.status(200).send(response);
  }
}
