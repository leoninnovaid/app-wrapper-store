export type ErrorScope =
  | 'global'
  | 'create-app'
  | 'load-apps'
  | 'build-app'
  | 'delete-app'
  | 'source-validate'
  | 'source-attach'
  | 'update-check'
  | 'release';

export type ErrorCategory = 'network' | 'validation' | 'backend' | 'unknown';

export interface UiError {
  id: string;
  scope: ErrorScope;
  code: string;
  message: string;
  details?: unknown;
  traceId?: string;
  retryable: boolean;
  createdAt: string;
  category: ErrorCategory;
}

export function createUiError(input: Omit<UiError, 'id' | 'createdAt'>): UiError {
  const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return {
    ...input,
    id,
    createdAt: new Date().toISOString(),
  };
}

export function extractTargetId(details: unknown): string | null {
  if (!details || typeof details !== 'object') {
    return null;
  }

  const maybeTarget = (details as { targetId?: unknown }).targetId;
  return typeof maybeTarget === 'string' ? maybeTarget : null;
}
