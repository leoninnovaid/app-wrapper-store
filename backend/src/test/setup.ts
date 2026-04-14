import fs from 'fs';
import os from 'os';
import path from 'path';

process.env.NODE_ENV = 'test';

const testDbDirectory = path.resolve(os.tmpdir(), 'app-wrapper-store-tests');
const testDbFilename = `test-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}.sqlite`;
const testDbPath = path.join(testDbDirectory, testDbFilename);

process.env.SQLITE_PATH = testDbPath;
fs.mkdirSync(testDbDirectory, { recursive: true });

for (const suffix of ['', '-wal', '-shm']) {
  const candidate = `${testDbPath}${suffix}`;
  if (fs.existsSync(candidate)) {
    fs.rmSync(candidate, { force: true });
  }
}

process.on('exit', () => {
  for (const suffix of ['', '-wal', '-shm']) {
    const candidate = `${testDbPath}${suffix}`;
    if (fs.existsSync(candidate)) {
      fs.rmSync(candidate, { force: true });
    }
  }
});
