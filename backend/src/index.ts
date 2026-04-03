import express, { Request, Response } from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with database in production)
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
  status: "pending" | "building" | "completed" | "failed";
  platform: "android" | "ios";
  downloadUrl?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

const apps: Map<string, AppConfig> = new Map();
const builds: Map<string, Build> = new Map();

// Routes

/**
 * GET /api/health
 * Health check endpoint
 */
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/**
 * POST /api/apps
 * Create a new app configuration
 */
app.post("/api/apps", (req: Request, res: Response) => {
  try {
    const { name, description, url, icon, theme, features } = req.body;

    // Validation
    if (!name || !url) {
      return res.status(400).json({ error: "Name and URL are required" });
    }

    const appId = uuidv4();
    const now = new Date().toISOString();

    const appConfig: AppConfig = {
      id: appId,
      name,
      description,
      url,
      icon,
      theme,
      features,
      createdAt: now,
      updatedAt: now,
    };

    apps.set(appId, appConfig);

    res.status(201).json(appConfig);
  } catch (error) {
    res.status(500).json({ error: "Failed to create app" });
  }
});

/**
 * GET /api/apps
 * List all apps
 */
app.get("/api/apps", (req: Request, res: Response) => {
  try {
    const appList = Array.from(apps.values());
    res.json(appList);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch apps" });
  }
});

/**
 * GET /api/apps/:id
 * Get app details
 */
app.get("/api/apps/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const app = apps.get(id);

    if (!app) {
      return res.status(404).json({ error: "App not found" });
    }

    res.json(app);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch app" });
  }
});

/**
 * PUT /api/apps/:id
 * Update app configuration
 */
app.put("/api/apps/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const app = apps.get(id);

    if (!app) {
      return res.status(404).json({ error: "App not found" });
    }

    const updated: AppConfig = {
      ...app,
      ...req.body,
      id: app.id,
      createdAt: app.createdAt,
      updatedAt: new Date().toISOString(),
    };

    apps.set(id, updated);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update app" });
  }
});

/**
 * DELETE /api/apps/:id
 * Delete app configuration
 */
app.delete("/api/apps/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const app = apps.get(id);

    if (!app) {
      return res.status(404).json({ error: "App not found" });
    }

    apps.delete(id);
    res.json({ message: "App deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete app" });
  }
});

/**
 * POST /api/apps/:id/build
 * Trigger APK/IPA build
 */
app.post("/api/apps/:id/build", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { platform = "android" } = req.body;

    const app = apps.get(id);
    if (!app) {
      return res.status(404).json({ error: "App not found" });
    }

    const buildId = uuidv4();
    const now = new Date().toISOString();

    const build: Build = {
      id: buildId,
      appId: id,
      status: "pending",
      platform,
      createdAt: now,
    };

    builds.set(buildId, build);

    // Simulate build process (in production, trigger actual build)
    setTimeout(() => {
      const updatedBuild = builds.get(buildId);
      if (updatedBuild) {
        updatedBuild.status = "completed";
        updatedBuild.downloadUrl = `/downloads/${buildId}.apk`;
        updatedBuild.completedAt = new Date().toISOString();
        builds.set(buildId, updatedBuild);
      }
    }, 5000);

    res.status(201).json(build);
  } catch (error) {
    res.status(500).json({ error: "Failed to start build" });
  }
});

/**
 * GET /api/builds/:buildId
 * Get build status
 */
app.get("/api/builds/:buildId", (req: Request, res: Response) => {
  try {
    const { buildId } = req.params;
    const build = builds.get(buildId);

    if (!build) {
      return res.status(404).json({ error: "Build not found" });
    }

    res.json(build);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch build" });
  }
});

/**
 * GET /api/apps/:id/builds
 * Get all builds for an app
 */
app.get("/api/apps/:id/builds", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appBuilds = Array.from(builds.values()).filter((b) => b.appId === id);
    res.json(appBuilds);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch builds" });
  }
});

// Error handling
app.use((err: any, req: Request, res: Response) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 App Wrapper Store Backend running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
});

export default app;
