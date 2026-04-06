import type { FastifyReply, FastifyRequest } from 'fastify';

import type {
  ReplaceScoutingReportSystemsBodyDto,
  ScoutingReportSystemsParamsDto,
} from '../dtos/scouting-report-systems-request.dto.js';
import type { ScoutingReportSystemsService } from '../services/scouting-report-systems.service.js';

export class ScoutingReportSystemsController {
  constructor(
    private readonly scoutingReportSystemsService: ScoutingReportSystemsService,
  ) {}

  async getSystemsForReport(
    request: FastifyRequest<{ Params: ScoutingReportSystemsParamsDto }>,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    const response =
      await this.scoutingReportSystemsService.getSystemsForReport(
        request.params.id,
      );

    return reply.status(200).send(response);
  }

  async replaceSystemsForReport(
    request: FastifyRequest<{
      Params: ScoutingReportSystemsParamsDto;
      Body: ReplaceScoutingReportSystemsBodyDto;
    }>,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    const response =
      await this.scoutingReportSystemsService.replaceSystemsForReport(
        request.params.id,
        request.body,
      );

    return reply.status(200).send(response);
  }
}
