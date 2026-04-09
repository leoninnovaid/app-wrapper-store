import axios from 'axios';
import { ErrorScope, UiError, createUiError } from '../types/errors';

interface ErrorPayload {
  code?: unknown;
  message?: unknown;
  details?: unknown;
  traceId?: unknown;
}

interface ToUiErrorOptions {
  scope: ErrorScope;
  fallbackMessage: string;
  retryable?: boolean;
  details?: unknown;
}

export function toUiError(error: unknown, options: ToUiErrorOptions): UiError {
  if (axios.isAxiosError(error)) {
    const response = error.response;
    const payload = (response?.data ?? {}) as ErrorPayload;

    if (!response) {
      return createUiError({
        scope: options.scope,
        code: 'NETWORK_ERROR',
        message: options.fallbackMessage,
        details: options.details,
        retryable: options.retryable ?? true,
        category: 'network',
      });
    }

    const status = response.status;
    const parsedCode = typeof payload.code === 'string' ? payload.code : `HTTP_${status}`;
    const parsedMessage = typeof payload.message === 'string' ? payload.message : options.fallbackMessage;
    const parsedTraceId = typeof payload.traceId === 'string' ? payload.traceId : undefined;
    const parsedDetails = options.details ?? payload.details;

    const category = status >= 500 ? 'backend' : status >= 400 ? 'validation' : 'unknown';
    const retryable = options.retryable ?? (status >= 500 || status === 408 || status === 429);

    return createUiError({
      scope: options.scope,
      code: parsedCode,
      message: parsedMessage,
      details: parsedDetails,
      traceId: parsedTraceId,
      retryable,
      category,
    });
  }

  return createUiError({
    scope: options.scope,
    code: 'UNKNOWN_ERROR',
    message: options.fallbackMessage,
    details: options.details,
    retryable: options.retryable ?? false,
    category: 'unknown',
  });
}
