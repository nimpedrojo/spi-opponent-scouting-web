import type { FastifyPluginCallback } from 'fastify';

import { validateRequestPart } from '../../../shared/http/validation.js';
import { ScoutingReportController } from '../controllers/scouting-report.controller.js';
import type {
  CreateScoutingReportBodyDto,
  ListScoutingReportsQueryDto,
  ScoutingReportIdParamsDto,
  UpdateScoutingReportBodyDto,
} from '../dtos/scouting-report-request.dto.js';
import type { ScoutingReportRepository } from '../repositories/scouting-report.repository.js';
import {
  createScoutingReportBodySchema,
  listScoutingReportsQuerySchema,
  scoutingReportIdParamsSchema,
  updateScoutingReportBodySchema,
} from '../schemas/scouting-report.schemas.js';
import { ScoutingReportService } from '../services/scouting-report.service.js';

export interface ScoutingReportRoutesOptions {
  scoutingReportRepository: ScoutingReportRepository;
}

export const scoutingReportRoutes: FastifyPluginCallback<
  ScoutingReportRoutesOptions
> = (fastify, options, done) => {
  const scoutingReportService = new ScoutingReportService(
    options.scoutingReportRepository,
  );
  const scoutingReportController = new ScoutingReportController(
    scoutingReportService,
  );

  fastify.post<{ Body: CreateScoutingReportBodyDto }>(
    '/',
    {
      preHandler: [validateRequestPart(createScoutingReportBodySchema, 'body')],
    },
    scoutingReportController.createReport.bind(scoutingReportController),
  );

  fastify.get<{ Params: ScoutingReportIdParamsDto }>(
    '/:id',
    {
      preHandler: [validateRequestPart(scoutingReportIdParamsSchema, 'params')],
    },
    scoutingReportController.getReportById.bind(scoutingReportController),
  );

  fastify.get<{ Querystring: ListScoutingReportsQueryDto }>(
    '/',
    {
      preHandler: [
        validateRequestPart(listScoutingReportsQuerySchema, 'query'),
      ],
    },
    scoutingReportController.listReports.bind(scoutingReportController),
  );

  fastify.patch<{
    Params: ScoutingReportIdParamsDto;
    Body: UpdateScoutingReportBodyDto;
  }>(
    '/:id',
    {
      preHandler: [
        validateRequestPart(scoutingReportIdParamsSchema, 'params'),
        validateRequestPart(updateScoutingReportBodySchema, 'body'),
      ],
    },
    scoutingReportController.updateReportMetadata.bind(
      scoutingReportController,
    ),
  );

  fastify.post<{ Params: ScoutingReportIdParamsDto }>(
    '/:id/duplicate',
    {
      preHandler: [validateRequestPart(scoutingReportIdParamsSchema, 'params')],
    },
    scoutingReportController.duplicateReport.bind(scoutingReportController),
  );

  fastify.post<{ Params: ScoutingReportIdParamsDto }>(
    '/:id/publish',
    {
      preHandler: [validateRequestPart(scoutingReportIdParamsSchema, 'params')],
    },
    scoutingReportController.publishReport.bind(scoutingReportController),
  );

  done();
};
