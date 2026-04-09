import { useCallback, useEffect, useState } from 'react';
import { appService } from '../services/api';
import { useAppStore } from '../store/appStore';
import { toUiError } from '../utils/error-utils';
import AppCard from './AppCard';
import InlineError from './InlineError';

export default function AppList() {
  const apps = useAppStore((state) => state.apps);
  const loading = useAppStore((state) => state.loading);
  const setApps = useAppStore((state) => state.setApps);
  const setLoading = useAppStore((state) => state.setLoading);
  const pushError = useAppStore((state) => state.pushError);
  const clearScope = useAppStore((state) => state.clearScope);

  const [filter, setFilter] = useState('');

  const fetchApps = useCallback(async () => {
    clearScope('load-apps');

    try {
      setLoading(true);
      const response = await appService.getAll();
      setApps(response.data);
      clearScope('load-apps');
    } catch (error) {
      pushError(
        toUiError(error, {
          scope: 'load-apps',
          fallbackMessage: 'Failed to load apps from the backend.',
          retryable: true,
        }),
      );
    } finally {
      setLoading(false);
    }
  }, [clearScope, pushError, setApps, setLoading]);

  useEffect(() => {
    void fetchApps();
  }, [fetchApps]);

  const normalizedFilter = filter.trim().toLowerCase();
  const filteredApps = apps.filter((app) => {
    const name = app.name.toLowerCase();
    const description = (app.description ?? '').toLowerCase();
    return name.includes(normalizedFilter) || description.includes(normalizedFilter);
  });

  return (
    <div className="w-full">
      <InlineError scope="load-apps" onRetry={() => void fetchApps()} className="mb-4" />

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search apps..."
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-600">Loading apps...</div>
      ) : filteredApps.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredApps.map((app) => (
            <AppCard key={app.id} app={app} onRefresh={() => void fetchApps()} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-lg text-gray-500">
            {normalizedFilter ? 'No apps found matching your search.' : 'No apps yet. Create one to get started.'}
          </p>
        </div>
      )}
    </div>
  );
}
