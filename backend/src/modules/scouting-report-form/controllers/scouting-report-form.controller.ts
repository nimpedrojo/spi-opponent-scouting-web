import type { FastifyReply, FastifyRequest } from 'fastify';

import type {
  ScoutingReportFormParamsDto,
  UpsertScoutingReportFormBodyDto,
} from '../dtos/scouting-report-form-request.dto.js';
import type { ScoutingReportFormService } from '../services/scouting-report-form.service.js';

export class ScoutingReportFormController {
  constructor(
    private readonly scoutingReportFormService: ScoutingReportFormService,
  ) {}

  async getFormByReportId(
    request: FastifyRequest<{ Params: ScoutingReportFormParamsDto }>,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    const response = await this.scoutingReportFormService.getFormByReportId(
      request.params.id,
    );

    return reply.status(200).send(response);
  }

  async upsertFormByReportId(
    request: FastifyRequest<{
      Params: ScoutingReportFormParamsDto;
      Body: UpsertScoutingReportFormBodyDto;
    }>,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    const response = await this.scoutingReportFormService.upsertFormByReportId(
      request.params.id,
      request.body,
    );

    return reply.status(200).send(response);
  }
}
