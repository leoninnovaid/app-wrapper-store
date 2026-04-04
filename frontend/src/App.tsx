import React, { useEffect } from 'react';
import Header from './components/Header';
import CreateAppForm from './components/CreateAppForm';
import AppList from './components/AppList';
import { useAppStore } from './store/appStore';
import { healthCheck } from './services/api';

export default function App() {
  const { error, setError } = useAppStore();

  useEffect(() => {
    // Check backend health on mount
    healthCheck()
      .then(() => console.log('✅ Backend is healthy'))
      .catch(() => setError('Backend is not available. Please make sure the server is running.'));
  }, [setError]);

  return (
    <div className="min-h-screen bg-light">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Create App Form */}
        <CreateAppForm onSuccess={() => {}} />

        {/* App List */}
        <AppList />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © 2026 App Wrapper Store • Open Source • MIT License
          </p>
        </div>
      </footer>
    </div>
  );
}
