import Fastify, { type FastifyInstance } from 'fastify';

import { registerCors } from './shared/http/cors.js';
import { setErrorHandler } from './shared/http/error-handler.js';
import {
  opponentRoutes,
  type OpponentRoutesOptions,
} from './modules/opponents/routes/opponent.routes.js';
import {
  scoutingReportRoutes,
  type ScoutingReportRoutesOptions,
} from './modules/scouting-reports/routes/scouting-report.routes.js';
import {
  scoutingReportSystemsRoutes,
  type ScoutingReportSystemsRoutesOptions,
} from './modules/scouting-report-systems/routes/scouting-report-systems.routes.js';
import {
  scoutingReportFormRoutes,
  type ScoutingReportFormRoutesOptions,
} from './modules/scouting-report-form/routes/scouting-report-form.routes.js';
import {
  scoutingReportTacticalAnalysisRoutes,
  type ScoutingReportTacticalAnalysisRoutesOptions,
} from './modules/scouting-report-tactical-analysis/routes/scouting-report-tactical-analysis.routes.js';
import {
  scoutingReportSwotRoutes,
  type ScoutingReportSwotRoutesOptions,
} from './modules/scouting-report-swot/routes/scouting-report-swot.routes.js';

export interface AppDependencies
  extends
    OpponentRoutesOptions,
    ScoutingReportRoutesOptions,
    ScoutingReportSystemsRoutesOptions,
    ScoutingReportFormRoutesOptions,
    ScoutingReportTacticalAnalysisRoutesOptions,
    ScoutingReportSwotRoutesOptions {}

export function buildApp(dependencies: AppDependencies): FastifyInstance {
  const app = Fastify();

  registerCors(app);
  setErrorHandler(app);
  app.register(opponentRoutes, {
    prefix: '/opponents',
    opponentRepository: dependencies.opponentRepository,
  });
  app.register(scoutingReportRoutes, {
    prefix: '/scouting-reports',
    scoutingReportRepository: dependencies.scoutingReportRepository,
  });
  app.register(scoutingReportSystemsRoutes, {
    prefix: '/scouting-reports',
    scoutingReportSystemsRepository:
      dependencies.scoutingReportSystemsRepository,
  });
  app.register(scoutingReportFormRoutes, {
    prefix: '/scouting-reports',
    scoutingReportFormRepository: dependencies.scoutingReportFormRepository,
  });
  app.register(scoutingReportTacticalAnalysisRoutes, {
    prefix: '/scouting-reports',
    scoutingReportTacticalAnalysisRepository:
      dependencies.scoutingReportTacticalAnalysisRepository,
  });
  app.register(scoutingReportSwotRoutes, {
    prefix: '/scouting-reports',
    scoutingReportSwotRepository: dependencies.scoutingReportSwotRepository,
  });

  return app;
}
