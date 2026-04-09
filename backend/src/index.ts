import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

type BuildStatus = 'pending' | 'building' | 'completed' | 'failed';
type Platform = 'android' | 'ios';

interface AppConfig {
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

interface Build {
  id: string;
  appId: string;
  status: BuildStatus;
  platform: Platform;
  downloadUrl?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

const apps = new Map<string, AppConfig>();
const builds = new Map<string, Build>();

app.use(cors());
app.use(express.json());

const isValidUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const normalizePlatform = (value: unknown): Platform => {
  if (value === 'ios') {
    return 'ios';
  }
  return 'android';
};

const inferDownloadExtension = (platform: Platform): string => {
  return platform === 'ios' ? 'ipa' : 'apk';
};

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/apps', (req: Request, res: Response) => {
  try {
    const { name, description, url, icon, theme, features } = req.body as Partial<AppConfig>;

    const trimmedName = (name ?? '').trim();
    const trimmedDescription = (description ?? '').trim();
    const trimmedUrl = (url ?? '').trim();

    if (!trimmedName || !trimmedDescription || !trimmedUrl) {
      return res.status(400).json({ error: 'Name, description, and URL are required' });
    }

    if (!isValidUrl(trimmedUrl)) {
      return res.status(400).json({ error: 'URL must be a valid http/https address' });
    }

    const now = new Date().toISOString();
    const appConfig: AppConfig = {
      id: uuidv4(),
      name: trimmedName,
      description: trimmedDescription,
      url: trimmedUrl,
      icon,
      theme,
      features,
      createdAt: now,
      updatedAt: now,
    };

    apps.set(appConfig.id, appConfig);
    return res.status(201).json(appConfig);
  } catch (error) {
    console.error('Failed to create app', error);
    return res.status(500).json({ error: 'Failed to create app' });
  }
});

app.get('/api/apps', (_req: Request, res: Response) => {
  try {
    return res.json(Array.from(apps.values()));
  } catch (error) {
    console.error('Failed to fetch apps', error);
    return res.status(500).json({ error: 'Failed to fetch apps' });
  }
});

app.get('/api/apps/:id', (req: Request, res: Response) => {
  try {
    const found = apps.get(req.params.id);

    if (!found) {
      return res.status(404).json({ error: 'App not found' });
    }

    return res.json(found);
  } catch (error) {
    console.error('Failed to fetch app', error);
    return res.status(500).json({ error: 'Failed to fetch app' });
  }
});

app.put('/api/apps/:id', (req: Request, res: Response) => {
  try {
    const existing = apps.get(req.params.id);

    if (!existing) {
      return res.status(404).json({ error: 'App not found' });
    }

    const incoming = req.body as Partial<AppConfig>;

    if (incoming.url && !isValidUrl(incoming.url)) {
      return res.status(400).json({ error: 'URL must be a valid http/https address' });
    }

    const updated: AppConfig = {
      ...existing,
      ...incoming,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };

    apps.set(existing.id, updated);
    return res.json(updated);
  } catch (error) {
    console.error('Failed to update app', error);
    return res.status(500).json({ error: 'Failed to update app' });
  }
});

app.delete('/api/apps/:id', (req: Request, res: Response) => {
  try {
    if (!apps.has(req.params.id)) {
      return res.status(404).json({ error: 'App not found' });
    }

    apps.delete(req.params.id);
    return res.json({ message: 'App deleted successfully' });
  } catch (error) {
    console.error('Failed to delete app', error);
    return res.status(500).json({ error: 'Failed to delete app' });
  }
});

app.post('/api/apps/:id/build', (req: Request, res: Response) => {
  try {
    const appId = req.params.id;
    const platform = normalizePlatform(req.body?.platform);

    if (!apps.has(appId)) {
      return res.status(404).json({ error: 'App not found' });
    }

    const buildId = uuidv4();
    const now = new Date().toISOString();

    const build: Build = {
      id: buildId,
      appId,
      status: 'building',
      platform,
      createdAt: now,
    };

    builds.set(buildId, build);

    setTimeout(() => {
      const existing = builds.get(buildId);
      if (!existing) {
        return;
      }

      const extension = inferDownloadExtension(existing.platform);
      const completed: Build = {
        ...existing,
        status: 'completed',
        downloadUrl: `/downloads/${buildId}.${extension}`,
        completedAt: new Date().toISOString(),
      };

      builds.set(buildId, completed);
    }, 5000);

    return res.status(201).json(build);
  } catch (error) {
    console.error('Failed to start build', error);
    return res.status(500).json({ error: 'Failed to start build' });
  }
});

app.get('/api/builds/:buildId', (req: Request, res: Response) => {
  try {
    const build = builds.get(req.params.buildId);

    if (!build) {
      return res.status(404).json({ error: 'Build not found' });
    }

    return res.json(build);
  } catch (error) {
    console.error('Failed to fetch build', error);
    return res.status(500).json({ error: 'Failed to fetch build' });
  }
});

app.get('/api/apps/:id/builds', (req: Request, res: Response) => {
  try {
    const appId = req.params.id;

    if (!apps.has(appId)) {
      return res.status(404).json({ error: 'App not found' });
    }

    const appBuilds = Array.from(builds.values()).filter((build) => build.appId === appId);
    return res.json(appBuilds);
  } catch (error) {
    console.error('Failed to fetch builds', error);
    return res.status(500).json({ error: 'Failed to fetch builds' });
  }
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`App Wrapper Store Backend running on http://localhost:${PORT}`);
  console.log(`Health endpoint: http://localhost:${PORT}/api/health`);
});

export default app;
