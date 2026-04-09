import { useEffect } from 'react';
import Header from './components/Header';
import CreateAppForm from './components/CreateAppForm';
import AppList from './components/AppList';
import { useAppStore } from './store/appStore';
import { healthCheck } from './services/api';

export default function App() {
  const { error, setError } = useAppStore();

  useEffect(() => {
    healthCheck()
      .then(() => {
        console.log('Backend is healthy');
      })
      .catch(() => setError('Backend is not available. Please make sure the server is running.'));
  }, [setError]);

  return (
    <div className="min-h-screen bg-light">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="font-medium text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-600 underline hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        )}

        <CreateAppForm onSuccess={() => {}} />
        <AppList />
      </main>

      <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            (c) 2026 App Wrapper Store | Open Source | MIT License
          </p>
        </div>
      </footer>
    </div>
  );
}
