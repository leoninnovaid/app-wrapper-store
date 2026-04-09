export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'SOURCE_VALIDATION_FAILED'
  | 'APK_READINESS_FAILED'
  | 'UPDATE_BLOCKED'
  | 'NETWORK_ERROR'
  | 'BACKEND_ERROR'
  | 'UNKNOWN_ERROR';

export interface ApiErrorPayload {
  code: ErrorCode | string;
  message: string;
  details?: unknown;
  traceId?: string;
}