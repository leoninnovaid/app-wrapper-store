import { create } from 'zustand';
import { AppConfig, Build } from '../services/api';

interface AppStore {
  apps: AppConfig[];
  selectedApp: AppConfig | null;
  builds: Map<string, Build>;
  loading: boolean;
  error: string | null;

  // Actions
  setApps: (apps: AppConfig[]) => void;
  addApp: (app: AppConfig) => void;
  updateApp: (id: string, app: Partial<AppConfig>) => void;
  deleteApp: (id: string) => void;
  selectApp: (app: AppConfig | null) => void;
  setBuild: (buildId: string, build: Build) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  apps: [],
  selectedApp: null,
  builds: new Map(),
  loading: false,
  error: null,

  setApps: (apps) => set({ apps }),
  addApp: (app) => set((state) => ({ apps: [...state.apps, app] })),
  updateApp: (id, app) =>
    set((state) => ({
      apps: state.apps.map((a) => (a.id === id ? { ...a, ...app } : a)),
    })),
  deleteApp: (id) =>
    set((state) => ({
      apps: state.apps.filter((a) => a.id !== id),
    })),
  selectApp: (app) => set({ selectedApp: app }),
  setBuild: (buildId, build) =>
    set((state) => {
      const newBuilds = new Map(state.builds);
      newBuilds.set(buildId, build);
      return { builds: newBuilds };
    }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
