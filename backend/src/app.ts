import Fastify, { type FastifyInstance } from 'fastify';

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

export interface AppDependencies
  extends
    OpponentRoutesOptions,
    ScoutingReportRoutesOptions,
    ScoutingReportSystemsRoutesOptions {}

export function buildApp(dependencies: AppDependencies): FastifyInstance {
  const app = Fastify();

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

  return app;
}
