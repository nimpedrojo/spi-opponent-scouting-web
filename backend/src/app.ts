import Fastify, { type FastifyInstance } from 'fastify';

import { setErrorHandler } from './shared/http/error-handler.js';
import {
  opponentRoutes,
  type OpponentRoutesOptions,
} from './modules/opponents/routes/opponent.routes.js';

export interface AppDependencies extends OpponentRoutesOptions {}

export function buildApp(dependencies: AppDependencies): FastifyInstance {
  const app = Fastify();

  setErrorHandler(app);
  app.register(opponentRoutes, {
    prefix: '/opponents',
    opponentRepository: dependencies.opponentRepository,
  });

  return app;
}
