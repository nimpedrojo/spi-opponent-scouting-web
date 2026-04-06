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

export class RelatedEntityNotFoundError extends Error {
  constructor(entityName: string, relationName: string, entityId: number) {
    super(`${entityName} ${entityId} was not found for ${relationName}`);
  }
}

export class ReportAlreadyPublishedError extends Error {
  constructor(reportId: number) {
    super(`ScoutingReport ${reportId} is already published`);
  }
}

export class PublishedReportModificationError extends Error {
  constructor(reportId: number) {
    super(`ScoutingReport ${reportId} is published and cannot be modified`);
  }
}

export class InvalidSystemCodeError extends Error {
  constructor(systemCodes: string[]) {
    super(`Invalid system codes: ${systemCodes.join(', ')}`);
  }
}

export class InvalidSystemSelectionError extends Error {
  constructor(message: string) {
    super(message);
  }
}
