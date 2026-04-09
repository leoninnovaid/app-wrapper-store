import { useMemo } from 'react';
import { useAppStore } from '../store/appStore';
import { ErrorScope, UiError } from '../types/errors';

interface InlineErrorProps {
  scope: ErrorScope;
  onRetry?: () => void;
  matcher?: (error: UiError) => boolean;
  className?: string;
}

export default function InlineError({ scope, onRetry, matcher, className }: InlineErrorProps) {
  const scopedErrors = useAppStore((state) => state.scopedErrors[scope]);
  const clearError = useAppStore((state) => state.clearError);

  const error = useMemo(() => {
    if (!matcher) {
      return scopedErrors[0];
    }

    return scopedErrors.find(matcher);
  }, [matcher, scopedErrors]);

  if (!error) {
    return null;
  }

  const canRetry = Boolean(onRetry && error.retryable);

  return (
    <div className={`rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 ${className ?? ''}`}>
      <p className="font-medium">{error.message}</p>
      <p className="mt-1 text-xs text-red-700">
        {error.code}
        {error.traceId ? ` | Trace: ${error.traceId}` : ''}
      </p>
      <div className="mt-2 flex items-center gap-2">
        {canRetry && (
          <button
            type="button"
            onClick={() => {
              clearError(error.id);
              onRetry?.();
            }}
            className="rounded border border-red-300 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
          >
            Retry
          </button>
        )}
        <button
          type="button"
          onClick={() => clearError(error.id)}
          className="rounded border border-red-300 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
