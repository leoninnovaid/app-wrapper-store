import React, { useEffect, useState } from 'react';
import { AppConfig, appService } from '../services/api';
import { useAppStore } from '../store/appStore';
import AppCard from './AppCard';

export default function AppList() {
  const { apps, setApps, setLoading, setError } = useAppStore();
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
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
  };

  const filteredApps = apps.filter(
    (app) =>
      app.name.toLowerCase().includes(filter.toLowerCase()) ||
      app.description.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search apps..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* App Grid */}
      {filteredApps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApps.map((app) => (
            <AppCard key={app.id} app={app} onRefresh={fetchApps} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {filter ? 'No apps found matching your search' : 'No apps yet. Create one to get started!'}
          </p>
        </div>
      )}
    </div>
  );
}
