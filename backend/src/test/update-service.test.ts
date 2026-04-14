import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getSourceAdapter } from '../services/source-registry';
import { checkForUpdates } from '../services/update-service';
import { AppConfig, AppSource, ReleaseArtifact, SourceRelease } from '../types/domain';

const appBase: AppConfig = {
  id: 'app-1',
  name: 'Example',
  description: 'Example app',
  url: 'https://example.com',
  createdAt: '2026-04-09T00:00:00.000Z',
  updatedAt: '2026-04-09T00:00:00.000Z',
};

const githubSource: AppSource = {
  id: 'source-1',
  appId: 'app-1',
  sourceType: 'github',
  sourceUrl: 'https://github.com/example/app',
  createdAt: '2026-04-09T00:00:00.000Z',
};

function buildRelease(artifact: ReleaseArtifact): SourceRelease {
  return {
    version: 'v1.2.3',
    tag: 'v1.2.3',
    publishedAt: '2026-04-10T00:00:00.000Z',
    artifacts: [artifact],
  };
}

describe('checkForUpdates', () => {
  const githubAdapter = getSourceAdapter('github');

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns verified update when trust signals are complete', async () => {
    vi.spyOn(githubAdapter, 'listReleases').mockResolvedValue([
      buildRelease({
        name: 'example-v1.2.3.apk',
        type: 'apk',
        platform: 'android',
        url: 'https://example.com/example-v1.2.3.apk',
        size: 42,
        checksum: 'abc123',
        verificationStatus: 'unverified',
      }),
    ]);

    const result = await checkForUpdates(appBase, [githubSource], 'android');

    expect(result.status).toBe('update_available');
    expect(result.artifact).toMatchObject({
      verificationStatus: 'verified',
      trustSignals: {
        checksumPresent: true,
        sourceMetadataCoherent: true,
        policyCompatible: true,
      },
    });
  });

  it('returns unverified update when checksum metadata is missing', async () => {
    vi.spyOn(githubAdapter, 'listReleases').mockResolvedValue([
      buildRelease({
        name: 'example-v1.2.3.apk',
        type: 'apk',
        platform: 'android',
        url: 'https://example.com/example-v1.2.3.apk',
        size: 42,
        verificationStatus: 'unverified',
      }),
    ]);

    const result = await checkForUpdates(appBase, [githubSource], 'android');

    expect(result.status).toBe('update_available');
    expect(result.artifact?.verificationStatus).toBe('unverified');
    expect(String(result.artifact?.reason)).toContain('No checksum metadata');
  });

  it('blocks play-store updates when only APK artifacts are available', async () => {
    vi.spyOn(githubAdapter, 'listReleases').mockResolvedValue([
      buildRelease({
        name: 'example-v1.2.3.apk',
        type: 'apk',
        platform: 'android',
        url: 'https://example.com/example-v1.2.3.apk',
        size: 42,
        checksum: 'abc123',
        verificationStatus: 'unverified',
      }),
    ]);

    const playStoreApp: AppConfig = {
      ...appBase,
      features: {
        packaging: {
          distribution: 'play-store',
          preferredArtifact: 'aab',
        },
      },
    };

    const result = await checkForUpdates(playStoreApp, [githubSource], 'android');

    expect(result).toMatchObject({
      appId: playStoreApp.id,
      status: 'blocked',
    });
    expect(String(result.reason)).toContain('distribution policy requirements');
  });

  it('falls back to AAB when a play-store release also contains a blocked APK', async () => {
    vi.spyOn(githubAdapter, 'listReleases').mockResolvedValue([
      {
        version: 'v1.2.3',
        tag: 'v1.2.3',
        publishedAt: '2026-04-10T00:00:00.000Z',
        artifacts: [
          {
            name: 'example-v1.2.3.apk',
            type: 'apk',
            platform: 'android',
            url: 'https://example.com/example-v1.2.3.apk',
            size: 42,
            checksum: 'apk123',
            verificationStatus: 'unverified',
          },
          {
            name: 'example-v1.2.3.aab',
            type: 'aab',
            platform: 'android',
            url: 'https://example.com/example-v1.2.3.aab',
            size: 43,
            checksum: 'aab123',
            verificationStatus: 'unverified',
          },
        ],
      },
    ]);

    const playStoreApp: AppConfig = {
      ...appBase,
      features: {
        packaging: {
          distribution: 'play-store',
          preferredArtifact: 'aab',
        },
      },
    };

    const result = await checkForUpdates(playStoreApp, [githubSource], 'android');

    expect(result.status).toBe('update_available');
    expect(result.artifact).toMatchObject({
      type: 'aab',
      verificationStatus: 'verified',
    });
  });
});
