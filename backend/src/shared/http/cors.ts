import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

const DEFAULT_ALLOWED_ORIGIN = 'http://localhost:5173';
const DEFAULT_ALLOWED_METHODS = 'GET,POST,PUT,PATCH,DELETE,OPTIONS';
const DEFAULT_ALLOWED_HEADERS = 'Accept,Content-Type';

export function registerCors(app: FastifyInstance): void {
  app.addHook('onRequest', async (request, reply) => {
    applyCorsHeaders(request, reply);

    if (request.method === 'OPTIONS') {
      await reply.code(204).send();
    }
  });
}

function applyCorsHeaders(request: FastifyRequest, reply: FastifyReply): void {
  const configuredOrigin = process.env.CORS_ORIGIN ?? DEFAULT_ALLOWED_ORIGIN;
  const requestOrigin = request.headers.origin;
  const allowOrigin =
    requestOrigin === undefined || configuredOrigin === '*'
      ? configuredOrigin
      : requestOrigin === configuredOrigin
        ? requestOrigin
        : configuredOrigin;

  const requestedHeaders = request.headers['access-control-request-headers'];

  reply.header('Access-Control-Allow-Origin', allowOrigin);
  reply.header('Vary', 'Origin');
  reply.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
  reply.header(
    'Access-Control-Allow-Headers',
    typeof requestedHeaders === 'string' && requestedHeaders.trim().length > 0
      ? requestedHeaders
      : DEFAULT_ALLOWED_HEADERS,
  );
}
