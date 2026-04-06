import type { FastifyReply, FastifyRequest } from 'fastify';

import type {
  CreateScoutingReportBodyDto,
  ListScoutingReportsQueryDto,
  ScoutingReportIdParamsDto,
  UpdateScoutingReportBodyDto,
} from '../dtos/scouting-report-request.dto.js';
import type { ScoutingReportService } from '../services/scouting-report.service.js';

export class ScoutingReportController {
  constructor(private readonly scoutingReportService: ScoutingReportService) {}

  async createReport(
    request: FastifyRequest<{ Body: CreateScoutingReportBodyDto }>,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    const report = await this.scoutingReportService.createReport(request.body);
    return reply.status(201).send(report);
  }

  async getReportById(
    request: FastifyRequest<{ Params: ScoutingReportIdParamsDto }>,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    const report = await this.scoutingReportService.getReportById(
      request.params.id,
    );
    return reply.status(200).send(report);
  }

  async listReports(
    request: FastifyRequest<{ Querystring: ListScoutingReportsQueryDto }>,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    const response = await this.scoutingReportService.listReports(
      request.query,
    );
    return reply.status(200).send(response);
  }

  async updateReportMetadata(
    request: FastifyRequest<{
      Params: ScoutingReportIdParamsDto;
      Body: UpdateScoutingReportBodyDto;
    }>,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    const report = await this.scoutingReportService.updateReportMetadata(
      request.params.id,
      request.body,
    );

    return reply.status(200).send(report);
  }

  async duplicateReport(
    request: FastifyRequest<{ Params: ScoutingReportIdParamsDto }>,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    const report = await this.scoutingReportService.duplicateReport(
      request.params.id,
    );
    return reply.status(201).send(report);
  }

  async publishReport(
    request: FastifyRequest<{ Params: ScoutingReportIdParamsDto }>,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    const report = await this.scoutingReportService.publishReport(
      request.params.id,
    );
    return reply.status(200).send(report);
  }
}
