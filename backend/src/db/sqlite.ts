import fs from 'fs/promises';
import path from 'path';
import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import { logger } from '../utils/logger';

let dbInstance: Database<sqlite3.Database, sqlite3.Statement> | null = null;

async function ensureDataDirectory(dbFilePath: string): Promise<void> {
  const directory = path.dirname(dbFilePath);
  await fs.mkdir(directory, { recursive: true });
}

export async function getDatabase(): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = process.env.SQLITE_PATH ?? path.resolve(process.cwd(), 'data', 'app-wrapper-store.sqlite');
  await ensureDataDirectory(dbPath);

  const database = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await database.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS apps (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      url TEXT NOT NULL,
      icon TEXT,
      theme TEXT,
      features TEXT,
      currentVersion TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS builds (
      id TEXT PRIMARY KEY,
      appId TEXT NOT NULL,
      status TEXT NOT NULL,
      platform TEXT NOT NULL,
      downloadUrl TEXT,
      error TEXT,
      createdAt TEXT NOT NULL,
      completedAt TEXT,
      FOREIGN KEY(appId) REFERENCES apps(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS build_logs (
      id TEXT PRIMARY KEY,
      buildId TEXT NOT NULL,
      level TEXT NOT NULL,
      message TEXT NOT NULL,
      details TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(buildId) REFERENCES builds(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS app_sources (
      id TEXT PRIMARY KEY,
      appId TEXT NOT NULL,
      sourceType TEXT NOT NULL,
      sourceUrl TEXT NOT NULL,
      metadata TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(appId) REFERENCES apps(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_builds_appId ON builds(appId);
    CREATE INDEX IF NOT EXISTS idx_build_logs_buildId ON build_logs(buildId);
    CREATE INDEX IF NOT EXISTS idx_app_sources_appId ON app_sources(appId);
  `);

  dbInstance = database;
  logger.info('SQLite initialized', { dbPath });

  return dbInstance;
}
