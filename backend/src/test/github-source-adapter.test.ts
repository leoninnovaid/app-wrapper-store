import { describe, expect, it, vi } from 'vitest';
import { GitHubSourceAdapter } from '../adapters/github-source-adapter';

function mockClientGet(adapter: GitHubSourceAdapter, impl: (url: string) => Promise<unknown>) {
  const client = adapter as unknown as { client: { get: (url: string) => Promise<unknown> } };
  return vi.spyOn(client.client, 'get').mockImplementation((url: string) => impl(url));
}

describe('GitHubSourceAdapter', () => {
  it('normalizes malformed release timestamps to epoch for deterministic sorting', async () => {
    const adapter = new GitHubSourceAdapter();
    mockClientGet(adapter, async () => ({
      data: [
        {
          tag_name: 'v2.0.0',
          published_at: 'not-a-date',
          assets: [
            {
              name: 'example-v2.0.0.apk',
              browser_download_url: 'https://example.com/example-v2.0.0.apk',
              size: 10,
              digest: 'sha256:abc12345',
            },
          ],
        },
        {
          tag_name: 'v1.0.0',
          published_at: '2026-04-14T00:00:00.000Z',
          assets: [
            {
              name: 'example-v1.0.0.apk',
              browser_download_url: 'https://example.com/example-v1.0.0.apk',
              size: 9,
              digest: 'sha256:def67890',
            },
          ],
        },
      ],
    }));

    const releases = await adapter.listReleases('https://github.com/example/app');

    expect(releases[0].tag).toBe('v1.0.0');
    expect(releases[1].publishedAt).toBe(new Date(0).toISOString());
  });

  it('treats malformed digest strings as missing checksum metadata', async () => {
    const adapter = new GitHubSourceAdapter();
    mockClientGet(adapter, async () => ({
      data: [
        {
          tag_name: 'v2.0.0',
          published_at: '2026-04-14T00:00:00.000Z',
          assets: [
            {
              name: 'example-v2.0.0.apk',
              browser_download_url: 'https://example.com/example-v2.0.0.apk',
              size: 10,
              digest: 'sha256:',
            },
          ],
        },
      ],
    }));

    const releases = await adapter.listReleases('https://github.com/example/app');

    expect(releases[0].artifacts[0]).toMatchObject({
      checksum: undefined,
      integrity: undefined,
      reason: 'No valid checksum provided by source',
    });
  });
});
