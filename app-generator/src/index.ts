import { exec } from 'child_process';
import { randomUUID } from 'crypto';

type Platform = 'android' | 'ios';

interface BuildJob {
  id: string;
  platform: Platform;
  command: string;
  createdAt: string;
}

class BuildQueue {
  private queue: BuildJob[] = [];
  private isProcessing = false;

  async enqueue(job: BuildJob): Promise<void> {
    this.queue.push(job);

    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift();
      if (!job) {
        continue;
      }

      console.log(`[${job.id}] Starting ${job.platform} build`);
      console.log(`[${job.id}] Command: ${job.command}`);

      try {
        const output = await executeCommand(job.command);
        if (output.trim()) {
          console.log(`[${job.id}] Output:\n${output}`);
        }
        console.log(`[${job.id}] Build completed successfully`);
      } catch (error) {
        console.error(`[${job.id}] Build failed`, error);
      }
    }

    this.isProcessing = false;
  }
}

function executeCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, { env: process.env }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
        return;
      }

      resolve(stdout || '');
    });
  });
}

function isPlatform(value: string): value is Platform {
  return value === 'android' || value === 'ios';
}

function defaultBuildCommand(platform: Platform): string {
  return platform === 'android'
    ? 'npx expo export --platform android'
    : 'npx expo export --platform ios';
}

function printUsage(): void {
  console.log('Usage: npm run dev -- <android|ios> [custom command]');
  console.log('Example: npm run dev -- android "npx expo export --platform android"');
}

async function main(): Promise<void> {
  const [platformArg, ...customCommandParts] = process.argv.slice(2);

  if (!platformArg) {
    printUsage();
    return;
  }

  if (!isPlatform(platformArg)) {
    console.error(`Invalid platform: ${platformArg}`);
    printUsage();
    process.exitCode = 1;
    return;
  }

  const command =
    customCommandParts.length > 0 ? customCommandParts.join(' ').trim() : defaultBuildCommand(platformArg);

  const queue = new BuildQueue();
  const job: BuildJob = {
    id: randomUUID(),
    platform: platformArg,
    command,
    createdAt: new Date().toISOString(),
  };

  console.log(`[${job.id}] Enqueued at ${job.createdAt}`);
  await queue.enqueue(job);
}

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception', error);
  process.exitCode = 1;
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection', reason);
  process.exitCode = 1;
});

void main();
