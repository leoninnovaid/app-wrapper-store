import { create } from 'zustand';
import { AppConfig, AppSource, Build, SourceValidationResult, UpdateCheckResult } from '../services/api';
import { ErrorScope, UiError } from '../types/errors';

type ScopedErrorMap = Record<ErrorScope, UiError[]>;

const initialScopedErrors = (): ScopedErrorMap => ({
  global: [],
  'create-app': [],
  'load-apps': [],
  'build-app': [],
  'delete-app': [],
  'source-validate': [],
  'source-attach': [],
  'update-check': [],
  release: [],
});

interface AppStore {
  apps: AppConfig[];
  selectedApp: AppConfig | null;
  builds: Map<string, Build>;
  appSources: Map<string, AppSource[]>;
  sourceValidations: Map<string, SourceValidationResult>;
  updateChecks: Map<string, UpdateCheckResult>;
  loading: boolean;
  globalErrors: UiError[];
  scopedErrors: ScopedErrorMap;

  setApps: (apps: AppConfig[]) => void;
  addApp: (app: AppConfig) => void;
  updateApp: (id: string, app: Partial<AppConfig>) => void;
  deleteApp: (id: string) => void;
  selectApp: (app: AppConfig | null) => void;
  setBuild: (buildId: string, build: Build) => void;
  addSourceToApp: (appId: string, source: AppSource) => void;
  setSourceValidation: (appId: string, validation: SourceValidationResult) => void;
  setUpdateCheck: (appId: string, result: UpdateCheckResult) => void;
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
  appSources: new Map(),
  sourceValidations: new Map(),
  updateChecks: new Map(),
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
      appSources: new Map([...state.appSources].filter(([appId]) => appId !== id)),
      sourceValidations: new Map([...state.sourceValidations].filter(([appId]) => appId !== id)),
      updateChecks: new Map([...state.updateChecks].filter(([appId]) => appId !== id)),
    })),
  selectApp: (app) => set({ selectedApp: app }),
  setBuild: (buildId, build) =>
    set((state) => {
      const nextBuilds = new Map(state.builds);
      nextBuilds.set(buildId, build);
      return { builds: nextBuilds };
    }),
  addSourceToApp: (appId, source) =>
    set((state) => {
      const nextSources = new Map(state.appSources);
      const existingSources = nextSources.get(appId) ?? [];
      nextSources.set(
        appId,
        existingSources.some((entry) => entry.id === source.id) ? existingSources : [...existingSources, source],
      );
      return { appSources: nextSources };
    }),
  setSourceValidation: (appId, validation) =>
    set((state) => {
      const nextValidations = new Map(state.sourceValidations);
      nextValidations.set(appId, validation);
      return { sourceValidations: nextValidations };
    }),
  setUpdateCheck: (appId, result) =>
    set((state) => {
      const nextChecks = new Map(state.updateChecks);
      nextChecks.set(appId, result);
      return { updateChecks: nextChecks };
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
