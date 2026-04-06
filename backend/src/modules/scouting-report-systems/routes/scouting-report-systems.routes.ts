import type { FastifyPluginCallback } from 'fastify';

import { validateRequestPart } from '../../../shared/http/validation.js';
import { ScoutingReportSystemsController } from '../controllers/scouting-report-systems.controller.js';
import type {
  ReplaceScoutingReportSystemsBodyDto,
  ScoutingReportSystemsParamsDto,
} from '../dtos/scouting-report-systems-request.dto.js';
import type { ScoutingReportSystemsRepository } from '../repositories/scouting-report-systems.repository.js';
import {
  replaceScoutingReportSystemsBodySchema,
  scoutingReportSystemsParamsSchema,
} from '../schemas/scouting-report-systems.schemas.js';
import { ScoutingReportSystemsService } from '../services/scouting-report-systems.service.js';

export interface ScoutingReportSystemsRoutesOptions {
  scoutingReportSystemsRepository: ScoutingReportSystemsRepository;
}

export const scoutingReportSystemsRoutes: FastifyPluginCallback<
  ScoutingReportSystemsRoutesOptions
> = (fastify, options, done) => {
  const scoutingReportSystemsService = new ScoutingReportSystemsService(
    options.scoutingReportSystemsRepository,
  );
  const scoutingReportSystemsController = new ScoutingReportSystemsController(
    scoutingReportSystemsService,
  );

  fastify.get<{ Params: ScoutingReportSystemsParamsDto }>(
    '/:id/systems',
    {
      preHandler: [
        validateRequestPart(scoutingReportSystemsParamsSchema, 'params'),
      ],
    },
    scoutingReportSystemsController.getSystemsForReport.bind(
      scoutingReportSystemsController,
    ),
  );

  fastify.put<{
    Params: ScoutingReportSystemsParamsDto;
    Body: ReplaceScoutingReportSystemsBodyDto;
  }>(
    '/:id/systems',
    {
      preHandler: [
        validateRequestPart(scoutingReportSystemsParamsSchema, 'params'),
        validateRequestPart(replaceScoutingReportSystemsBodySchema, 'body'),
      ],
    },
    scoutingReportSystemsController.replaceSystemsForReport.bind(
      scoutingReportSystemsController,
    ),
  );

  done();
};
