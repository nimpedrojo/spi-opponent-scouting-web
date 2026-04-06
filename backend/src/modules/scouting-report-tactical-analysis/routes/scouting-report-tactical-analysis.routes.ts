import type { FastifyPluginCallback } from 'fastify';

import { validateRequestPart } from '../../../shared/http/validation.js';
import { ScoutingReportTacticalAnalysisController } from '../controllers/scouting-report-tactical-analysis.controller.js';
import type {
  ReplaceScoutingReportTacticalAnalysisBodyDto,
  ScoutingReportTacticalAnalysisParamsDto,
} from '../dtos/scouting-report-tactical-analysis-request.dto.js';
import type { ScoutingReportTacticalAnalysisRepository } from '../repositories/scouting-report-tactical-analysis.repository.js';
import {
  replaceScoutingReportTacticalAnalysisBodySchema,
  scoutingReportTacticalAnalysisParamsSchema,
} from '../schemas/scouting-report-tactical-analysis.schemas.js';
import { ScoutingReportTacticalAnalysisService } from '../services/scouting-report-tactical-analysis.service.js';

export interface ScoutingReportTacticalAnalysisRoutesOptions {
  scoutingReportTacticalAnalysisRepository: ScoutingReportTacticalAnalysisRepository;
}

export const scoutingReportTacticalAnalysisRoutes: FastifyPluginCallback<
  ScoutingReportTacticalAnalysisRoutesOptions
> = (fastify, options, done) => {
  const scoutingReportTacticalAnalysisService =
    new ScoutingReportTacticalAnalysisService(
      options.scoutingReportTacticalAnalysisRepository,
    );
  const scoutingReportTacticalAnalysisController =
    new ScoutingReportTacticalAnalysisController(
      scoutingReportTacticalAnalysisService,
    );

  fastify.get<{ Params: ScoutingReportTacticalAnalysisParamsDto }>(
    '/:id/tactical-analysis',
    {
      preHandler: [
        validateRequestPart(
          scoutingReportTacticalAnalysisParamsSchema,
          'params',
        ),
      ],
    },
    scoutingReportTacticalAnalysisController.getItemsByReportId.bind(
      scoutingReportTacticalAnalysisController,
    ),
  );

  fastify.put<{
    Params: ScoutingReportTacticalAnalysisParamsDto;
    Body: ReplaceScoutingReportTacticalAnalysisBodyDto;
  }>(
    '/:id/tactical-analysis',
    {
      preHandler: [
        validateRequestPart(
          scoutingReportTacticalAnalysisParamsSchema,
          'params',
        ),
        validateRequestPart(
          replaceScoutingReportTacticalAnalysisBodySchema,
          'body',
        ),
      ],
    },
    scoutingReportTacticalAnalysisController.replaceItemsByReportId.bind(
      scoutingReportTacticalAnalysisController,
    ),
  );

  done();
};
