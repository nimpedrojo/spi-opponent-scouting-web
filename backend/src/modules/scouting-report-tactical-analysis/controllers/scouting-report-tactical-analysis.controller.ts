import type { FastifyReply, FastifyRequest } from 'fastify';

import type {
  ReplaceScoutingReportTacticalAnalysisBodyDto,
  ScoutingReportTacticalAnalysisParamsDto,
} from '../dtos/scouting-report-tactical-analysis-request.dto.js';
import type { ScoutingReportTacticalAnalysisService } from '../services/scouting-report-tactical-analysis.service.js';

export class ScoutingReportTacticalAnalysisController {
  constructor(
    private readonly scoutingReportTacticalAnalysisService: ScoutingReportTacticalAnalysisService,
  ) {}

  async getItemsByReportId(
    request: FastifyRequest<{
      Params: ScoutingReportTacticalAnalysisParamsDto;
    }>,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    const response =
      await this.scoutingReportTacticalAnalysisService.getItemsByReportId(
        request.params.id,
      );

    return reply.status(200).send(response);
  }

  async replaceItemsByReportId(
    request: FastifyRequest<{
      Params: ScoutingReportTacticalAnalysisParamsDto;
      Body: ReplaceScoutingReportTacticalAnalysisBodyDto;
    }>,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    const response =
      await this.scoutingReportTacticalAnalysisService.replaceItemsByReportId(
        request.params.id,
        request.body,
      );

    return reply.status(200).send(response);
  }
}
