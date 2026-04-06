import type {
  FastifyRequest,
  FastifyReply,
  preHandlerHookHandler,
} from 'fastify';
import type { ZodType } from 'zod';

import { RequestValidationError } from './errors.js';

export function validateRequestPart<T>(
  schema: ZodType<T>,
  requestPart: 'body' | 'params' | 'query',
): preHandlerHookHandler {
  return async (
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> => {
    const parseResult = schema.safeParse(request[requestPart]);

    if (!parseResult.success) {
      throw new RequestValidationError(parseResult.error.issues);
    }

    Reflect.set(request, requestPart, parseResult.data);
  };
}
