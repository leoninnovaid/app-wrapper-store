import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  };
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

// App endpoints
export const appService = {
  getAll: () => api.get<AppConfig[]>('/apps'),
  getById: (id: string) => api.get<AppConfig>(`/apps/${id}`),
  create: (data: Omit<AppConfig, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<AppConfig>('/apps', data),
  update: (id: string, data: Partial<AppConfig>) =>
    api.put<AppConfig>(`/apps/${id}`, data),
  delete: (id: string) => api.delete(`/apps/${id}`),
};

// Build endpoints
export const buildService = {
  triggerBuild: (appId: string, platform: 'android' | 'ios' = 'android') =>
    api.post<Build>(`/apps/${appId}/build`, { platform }),
  getStatus: (buildId: string) => api.get<Build>(`/builds/${buildId}`),
  getAppBuilds: (appId: string) => api.get<Build[]>(`/apps/${appId}/builds`),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
