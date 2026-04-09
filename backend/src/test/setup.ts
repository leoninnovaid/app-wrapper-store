import fs from 'fs';
import path from 'path';

process.env.NODE_ENV = 'test';
process.env.SQLITE_PATH = path.resolve(process.cwd(), 'data', 'test.sqlite');

if (fs.existsSync(process.env.SQLITE_PATH)) {
  fs.rmSync(process.env.SQLITE_PATH, { force: true });
}
