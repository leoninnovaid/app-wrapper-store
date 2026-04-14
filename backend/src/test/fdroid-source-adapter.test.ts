import { describe, expect, it, vi } from 'vitest';
import { FdroidSourceAdapter } from '../adapters/fdroid-source-adapter';

function mockClientGet(adapter: FdroidSourceAdapter, impl: (url: string) => Promise<unknown>) {
  const client = adapter as unknown as { client: { get: (url: string) => Promise<unknown> } };
  return vi.spyOn(client.client, 'get').mockImplementation((url: string) => impl(url));
}

describe('FdroidSourceAdapter', () => {
  it('validates when index-v1.json can be fetched', async () => {
    const adapter = new FdroidSourceAdapter();
    mockClientGet(adapter, async () => ({ data: { repo: { name: 'F-Droid Repo' }, packages: {} } }));

    const result = await adapter.validate('https://f-droid.org/repo');

    expect(result).toMatchObject({
      valid: true,
      sourceType: 'fdroid',
      normalizedUrl: 'https://f-droid.org/repo',
    });
  });

  it('maps index package entries into Android releases with checksum integrity', async () => {
    const adapter = new FdroidSourceAdapter();
    mockClientGet(adapter, async () => ({
      data: {
        repo: {
          name: 'F-Droid Repo',
          address: 'https://f-droid.org/repo',
        },
        packages: {
          'org.example.app': [
            {
              packageName: 'org.example.app',
              versionName: '1.2.3',
              versionCode: 123,
              added: 1713033600,
              apkName: 'org.example.app_123.apk',
              hash: 'abc123',
            },
          ],
        },
      },
    }));

    const releases = await adapter.listReleases('https://f-droid.org');
    expect(releases).toHaveLength(1);
    expect(releases[0]).toMatchObject({
      version: '1.2.3',
      tag: '1.2.3',
      artifacts: [
        {
          name: 'org.example.app_123.apk',
          type: 'apk',
          platform: 'android',
          checksum: 'abc123',
          integrity: {
            algorithm: 'sha256',
            value: 'abc123',
          },
        },
      ],
    });
  });
});
