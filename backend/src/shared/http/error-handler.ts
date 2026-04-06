import type { FastifyInstance } from 'fastify';

import {
  EntityNotFoundError,
  InvalidSystemCodeError,
  InvalidSystemSelectionError,
  PublishedReportModificationError,
  RelatedEntityNotFoundError,
  ReportAlreadyPublishedError,
  RequestValidationError,
} from './errors.js';

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

    if (error instanceof RelatedEntityNotFoundError) {
      reply.status(404).send({
        message: error.message,
      });
      return;
    }

    if (
      error instanceof PublishedReportModificationError ||
      error instanceof ReportAlreadyPublishedError
    ) {
      reply.status(409).send({
        message: error.message,
      });
      return;
    }

    if (
      error instanceof InvalidSystemCodeError ||
      error instanceof InvalidSystemSelectionError
    ) {
      reply.status(400).send({
        message: error.message,
      });
      return;
    }

    console.error(error);
    app.log.error(error);
    reply.status(500).send({
      message: 'Internal server error',
    });
  });
}
