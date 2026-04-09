import axios from 'axios';

const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim();
const API_BASE_URL = configuredBaseUrl && configuredBaseUrl.length > 0 ? configuredBaseUrl : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
  traceId?: string;
}

export type PackagingStrategy = 'webview' | 'twa' | 'capacitor' | 'cordova';
export type DistributionChannel = 'local-sideload' | 'play-store';
export type AndroidArtifactType = 'apk' | 'aab';

export interface ApkReadinessChecklist {
  httpsEnabled?: boolean;
  validWebManifest?: boolean;
  serviceWorkerReady?: boolean;
  digitalAssetLinksReady?: boolean;
  signingKeyReady?: boolean;
  targetApiCompliant?: boolean;
}

export interface PackagingConfig {
  strategy?: PackagingStrategy;
  distribution?: DistributionChannel;
  preferredArtifact?: AndroidArtifactType;
  readiness?: ApkReadinessChecklist;
}

export interface AppConfig {
  id: string;
  name: string;
  description: string;
  url: string;
  icon?: string;
  theme?: {
    primaryColor?: string;
    accentColor?: string;
  };
  features?: {
    enablePushNotifications?: boolean;
    enableOfflineMode?: boolean;
    enableNativeSharing?: boolean;
    enableDeepLinking?: boolean;
    packaging?: PackagingConfig;
  };
  currentVersion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Build {
  id: string;
  appId: string;
  status: 'pending' | 'building' | 'completed' | 'failed';
  platform: 'android' | 'ios';
  downloadUrl?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface BuildLog {
  id: string;
  buildId: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  details?: string;
  createdAt: string;
}

export interface AppSource {
  id: string;
  appId: string;
  sourceType: 'github' | 'fdroid' | 'gitlab' | 'custom';
  sourceUrl: string;
  metadata?: {
    title?: string;
    owner?: string;
    description?: string;
  };
  createdAt: string;
}

export interface ReleaseArtifact {
  name: string;
  type: 'apk' | 'aab' | 'ipa' | 'other';
  platform: 'android' | 'ios' | 'any';
  url: string;
  size: number;
  checksum?: string;
  verificationStatus: 'verified' | 'unverified' | 'blocked';
  reason?: string;
}

export interface SourceRelease {
  version: string;
  tag: string;
  publishedAt: string;
  notes?: string;
  artifacts: ReleaseArtifact[];
}

export interface UpdateCheckResult {
  appId: string;
  status: 'update_available' | 'no_update' | 'blocked';
  checkedAt: string;
  sourceType?: 'github' | 'fdroid' | 'gitlab' | 'custom';
  sourceUrl?: string;
  release?: SourceRelease;
  artifact?: ReleaseArtifact;
  reason?: string;
}

export const appService = {
  getAll: () => api.get<AppConfig[]>('/apps'),
  getById: (id: string) => api.get<AppConfig>(`/apps/${id}`),
  create: (data: Omit<AppConfig, 'id' | 'createdAt' | 'updatedAt'>) => api.post<AppConfig>('/apps', data),
  update: (id: string, data: Partial<AppConfig>) => api.put<AppConfig>(`/apps/${id}`, data),
  delete: (id: string) => api.delete(`/apps/${id}`),
};

export const buildService = {
  triggerBuild: (appId: string, platform: 'android' | 'ios' = 'android') =>
    api.post<Build>(`/apps/${appId}/build`, { platform }),
  getStatus: (buildId: string) => api.get<Build>(`/builds/${buildId}`),
  getAppBuilds: (appId: string) => api.get<Build[]>(`/apps/${appId}/builds`),
  getLogs: (buildId: string) => api.get<BuildLog[]>(`/builds/${buildId}/logs`),
  retry: (buildId: string) => api.post<Build>(`/builds/${buildId}/retry`),
};

export const sourceService = {
  validate: (sourceType: AppSource['sourceType'], sourceUrl: string) =>
    api.post('/sources/validate', { sourceType, sourceUrl }),
  attachToApp: (appId: string, sourceType: AppSource['sourceType'], sourceUrl: string) =>
    api.post<AppSource>(`/apps/${appId}/sources`, { sourceType, sourceUrl }),
};

export const updateService = {
  get: (appId: string, platform: 'android' | 'ios' = 'android') =>
    api.get<UpdateCheckResult>(`/apps/${appId}/updates`, { params: { platform } }),
  check: (appId: string, platform: 'android' | 'ios' = 'android') =>
    api.post<UpdateCheckResult>(`/apps/${appId}/updates/check`, { platform }),
};

export const healthCheck = () => api.get('/health');

export default api;
