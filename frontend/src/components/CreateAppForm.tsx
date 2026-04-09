import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { appService } from '../services/api';
import { useAppStore } from '../store/appStore';
import InlineError from './InlineError';
import { toUiError } from '../utils/error-utils';

interface CreateAppFormProps {
  onSuccess: () => void;
}

interface FormData {
  name: string;
  description: string;
  url: string;
  icon: string;
  primaryColor: string;
  accentColor: string;
  enablePushNotifications: boolean;
  enableOfflineMode: boolean;
  enableNativeSharing: boolean;
  enableDeepLinking: boolean;
}

const initialFormData: FormData = {
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
};

export default function CreateAppForm({ onSuccess }: CreateAppFormProps) {
  const addApp = useAppStore((state) => state.addApp);
  const pushError = useAppStore((state) => state.pushError);
  const clearScope = useAppStore((state) => state.clearScope);

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = event.target;
    const value = target instanceof HTMLInputElement && target.type === 'checkbox' ? target.checked : target.value;

    setFormData((prev) => ({
      ...prev,
      [target.name]: value,
    }));
  };

  const submit = async () => {
    clearScope('create-app');

    try {
      setIsSubmitting(true);

      const response = await appService.create({
        name: formData.name.trim(),
        description: formData.description.trim(),
        url: formData.url.trim(),
        icon: formData.icon.trim() || undefined,
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
      setFormData(initialFormData);
      clearScope('create-app');
      setIsOpen(false);
      onSuccess();
    } catch (error) {
      pushError(
        toUiError(error, {
          scope: 'create-app',
          fallbackMessage: 'Failed to create app. Please review your input and try again.',
          retryable: true,
        }),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submit();
  };

  return (
    <div className="mb-6">
      {!isOpen ? (
        <button
          onClick={() => {
            clearScope('create-app');
            setIsOpen(true);
          }}
          className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white transition-colors hover:bg-primary/90"
        >
          + Create New App
        </button>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">Create New App</h2>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <InlineError
              scope="create-app"
              onRetry={() => {
                formRef.current?.requestSubmit();
              }}
            />

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">App Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., ChatGPT Codex"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your app..."
                required
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Website URL *</label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://example.com"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Icon URL</label>
              <input
                type="url"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                placeholder="https://example.com/icon.png"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Primary Color</label>
                <input
                  type="color"
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleChange}
                  className="h-10 w-full cursor-pointer rounded-lg border border-gray-300"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Accent Color</label>
                <input
                  type="color"
                  name="accentColor"
                  value={formData.accentColor}
                  onChange={handleChange}
                  className="h-10 w-full cursor-pointer rounded-lg border border-gray-300"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="mb-3 font-semibold text-gray-800">Features</h3>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    name="enableNativeSharing"
                    checked={formData.enableNativeSharing}
                    onChange={handleChange}
                    className="h-4 w-4 rounded"
                  />
                  <span className="text-sm text-gray-700">Enable Native Sharing</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    name="enablePushNotifications"
                    checked={formData.enablePushNotifications}
                    onChange={handleChange}
                    className="h-4 w-4 rounded"
                  />
                  <span className="text-sm text-gray-700">Enable Push Notifications</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    name="enableOfflineMode"
                    checked={formData.enableOfflineMode}
                    onChange={handleChange}
                    className="h-4 w-4 rounded"
                  />
                  <span className="text-sm text-gray-700">Enable Offline Mode</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    name="enableDeepLinking"
                    checked={formData.enableDeepLinking}
                    onChange={handleChange}
                    className="h-4 w-4 rounded"
                  />
                  <span className="text-sm text-gray-700">Enable Deep Linking</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 border-t pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-lg bg-primary px-4 py-2 font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create App'}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearScope('create-app');
                  setIsOpen(false);
                }}
                className="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-800 transition-colors hover:bg-gray-300"
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
