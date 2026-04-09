import { create } from 'zustand';
import { AppConfig, Build } from '../services/api';
import { ErrorScope, UiError } from '../types/errors';

type ScopedErrorMap = Record<ErrorScope, UiError[]>;

const initialScopedErrors = (): ScopedErrorMap => ({
  global: [],
  'create-app': [],
  'load-apps': [],
  'build-app': [],
  'delete-app': [],
  'source-validate': [],
  'update-check': [],
  release: [],
});

interface AppStore {
  apps: AppConfig[];
  selectedApp: AppConfig | null;
  builds: Map<string, Build>;
  loading: boolean;
  globalErrors: UiError[];
  scopedErrors: ScopedErrorMap;

  setApps: (apps: AppConfig[]) => void;
  addApp: (app: AppConfig) => void;
  updateApp: (id: string, app: Partial<AppConfig>) => void;
  deleteApp: (id: string) => void;
  selectApp: (app: AppConfig | null) => void;
  setBuild: (buildId: string, build: Build) => void;
  setLoading: (loading: boolean) => void;
  pushError: (error: UiError) => void;
  clearError: (errorId: string) => void;
  clearScope: (scope: ErrorScope) => void;
  clearAllErrors: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  apps: [],
  selectedApp: null,
  builds: new Map(),
  loading: false,
  globalErrors: [],
  scopedErrors: initialScopedErrors(),

  setApps: (apps) => set({ apps }),
  addApp: (app) => set((state) => ({ apps: [...state.apps, app] })),
  updateApp: (id, app) =>
    set((state) => ({
      apps: state.apps.map((item) => (item.id === id ? { ...item, ...app } : item)),
    })),
  deleteApp: (id) =>
    set((state) => ({
      apps: state.apps.filter((item) => item.id !== id),
    })),
  selectApp: (app) => set({ selectedApp: app }),
  setBuild: (buildId, build) =>
    set((state) => {
      const nextBuilds = new Map(state.builds);
      nextBuilds.set(buildId, build);
      return { builds: nextBuilds };
    }),
  setLoading: (loading) => set({ loading }),
  pushError: (error) =>
    set((state) => {
      const nextScoped = { ...state.scopedErrors };
      nextScoped[error.scope] = [...nextScoped[error.scope], error];

      const nextGlobal = [...state.globalErrors, error].slice(-25);

      return {
        scopedErrors: nextScoped,
        globalErrors: nextGlobal,
      };
    }),
  clearError: (errorId) =>
    set((state) => {
      const nextScoped = { ...state.scopedErrors };
      (Object.keys(nextScoped) as ErrorScope[]).forEach((scope) => {
        nextScoped[scope] = nextScoped[scope].filter((error) => error.id !== errorId);
      });

      return {
        scopedErrors: nextScoped,
        globalErrors: state.globalErrors.filter((error) => error.id !== errorId),
      };
    }),
  clearScope: (scope) =>
    set((state) => {
      const idsInScope = new Set(state.scopedErrors[scope].map((error) => error.id));
      const nextScoped = { ...state.scopedErrors, [scope]: [] };

      return {
        scopedErrors: nextScoped,
        globalErrors: state.globalErrors.filter((error) => !idsInScope.has(error.id)),
      };
    }),
  clearAllErrors: () =>
    set({
      globalErrors: [],
      scopedErrors: initialScopedErrors(),
    }),
}));
