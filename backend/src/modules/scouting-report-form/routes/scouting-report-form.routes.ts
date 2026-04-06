import type { FastifyPluginCallback } from 'fastify';

import { validateRequestPart } from '../../../shared/http/validation.js';
import { ScoutingReportFormController } from '../controllers/scouting-report-form.controller.js';
import type {
  ScoutingReportFormParamsDto,
  UpsertScoutingReportFormBodyDto,
} from '../dtos/scouting-report-form-request.dto.js';
import type { ScoutingReportFormRepository } from '../repositories/scouting-report-form.repository.js';
import {
  scoutingReportFormParamsSchema,
  upsertScoutingReportFormBodySchema,
} from '../schemas/scouting-report-form.schemas.js';
import { ScoutingReportFormService } from '../services/scouting-report-form.service.js';

export interface ScoutingReportFormRoutesOptions {
  scoutingReportFormRepository: ScoutingReportFormRepository;
}

export const scoutingReportFormRoutes: FastifyPluginCallback<
  ScoutingReportFormRoutesOptions
> = (fastify, options, done) => {
  const scoutingReportFormService = new ScoutingReportFormService(
    options.scoutingReportFormRepository,
  );
  const scoutingReportFormController = new ScoutingReportFormController(
    scoutingReportFormService,
  );

  fastify.get<{ Params: ScoutingReportFormParamsDto }>(
    '/:id/form',
    {
      preHandler: [
        validateRequestPart(scoutingReportFormParamsSchema, 'params'),
      ],
    },
    scoutingReportFormController.getFormByReportId.bind(
      scoutingReportFormController,
    ),
  );

  fastify.put<{
    Params: ScoutingReportFormParamsDto;
    Body: UpsertScoutingReportFormBodyDto;
  }>(
    '/:id/form',
    {
      preHandler: [
        validateRequestPart(scoutingReportFormParamsSchema, 'params'),
        validateRequestPart(upsertScoutingReportFormBodySchema, 'body'),
      ],
    },
    scoutingReportFormController.upsertFormByReportId.bind(
      scoutingReportFormController,
    ),
  );

  done();
};
