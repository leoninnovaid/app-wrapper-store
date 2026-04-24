import { describe, expect, it, vi } from 'vitest';
import { CustomSourceAdapter } from '../adapters/custom-source-adapter';

function mockClientGet(adapter: CustomSourceAdapter, impl: (url: string) => Promise<unknown>) {
  const client = adapter as unknown as { client: { get: (url: string) => Promise<unknown> } };
  return vi.spyOn(client.client, 'get').mockImplementation((url: string) => impl(url));
}

describe('CustomSourceAdapter', () => {
  it('validates manifest URLs that expose a releases array', async () => {
    const adapter = new CustomSourceAdapter();
    mockClientGet(adapter, async () => ({
      data: {
        title: 'Example Custom Source',
        releases: [],
      },
    }));

    const result = await adapter.validate('https://cdn.example.com/releases.json');
    expect(result).toMatchObject({
      valid: true,
      sourceType: 'custom',
      normalizedUrl: 'https://cdn.example.com/releases.json',
    });
  });

  it('maps manifest artifacts and infers type/platform/checksum data', async () => {
    const adapter = new CustomSourceAdapter();
    mockClientGet(adapter, async () => ({
      data: {
        title: 'Example Custom Source',
        releases: [
          {
            version: 'v3.0.0',
            publishedAt: '2026-04-14T00:00:00Z',
            artifacts: [
              {
                name: 'example-v3.0.0.aab',
                url: 'https://cdn.example.com/example-v3.0.0.aab',
                size: 88,
                integrity: {
                  algorithm: 'sha256',
                  value: 'aabhash',
                },
              },
            ],
          },
        ],
      },
    }));

    const releases = await adapter.listReleases('https://cdn.example.com/releases.json');
    expect(releases).toHaveLength(1);
    expect(releases[0]).toMatchObject({
      version: 'v3.0.0',
      tag: 'v3.0.0',
      artifacts: [
        {
          name: 'example-v3.0.0.aab',
          type: 'aab',
          platform: 'android',
          checksum: 'aabhash',
          integrity: {
            algorithm: 'sha256',
            value: 'aabhash',
            source: 'custom-manifest',
          },
        },
      ],
    });
  });

  it('normalizes invalid publishedAt values and rejects malformed checksum metadata', async () => {
    const adapter = new CustomSourceAdapter();
    mockClientGet(adapter, async () => ({
      data: {
        title: 'Example Custom Source',
        releases: [
          {
            version: 'v3.0.0',
            publishedAt: 'definitely-not-a-date',
            artifacts: [
              {
                name: 'example-v3.0.0.apk',
                url: 'https://cdn.example.com/example-v3.0.0.apk',
                checksum: 'sha256:',
              },
            ],
          },
        ],
      },
    }));

    const releases = await adapter.listReleases('https://cdn.example.com/releases.json');
    expect(releases[0].publishedAt).toBe(new Date(0).toISOString());
    expect(releases[0].artifacts[0]).toMatchObject({
      checksum: undefined,
      integrity: undefined,
      reason: 'No valid checksum provided by source',
    });
  });
});
