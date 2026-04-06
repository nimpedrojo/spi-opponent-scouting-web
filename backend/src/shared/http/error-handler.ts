import type { FastifyInstance } from 'fastify';

import { EntityNotFoundError, RequestValidationError } from './errors.js';

export function setErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof RequestValidationError) {
      reply.status(400).send({
        message: error.message,
        issues: error.issues,
      });
      return;
    }

    if (error instanceof EntityNotFoundError) {
      reply.status(404).send({
        message: error.message,
      });
      return;
    }

    app.log.error(error);
    reply.status(500).send({
      message: 'Internal server error',
    });
  });
}
