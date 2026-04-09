import { useEffect } from 'react';
import AppList from './components/AppList';
import CreateAppForm from './components/CreateAppForm';
import GlobalErrorBanner from './components/GlobalErrorBanner';
import Header from './components/Header';
import { healthCheck } from './services/api';
import { useAppStore } from './store/appStore';
import { toUiError } from './utils/error-utils';

export default function App() {
  const pushError = useAppStore((state) => state.pushError);
  const clearScope = useAppStore((state) => state.clearScope);

  useEffect(() => {
    healthCheck()
      .then(() => {
        clearScope('global');
      })
      .catch((error) => {
        pushError(
          toUiError(error, {
            scope: 'global',
            fallbackMessage: 'Backend is not available. Please make sure the server is running.',
            retryable: true,
          }),
        );
      });
  }, [clearScope, pushError]);

  return (
    <div className="min-h-screen bg-light">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <GlobalErrorBanner />
        <CreateAppForm onSuccess={() => {}} />
        <AppList />
      </main>

      <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">(c) 2026 App Wrapper Store | Open Source | MIT License</p>
        </div>
      </footer>
    </div>
  );
}
