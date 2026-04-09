import { useMemo } from 'react';
import { useAppStore } from '../store/appStore';

function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString();
}

export default function GlobalErrorBanner() {
  const globalErrors = useAppStore((state) => state.globalErrors);
  const clearError = useAppStore((state) => state.clearError);
  const clearAllErrors = useAppStore((state) => state.clearAllErrors);

  const sortedErrors = useMemo(
    () => [...globalErrors].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
    [globalErrors],
  );

  if (sortedErrors.length === 0) {
    return null;
  }

  return (
    <section className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4" aria-live="polite">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-red-800">System Errors</h2>
        <button
          onClick={() => clearAllErrors()}
          className="text-xs font-medium text-red-700 underline hover:text-red-900"
        >
          Clear all
        </button>
      </div>

      <ul className="space-y-3">
        {sortedErrors.map((error) => (
          <li key={error.id} className="rounded-md border border-red-200 bg-white p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-red-800">{error.message}</p>
                <p className="mt-1 text-xs text-red-700">
                  {error.code} | {error.category} | {formatTimestamp(error.createdAt)}
                </p>
                {error.traceId && <p className="mt-1 text-xs text-red-700">Trace: {error.traceId}</p>}
              </div>
              <button
                onClick={() => clearError(error.id)}
                className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-100"
              >
                Dismiss
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
