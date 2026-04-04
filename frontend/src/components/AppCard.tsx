import React, { useState } from 'react';
import { AppConfig, appService, buildService } from '../services/api';
import { useAppStore } from '../store/appStore';

interface AppCardProps {
  app: AppConfig;
  onRefresh: () => void;
}

export default function AppCard({ app, onRefresh }: AppCardProps) {
  const { deleteApp, selectApp } = useAppStore();
  const [isBuilding, setIsBuilding] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Delete "${app.name}"?`)) {
      try {
        await appService.delete(app.id);
        deleteApp(app.id);
      } catch (err) {
        console.error('Failed to delete app', err);
      }
    }
  };

  const handleBuild = async () => {
    try {
      setIsBuilding(true);
      const response = await buildService.triggerBuild(app.id, 'android');
      console.log('Build started:', response.data);
      alert('Build started! Check back soon for download link.');
    } catch (err) {
      console.error('Failed to start build', err);
      alert('Failed to start build');
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4">
      {/* App Icon & Header */}
      <div className="flex items-start gap-3 mb-3">
        {app.icon && (
          <img
            src={app.icon}
            alt={app.name}
            className="w-12 h-12 rounded-lg object-cover"
          />
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800">{app.name}</h3>
          <p className="text-sm text-gray-500">{app.url}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{app.description}</p>

      {/* Theme Preview */}
      {app.theme?.primaryColor && (
        <div className="mb-3 flex gap-2">
          <div
            className="w-6 h-6 rounded"
            style={{ backgroundColor: app.theme.primaryColor }}
            title="Primary Color"
          />
          {app.theme.accentColor && (
            <div
              className="w-6 h-6 rounded border border-gray-300"
              style={{ backgroundColor: app.theme.accentColor }}
              title="Accent Color"
            />
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          {showDetails ? 'Hide' : 'Details'}
        </button>
        <button
          onClick={handleBuild}
          disabled={isBuilding}
          className="flex-1 px-3 py-2 text-sm bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {isBuilding ? 'Building...' : 'Build APK'}
        </button>
        <button
          onClick={handleDelete}
          className="px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
        >
          Delete
        </button>
      </div>

      {/* Expandable Details */}
      {showDetails && (
        <div className="border-t pt-3 text-sm text-gray-600">
          <p>
            <strong>Created:</strong> {new Date(app.createdAt).toLocaleDateString()}
          </p>
          <p>
            <strong>Features:</strong>{' '}
            {app.features
              ? Object.entries(app.features)
                  .filter(([, v]) => v)
                  .map(([k]) => k)
                  .join(', ')
              : 'None'}
          </p>
        </div>
      )}
    </div>
  );
}
