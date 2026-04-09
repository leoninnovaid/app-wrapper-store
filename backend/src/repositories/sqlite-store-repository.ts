import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../db/sqlite';
import { AppConfig, AppSource, Build, BuildLog, NewAppInput, Platform, SourceType } from '../types/domain';

interface PersistedAppRow {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string | null;
  theme: string | null;
  features: string | null;
  currentVersion: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PersistedBuildRow {
  id: string;
  appId: string;
  status: Build['status'];
  platform: Platform;
  downloadUrl: string | null;
  error: string | null;
  createdAt: string;
  completedAt: string | null;
}

interface PersistedBuildLogRow {
  id: string;
  buildId: string;
  level: BuildLog['level'];
  message: string;
  details: string | null;
  createdAt: string;
}

interface PersistedSourceRow {
  id: string;
  appId: string;
  sourceType: SourceType;
  sourceUrl: string;
  metadata: string | null;
  createdAt: string;
}

function parseJson<T>(value: string | null): T | undefined {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

function mapAppRow(row: PersistedAppRow): AppConfig {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    url: row.url,
    icon: row.icon ?? undefined,
    theme: parseJson<AppConfig['theme']>(row.theme),
    features: parseJson<AppConfig['features']>(row.features),
    currentVersion: row.currentVersion ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapBuildRow(row: PersistedBuildRow): Build {
  return {
    id: row.id,
    appId: row.appId,
    status: row.status,
    platform: row.platform,
    downloadUrl: row.downloadUrl ?? undefined,
    error: row.error ?? undefined,
    createdAt: row.createdAt,
    completedAt: row.completedAt ?? undefined,
  };
}

function mapBuildLogRow(row: PersistedBuildLogRow): BuildLog {
  return {
    id: row.id,
    buildId: row.buildId,
    level: row.level,
    message: row.message,
    details: row.details ?? undefined,
    createdAt: row.createdAt,
  };
}

function mapSourceRow(row: PersistedSourceRow): AppSource {
  return {
    id: row.id,
    appId: row.appId,
    sourceType: row.sourceType,
    sourceUrl: row.sourceUrl,
    metadata: parseJson<AppSource['metadata']>(row.metadata),
    createdAt: row.createdAt,
  };
}

export class SqliteStoreRepository {
  async createApp(input: NewAppInput): Promise<AppConfig> {
    const db = await getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO apps (id, name, description, url, icon, theme, features, currentVersion, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      input.name,
      input.description,
      input.url,
      input.icon ?? null,
      JSON.stringify(input.theme ?? {}),
      JSON.stringify(input.features ?? {}),
      input.currentVersion ?? null,
      now,
      now,
    );

    const created = await this.getAppById(id);
    if (!created) {
      throw new Error('Failed to read created app');
    }

    return created;
  }

  async listApps(): Promise<AppConfig[]> {
    const db = await getDatabase();
    const rows = await db.all<PersistedAppRow[]>(`SELECT * FROM apps ORDER BY datetime(createdAt) DESC`);
    return rows.map(mapAppRow);
  }

  async getAppById(id: string): Promise<AppConfig | null> {
    const db = await getDatabase();
    const row = await db.get<PersistedAppRow>(`SELECT * FROM apps WHERE id = ?`, id);
    return row ? mapAppRow(row) : null;
  }

  async updateApp(id: string, patch: Partial<NewAppInput>): Promise<AppConfig | null> {
    const current = await this.getAppById(id);
    if (!current) {
      return null;
    }

    const db = await getDatabase();
    const updated: AppConfig = {
      ...current,
      ...patch,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString(),
    };

    await db.run(
      `UPDATE apps
       SET name = ?, description = ?, url = ?, icon = ?, theme = ?, features = ?, currentVersion = ?, updatedAt = ?
       WHERE id = ?`,
      updated.name,
      updated.description,
      updated.url,
      updated.icon ?? null,
      JSON.stringify(updated.theme ?? {}),
      JSON.stringify(updated.features ?? {}),
      updated.currentVersion ?? null,
      updated.updatedAt,
      id,
    );

    return updated;
  }

  async deleteApp(id: string): Promise<boolean> {
    const db = await getDatabase();
    const result = await db.run(`DELETE FROM apps WHERE id = ?`, id);
    return (result.changes ?? 0) > 0;
  }

  async createBuild(appId: string, platform: Platform): Promise<Build> {
    const db = await getDatabase();
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    await db.run(
      `INSERT INTO builds (id, appId, status, platform, createdAt)
       VALUES (?, ?, 'building', ?, ?)`,
      id,
      appId,
      platform,
      createdAt,
    );

    const build = await this.getBuildById(id);
    if (!build) {
      throw new Error('Failed to read created build');
    }

    return build;
  }

  async updateBuild(id: string, patch: Partial<Build>): Promise<Build | null> {
    const current = await this.getBuildById(id);
    if (!current) {
      return null;
    }

    const db = await getDatabase();
    const updated: Build = {
      ...current,
      ...patch,
      id: current.id,
      appId: current.appId,
      platform: current.platform,
      createdAt: current.createdAt,
    };

    await db.run(
      `UPDATE builds
       SET status = ?, downloadUrl = ?, error = ?, completedAt = ?
       WHERE id = ?`,
      updated.status,
      updated.downloadUrl ?? null,
      updated.error ?? null,
      updated.completedAt ?? null,
      id,
    );

    return updated;
  }

  async getBuildById(id: string): Promise<Build | null> {
    const db = await getDatabase();
    const row = await db.get<PersistedBuildRow>(`SELECT * FROM builds WHERE id = ?`, id);
    return row ? mapBuildRow(row) : null;
  }

  async getBuildsForApp(appId: string): Promise<Build[]> {
    const db = await getDatabase();
    const rows = await db.all<PersistedBuildRow[]>(
      `SELECT * FROM builds WHERE appId = ? ORDER BY datetime(createdAt) DESC`,
      appId,
    );

    return rows.map(mapBuildRow);
  }

  async getActiveBuildForApp(appId: string): Promise<Build | null> {
    const db = await getDatabase();
    const row = await db.get<PersistedBuildRow>(
      `SELECT * FROM builds WHERE appId = ? AND status = 'building' ORDER BY datetime(createdAt) DESC LIMIT 1`,
      appId,
    );

    return row ? mapBuildRow(row) : null;
  }

  async addBuildLog(buildId: string, level: BuildLog['level'], message: string, details?: string): Promise<BuildLog> {
    const db = await getDatabase();
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    await db.run(
      `INSERT INTO build_logs (id, buildId, level, message, details, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      id,
      buildId,
      level,
      message,
      details ?? null,
      createdAt,
    );

    return {
      id,
      buildId,
      level,
      message,
      details,
      createdAt,
    };
  }

  async getBuildLogs(buildId: string): Promise<BuildLog[]> {
    const db = await getDatabase();
    const rows = await db.all<PersistedBuildLogRow[]>(
      `SELECT * FROM build_logs WHERE buildId = ? ORDER BY datetime(createdAt) ASC`,
      buildId,
    );

    return rows.map(mapBuildLogRow);
  }

  async addSource(appId: string, sourceType: SourceType, sourceUrl: string, metadata?: AppSource['metadata']): Promise<AppSource> {
    const db = await getDatabase();
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    await db.run(
      `INSERT INTO app_sources (id, appId, sourceType, sourceUrl, metadata, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      id,
      appId,
      sourceType,
      sourceUrl,
      metadata ? JSON.stringify(metadata) : null,
      createdAt,
    );

    return {
      id,
      appId,
      sourceType,
      sourceUrl,
      metadata,
      createdAt,
    };
  }

  async getSourcesForApp(appId: string): Promise<AppSource[]> {
    const db = await getDatabase();
    const rows = await db.all<PersistedSourceRow[]>(
      `SELECT * FROM app_sources WHERE appId = ? ORDER BY datetime(createdAt) ASC`,
      appId,
    );

    return rows.map(mapSourceRow);
  }
}
