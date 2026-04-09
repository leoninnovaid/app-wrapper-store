import { useMemo, useState } from 'react';
import { AppConfig, appService, buildService } from '../services/api';
import { useAppStore } from '../store/appStore';
import { extractTargetId, UiError } from '../types/errors';
import { toUiError } from '../utils/error-utils';
import InlineError from './InlineError';

interface AppCardProps {
  app: AppConfig;
  onRefresh: () => void;
}

export default function AppCard({ app, onRefresh }: AppCardProps) {
  const deleteApp = useAppStore((state) => state.deleteApp);
  const pushError = useAppStore((state) => state.pushError);
  const clearScope = useAppStore((state) => state.clearScope);

  const [isBuilding, setIsBuilding] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [buildNotice, setBuildNotice] = useState<string | null>(null);

  const targetMatcher = useMemo(
    () => (error: UiError) => extractTargetId(error.details) === app.id,
    [app.id],
  );

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${app.name}"?`)) {
      return;
    }

    clearScope('delete-app');

    try {
      await appService.delete(app.id);
      deleteApp(app.id);
      onRefresh();
    } catch (error) {
      pushError(
        toUiError(error, {
          scope: 'delete-app',
          fallbackMessage: `Failed to delete ${app.name}.`,
          retryable: true,
          details: { targetId: app.id },
        }),
      );
    }
  };

  const handleBuild = async () => {
    clearScope('build-app');
    setBuildNotice(null);

    try {
      setIsBuilding(true);
      const response = await buildService.triggerBuild(app.id, 'android');
      setBuildNotice(`Build started (id: ${response.data.id}). Refresh later for download status.`);
      onRefresh();
    } catch (error) {
      pushError(
        toUiError(error, {
          scope: 'build-app',
          fallbackMessage: `Failed to start build for ${app.name}.`,
          retryable: true,
          details: { targetId: app.id },
        }),
      );
    } finally {
      setIsBuilding(false);
    }
  };

  const enabledFeatures = app.features
    ? Object.entries(app.features)
        .filter(([, enabled]) => Boolean(enabled))
        .map(([name]) => name)
    : [];

  return (
    <div className="rounded-lg bg-white p-4 shadow-md transition-shadow hover:shadow-lg">
      <div className="mb-3 flex items-start gap-3">
        {app.icon ? (
          <img src={app.icon} alt={app.name} className="h-12 w-12 rounded-lg object-cover" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold text-gray-500">
            N/A
          </div>
        )}

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800">{app.name}</h3>
          <p className="text-sm text-gray-500">{app.url}</p>
        </div>
      </div>

      <p className="mb-3 text-sm text-gray-600">{app.description || 'No description provided.'}</p>

      {app.theme?.primaryColor && (
        <div className="mb-3 flex gap-2">
          <div className="h-6 w-6 rounded" style={{ backgroundColor: app.theme.primaryColor }} title="Primary Color" />
          {app.theme.accentColor && (
            <div
              className="h-6 w-6 rounded border border-gray-300"
              style={{ backgroundColor: app.theme.accentColor }}
              title="Accent Color"
            />
          )}
        </div>
      )}

      <div className="mb-3 flex gap-2">
        <button
          onClick={() => setShowDetails((visible) => !visible)}
          className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-sm transition-colors hover:bg-gray-200"
        >
          {showDetails ? 'Hide' : 'Details'}
        </button>
        <button
          onClick={() => void handleBuild()}
          disabled={isBuilding}
          className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isBuilding ? 'Building...' : 'Build APK'}
        </button>
        <button
          onClick={() => void handleDelete()}
          className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 transition-colors hover:bg-red-200"
        >
          Delete
        </button>
      </div>

      <InlineError scope="build-app" matcher={targetMatcher} onRetry={() => void handleBuild()} className="mb-2" />
      <InlineError scope="delete-app" matcher={targetMatcher} onRetry={() => void handleDelete()} className="mb-2" />

      {buildNotice && <p className="mb-2 rounded-md bg-green-50 px-3 py-2 text-xs text-green-700">{buildNotice}</p>}

      {showDetails && (
        <div className="border-t pt-3 text-sm text-gray-600">
          <p>
            <strong>Created:</strong> {new Date(app.createdAt).toLocaleDateString()}
          </p>
          <p>
            <strong>Features:</strong> {enabledFeatures.length > 0 ? enabledFeatures.join(', ') : 'None'}
          </p>
        </div>
      )}
    </div>
  );
}
