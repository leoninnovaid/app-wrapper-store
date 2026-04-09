import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import { SourceAdapter } from './adapters/source-adapter';
import { ApiError, isApiError } from './errors/api-error';
import { requestContextMiddleware } from './middleware/request-context';
import { SqliteStoreRepository } from './repositories/sqlite-store-repository';
import { evaluateBuildReadiness } from './services/build-readiness';
import { getSourceAdapter } from './services/source-registry';
import { checkForUpdates } from './services/update-service';
import { Build, NewAppInput, Platform, SourceType } from './types/domain';
import { logger } from './utils/logger';

dotenv.config();

const repository = new SqliteStoreRepository();
const PORT = Number(process.env.PORT ?? 3000);

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function inferSourceType(sourceUrl: string): SourceType {
  const normalized = sourceUrl.toLowerCase();
  if (normalized.includes('github.com')) {
    return 'github';
  }

  if (normalized.includes('f-droid') || normalized.includes('fdroid')) {
    return 'fdroid';
  }

  return 'custom';
}

function normalizeSourceType(value: unknown, sourceUrl: string): SourceType {
  const inferred = inferSourceType(sourceUrl);
  if (typeof value !== 'string' || value.trim().length === 0) {
    return inferred;
  }

  const sourceType = value.trim().toLowerCase();
  const allowed: SourceType[] = ['github', 'fdroid', 'gitlab', 'custom'];
  if (!allowed.includes(sourceType as SourceType)) {
    throw new ApiError(400, 'VALIDATION_ERROR', `Unsupported sourceType: ${value}`);
  }

  return sourceType as SourceType;
}

function normalizePlatform(value: unknown): Platform {
  if (value === 'ios') {
    return 'ios';
  }

  return 'android';
}

function buildDownloadExtension(platform: Platform): 'apk' | 'ipa' {
  return platform === 'ios' ? 'ipa' : 'apk';
}

type AsyncRoute = (req: Request, res: Response, next: NextFunction) => Promise<void>;

function asyncHandler(handler: AsyncRoute) {
  return (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res, next).catch(next);
  };
}

interface StringGuardOptions {
  minLength?: number;
  maxLength?: number;
}

function requireString(value: unknown, fieldName: string, options?: StringGuardOptions): string {
  const minLength = options?.minLength ?? 1;
  const maxLength = options?.maxLength;

  if (typeof value !== 'string') {
    throw new ApiError(400, 'VALIDATION_ERROR', `${fieldName} must be a string`);
  }

  const trimmed = value.trim();
  if (trimmed.length < minLength) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${fieldName} is required`);
  }

  if (maxLength !== undefined && trimmed.length > maxLength) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${fieldName} must be at most ${maxLength} characters long`);
  }

  return trimmed;
}

