import type { FastifyPluginCallback } from 'fastify';

import { validateRequestPart } from '../../../shared/http/validation.js';
import { ScoutingReportSwotController } from '../controllers/scouting-report-swot.controller.js';
import type {
  ReplaceScoutingReportSwotBodyDto,
  ScoutingReportSwotParamsDto,
} from '../dtos/scouting-report-swot-request.dto.js';
import type { ScoutingReportSwotRepository } from '../repositories/scouting-report-swot.repository.js';
import {
  replaceScoutingReportSwotBodySchema,
  scoutingReportSwotParamsSchema,
} from '../schemas/scouting-report-swot.schemas.js';
import { ScoutingReportSwotService } from '../services/scouting-report-swot.service.js';

export interface ScoutingReportSwotRoutesOptions {
  scoutingReportSwotRepository: ScoutingReportSwotRepository;
}

export const scoutingReportSwotRoutes: FastifyPluginCallback<
  ScoutingReportSwotRoutesOptions
> = (fastify, options, done) => {
  const scoutingReportSwotService = new ScoutingReportSwotService(
    options.scoutingReportSwotRepository,
  );
  const scoutingReportSwotController = new ScoutingReportSwotController(
    scoutingReportSwotService,
  );

  fastify.get<{ Params: ScoutingReportSwotParamsDto }>(
    '/:id/swot',
    {
      preHandler: [
        validateRequestPart(scoutingReportSwotParamsSchema, 'params'),
      ],
    },
    scoutingReportSwotController.getItemsByReportId.bind(
      scoutingReportSwotController,
    ),
  );

  fastify.put<{
    Params: ScoutingReportSwotParamsDto;
    Body: ReplaceScoutingReportSwotBodyDto;
  }>(
    '/:id/swot',
    {
      preHandler: [
        validateRequestPart(scoutingReportSwotParamsSchema, 'params'),
        validateRequestPart(replaceScoutingReportSwotBodySchema, 'body'),
      ],
    },
    scoutingReportSwotController.replaceItemsByReportId.bind(
      scoutingReportSwotController,
    ),
  );

  done();
};
