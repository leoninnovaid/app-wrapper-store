import { useCallback, useEffect, useState } from 'react';
import { appService } from '../services/api';
import { useAppStore } from '../store/appStore';
import AppCard from './AppCard';

export default function AppList() {
  const { apps, setApps, setLoading, setError } = useAppStore();
  const [filter, setFilter] = useState('');

  const fetchApps = useCallback(async () => {
    try {
      setLoading(true);
      const response = await appService.getAll();
      setApps(response.data);
    } catch (err) {
      setError('Failed to fetch apps');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [setApps, setError, setLoading]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const normalizedFilter = filter.trim().toLowerCase();
  const filteredApps = apps.filter((app) => {
    const name = app.name.toLowerCase();
    const description = (app.description ?? '').toLowerCase();
    return name.includes(normalizedFilter) || description.includes(normalizedFilter);
  });

  return (
    <div className="w-full">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search apps..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {filteredApps.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredApps.map((app) => (
            <AppCard key={app.id} app={app} onRefresh={fetchApps} />
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