function optionalString(value: unknown, fieldName: string, options?: Pick<StringGuardOptions, 'maxLength'>): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new ApiError(400, 'VALIDATION_ERROR', `${fieldName} must be a string`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const maxLength = options?.maxLength;
  if (maxLength !== undefined && trimmed.length > maxLength) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${fieldName} must be at most ${maxLength} characters long`);
  }

  return trimmed;
}

async function simulateBuildCompletion(build: Build, traceId: string): Promise<void> {
  const extension = buildDownloadExtension(build.platform);

  await repository.addBuildLog(build.id, 'info', 'Build job started', `platform=${build.platform}`);

  setTimeout(async () => {
    try {
      const completedBuild: Partial<Build> = {
        status: 'completed',
        completedAt: new Date().toISOString(),
        downloadUrl: `/downloads/${build.id}.${extension}`,
        error: undefined,
      };

      await repository.updateBuild(build.id, completedBuild);
      await repository.addBuildLog(build.id, 'info', 'Build job finished', `downloadUrl=/downloads/${build.id}.${extension}`);

      logger.info('Build completed', {
        traceId,
        buildId: build.id,
        appId: build.appId,
        platform: build.platform,
      });
    } catch (error) {
      await repository.updateBuild(build.id, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown build error',
      });
      await repository.addBuildLog(build.id, 'error', 'Build job failed', error instanceof Error ? error.message : 'unknown');

      logger.error('Build simulation failed', {
        traceId,
        buildId: build.id,
        error: error instanceof Error ? error.message : 'unknown',
      });
    }
  }, 5000);
}

async function buildSourceValidation(sourceAdapter: SourceAdapter, sourceUrl: string): Promise<{ valid: boolean; reason?: string; normalizedUrl: string; metadata?: unknown; releaseCount?: number; }> {
  const validation = await sourceAdapter.validate(sourceUrl);
  if (!validation.valid) {
    return {
      valid: false,
      normalizedUrl: validation.normalizedUrl,
      reason: validation.reason,
    };
  }

  const metadata = await sourceAdapter.fetchMetadata(validation.normalizedUrl);
  const releases = await sourceAdapter.listReleases(validation.normalizedUrl);

  return {
    valid: true,
    normalizedUrl: validation.normalizedUrl,
    metadata,
    releaseCount: releases.length,
  };
}

export function createServer() {
  const app = express();

  app.use(cors());
  // Guardrail: keep request bodies bounded to reduce accidental or abusive oversized payloads.
  app.use(express.json({ limit: '256kb' }));
  app.use(requestContextMiddleware);

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  app.post(
    '/api/apps',
    asyncHandler(async (req, res) => {
      const name = requireString(req.body.name, 'name', { maxLength: 120 });
      const description = requireString(req.body.description, 'description', { maxLength: 2000 });
      const url = requireString(req.body.url, 'url', { maxLength: 2048 });

      if (!isValidHttpUrl(url)) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'url must be a valid http/https address');
      }

      const newApp: NewAppInput = {
        name,
        description,
        url,
        icon: optionalString(req.body.icon, 'icon', { maxLength: 2048 }),
        theme: req.body.theme,
        features: req.body.features,
        currentVersion: optionalString(req.body.currentVersion, 'currentVersion', { maxLength: 64 }),
      };
      if (newApp.icon && !isValidHttpUrl(newApp.icon)) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'icon must be a valid http/https address');
      }

      const created = await repository.createApp(newApp);
      logger.info('App created', { traceId: req.traceId, appId: created.id });
      res.status(201).json(created);
    }),
  );

  app.get(
    '/api/apps',
    asyncHandler(async (_req, res) => {
      const apps = await repository.listApps();
      res.json(apps);
    }),
  );

  app.get(
    '/api/apps/:id',
    asyncHandler(async (req, res) => {
      const appConfig = await repository.getAppById(req.params.id);
      if (!appConfig) {
        throw new ApiError(404, 'NOT_FOUND', 'App not found', { appId: req.params.id });
      }

      res.json(appConfig);
    }),
  );

  app.put(
    '/api/apps/:id',
    asyncHandler(async (req, res) => {
      const patch: Partial<NewAppInput> = {};
      if (req.body.name !== undefined) {
        patch.name = requireString(req.body.name, 'name', { maxLength: 120 });
      }
      if (req.body.description !== undefined) {
        patch.description = requireString(req.body.description, 'description', { maxLength: 2000 });
      }
      if (req.body.url !== undefined) {
        patch.url = requireString(req.body.url, 'url', { maxLength: 2048 });
        if (!isValidHttpUrl(patch.url)) {
          throw new ApiError(400, 'VALIDATION_ERROR', 'url must be a valid http/https address');
        }
      }
      if (req.body.icon !== undefined) {
        patch.icon = optionalString(req.body.icon, 'icon', { maxLength: 2048 });
        if (patch.icon && !isValidHttpUrl(patch.icon)) {
          throw new ApiError(400, 'VALIDATION_ERROR', 'icon must be a valid http/https address');
        }
      }
      if (req.body.theme !== undefined) {
        patch.theme = req.body.theme;
      }
      if (req.body.features !== undefined) {
        patch.features = req.body.features;
      }
      if (req.body.currentVersion !== undefined) {
        patch.currentVersion = optionalString(req.body.currentVersion, 'currentVersion', { maxLength: 64 });
      }

      const updated = await repository.updateApp(req.params.id, patch);
      if (!updated) {
        throw new ApiError(404, 'NOT_FOUND', 'App not found', { appId: req.params.id });
      }

      res.json(updated);
    }),
  );

  app.delete(
    '/api/apps/:id',
    asyncHandler(async (req, res) => {
      const deleted = await repository.deleteApp(req.params.id);
      if (!deleted) {
        throw new ApiError(404, 'NOT_FOUND', 'App not found', { appId: req.params.id });
      }

      res.json({ message: 'App deleted successfully' });
    }),
  );

  app.post(
    '/api/apps/:id/build',
    asyncHandler(async (req, res) => {
      const appConfig = await repository.getAppById(req.params.id);
      if (!appConfig) {
        throw new ApiError(404, 'NOT_FOUND', 'App not found', { appId: req.params.id });
      }

      const platform = normalizePlatform(req.body?.platform);
      // Guardrail: avoid overlapping build jobs for the same app to keep build state deterministic.
      const activeBuild = await repository.getActiveBuildForApp(appConfig.id);
      if (activeBuild) {
        throw new ApiError(409, 'CONFLICT', 'A build is already running for this app', {
          appId: appConfig.id,
          existingBuildId: activeBuild.id,
          startedAt: activeBuild.createdAt,
        });
      }

      const readiness = evaluateBuildReadiness(appConfig, platform);
      if (!readiness.ready) {
        throw new ApiError(400, 'APK_READINESS_FAILED', 'Build blocked by missing APK readiness requirements', {
          appId: appConfig.id,
          platform,
          strategy: readiness.strategy,
          distribution: readiness.distribution,
          preferredArtifact: readiness.preferredArtifact,
          missingRequirements: readiness.missingRequirements,
        });
      }

      const build = await repository.createBuild(appConfig.id, platform);
      await simulateBuildCompletion(build, req.traceId);

      logger.info('Build triggered', {
        traceId: req.traceId,
        appId: appConfig.id,
        buildId: build.id,
        platform,
      });

      res.status(201).json(build);
    }),
  );

  app.get(
    '/api/builds/:buildId',
    asyncHandler(async (req, res) => {
      const build = await repository.getBuildById(req.params.buildId);
      if (!build) {
        throw new ApiError(404, 'NOT_FOUND', 'Build not found', { buildId: req.params.buildId });
      }

      res.json(build);
    }),
  );

  app.get(
    '/api/apps/:id/builds',
    asyncHandler(async (req, res) => {
      const appConfig = await repository.getAppById(req.params.id);
      if (!appConfig) {
        throw new ApiError(404, 'NOT_FOUND', 'App not found', { appId: req.params.id });
      }

      const builds = await repository.getBuildsForApp(appConfig.id);
      res.json(builds);
    }),
  );

  app.get(
    '/api/builds/:id/logs',
    asyncHandler(async (req, res) => {
      const build = await repository.getBuildById(req.params.id);
      if (!build) {
        throw new ApiError(404, 'NOT_FOUND', 'Build not found', { buildId: req.params.id });
      }

      const logs = await repository.getBuildLogs(build.id);
      res.json(logs);
    }),
  );

  app.post(
    '/api/builds/:id/retry',
    asyncHandler(async (req, res) => {
      const build = await repository.getBuildById(req.params.id);
      if (!build) {
        throw new ApiError(404, 'NOT_FOUND', 'Build not found', { buildId: req.params.id });
      }

      const resetBuild = await repository.updateBuild(build.id, {
        status: 'building',
        error: undefined,
        completedAt: undefined,
      });

      if (!resetBuild) {
        throw new ApiError(500, 'BACKEND_ERROR', 'Failed to reset build');
      }

      await repository.addBuildLog(build.id, 'info', 'Build retry requested');
      await simulateBuildCompletion(resetBuild, req.traceId);

      res.status(202).json(resetBuild);
    }),
  );

  app.post(
    '/api/sources/validate',
    asyncHandler(async (req, res) => {
      const sourceUrl = requireString(req.body.sourceUrl, 'sourceUrl', { maxLength: 2048 });
      if (!isValidHttpUrl(sourceUrl)) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'sourceUrl must be a valid http/https address');
      }

      const sourceType = normalizeSourceType(req.body.sourceType, sourceUrl);
      const sourceAdapter = getSourceAdapter(sourceType);
      const validation = await buildSourceValidation(sourceAdapter, sourceUrl);

      if (!validation.valid) {
        throw new ApiError(400, 'SOURCE_VALIDATION_FAILED', 'Source validation failed', {
          sourceType,
          sourceUrl,
          reason: validation.reason,
        });
      }

      res.json({
        sourceType,
        sourceUrl: validation.normalizedUrl,
        metadata: validation.metadata,
        releaseCount: validation.releaseCount ?? 0,
      });
    }),
  );

  app.post(
    '/api/apps/:id/sources',
    asyncHandler(async (req, res) => {
      const appConfig = await repository.getAppById(req.params.id);
      if (!appConfig) {
        throw new ApiError(404, 'NOT_FOUND', 'App not found', { appId: req.params.id });
      }

      const sourceUrl = requireString(req.body.sourceUrl, 'sourceUrl', { maxLength: 2048 });
      if (!isValidHttpUrl(sourceUrl)) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'sourceUrl must be a valid http/https address');
      }

      const sourceType = normalizeSourceType(req.body.sourceType, sourceUrl);
      const sourceAdapter = getSourceAdapter(sourceType);
      const validation = await sourceAdapter.validate(sourceUrl);
      if (!validation.valid) {
        throw new ApiError(400, 'SOURCE_VALIDATION_FAILED', 'Source validation failed', {
          sourceType,
          sourceUrl,
          reason: validation.reason,
        });
      }

      const metadata = await sourceAdapter.fetchMetadata(validation.normalizedUrl);
      const source = await repository.addSource(appConfig.id, sourceType, validation.normalizedUrl, {
        title: metadata.title,
        owner: metadata.owner,
        description: metadata.description,
      });

      res.status(201).json(source);
    }),
  );

  app.get(
    '/api/apps/:id/updates',
    asyncHandler(async (req, res) => {
      const appConfig = await repository.getAppById(req.params.id);
      if (!appConfig) {
        throw new ApiError(404, 'NOT_FOUND', 'App not found', { appId: req.params.id });
      }

      const platform = normalizePlatform(req.query.platform);
      const sources = await repository.getSourcesForApp(appConfig.id);
      const result = await checkForUpdates(appConfig.id, sources, platform);
      res.json(result);
    }),
  );

  app.post(
    '/api/apps/:id/updates/check',
    asyncHandler(async (req, res) => {
      const appConfig = await repository.getAppById(req.params.id);
      if (!appConfig) {
        throw new ApiError(404, 'NOT_FOUND', 'App not found', { appId: req.params.id });
      }

      const platform = normalizePlatform(req.body?.platform);
      const sources = await repository.getSourcesForApp(appConfig.id);
      const result = await checkForUpdates(appConfig.id, sources, platform);

      res.json(result);
    }),
  );

  app.use((req, res) => {
    res.status(404).json({
      code: 'NOT_FOUND',
      message: 'Route not found',
      traceId: req.traceId,
    });
  });

  app.use((error: unknown, req: Request, res: Response, _next: NextFunction) => {
    if (isApiError(error)) {
      logger.warn('Handled API error', {
        traceId: req.traceId,
        code: error.code,
        statusCode: error.statusCode,
        message: error.message,
      });

      res.status(error.statusCode).json(error.toPayload(req.traceId));
      return;
    }

    logger.error('Unhandled server error', {
      traceId: req.traceId,
      error: error instanceof Error ? error.message : 'unknown',
    });

    res.status(500).json({
      code: 'BACKEND_ERROR',
      message: 'Internal server error',
      traceId: req.traceId,
    });
  });

  return app;
}

const app = createServer();

const isTestRuntime = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true' || process.env.VITEST === '1';
if (!isTestRuntime) {
  app.listen(PORT, () => {
    logger.info('App Wrapper Store Backend started', {
      port: PORT,
      healthUrl: `http://localhost:${PORT}/api/health`,
    });
  });
}

export default app;
