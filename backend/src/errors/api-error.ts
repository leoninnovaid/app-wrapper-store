import { ApiErrorPayload, ErrorCode } from '../types/errors';

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode | string;
  readonly details?: unknown;

  constructor(statusCode: number, code: ErrorCode | string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  toPayload(traceId?: string): ApiErrorPayload {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      traceId,
    };
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;
