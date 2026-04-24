import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { useAppStore } from '../store/appStore';

afterEach(() => {
  cleanup();
  useAppStore.setState(
    {
      apps: [],
      selectedApp: null,
      builds: new Map(),
      appSources: new Map(),
      sourceValidations: new Map(),
      updateChecks: new Map(),
      loading: false,
      globalErrors: [],
      scopedErrors: {
        global: [],
        'create-app': [],
        'load-apps': [],
        'build-app': [],
        'delete-app': [],
        'source-validate': [],
        'source-attach': [],
        'update-check': [],
        release: [],
      },
    },
    false,
  );
});
