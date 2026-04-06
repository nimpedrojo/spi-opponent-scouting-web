import type { ZodIssue } from 'zod';

export class RequestValidationError extends Error {
  constructor(public readonly issues: ZodIssue[]) {
    super('Request validation failed');
  }
}

export class EntityNotFoundError extends Error {
  constructor(entityName: string, entityId: number) {
    super(`${entityName} ${entityId} was not found`);
  }
}
