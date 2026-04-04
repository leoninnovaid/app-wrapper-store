import React, { useState } from 'react';
import { appService } from '../services/api';
import { useAppStore } from '../store/appStore';

interface CreateAppFormProps {
  onSuccess: () => void;
}

export default function CreateAppForm({ onSuccess }: CreateAppFormProps) {
  const { addApp, setError } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    icon: '',
    primaryColor: '#10a37f',
    accentColor: '#ffffff',
    enablePushNotifications: false,
    enableOfflineMode: false,
    enableNativeSharing: true,
    enableDeepLinking: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      const response = await appService.create({
        name: formData.name,
        description: formData.description,
        url: formData.url,
        icon: formData.icon || undefined,
        theme: {
          primaryColor: formData.primaryColor,
          accentColor: formData.accentColor,
        },
        features: {
          enablePushNotifications: formData.enablePushNotifications,
          enableOfflineMode: formData.enableOfflineMode,
          enableNativeSharing: formData.enableNativeSharing,
          enableDeepLinking: formData.enableDeepLinking,
        },
      });

      addApp(response.data);
      setFormData({
        name: '',
        description: '',
        url: '',
        icon: '',
        primaryColor: '#10a37f',
        accentColor: '#ffffff',
        enablePushNotifications: false,
        enableOfflineMode: false,
        enableNativeSharing: true,
        enableDeepLinking: false,
      });
      setIsOpen(false);
      onSuccess();
    } catch (err) {
      setError('Failed to create app');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-6">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full px-4 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors"
        >
          + Create New App
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Create New App</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                App Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., ChatGPT Codex"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your app..."
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website URL *
              </label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://example.com"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon URL
              </label>
              <input
                type="url"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                placeholder="https://example.com/icon.png"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Theme */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Color
                </label>
                <input
                  type="color"
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleChange}
                  className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Accent Color
                </label>
                <input
                  type="color"
                  name="accentColor"
                  value={formData.accentColor}
                  onChange={handleChange}
                  className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Features */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-800 mb-3">Features</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="enableNativeSharing"
                    checked={formData.enableNativeSharing}
                    onChange={handleChange}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-gray-700">Enable Native Sharing</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="enablePushNotifications"
                    checked={formData.enablePushNotifications}
                    onChange={handleChange}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-gray-700">Enable Push Notifications</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="enableOfflineMode"
                    checked={formData.enableOfflineMode}
                    onChange={handleChange}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-gray-700">Enable Offline Mode</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="enableDeepLinking"
                    checked={formData.enableDeepLinking}
                    onChange={handleChange}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-gray-700">Enable Deep Linking</span>
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create App'}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
