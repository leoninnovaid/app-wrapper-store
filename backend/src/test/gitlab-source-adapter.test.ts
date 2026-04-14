import { describe, expect, it, vi } from 'vitest';
import { GitLabSourceAdapter } from '../adapters/gitlab-source-adapter';
import { SourceRelease } from '../types/domain';

function mockClientGet(adapter: GitLabSourceAdapter, impl: (url: string) => Promise<unknown>) {
  const client = adapter as unknown as { client: { get: (url: string) => Promise<unknown> } };
  return vi.spyOn(client.client, 'get').mockImplementation((url: string) => impl(url));
}

describe('GitLabSourceAdapter', () => {
  it('validates and normalizes nested GitLab project URLs', async () => {
    const adapter = new GitLabSourceAdapter();
    const getSpy = mockClientGet(adapter, async () => ({ data: { path_with_namespace: 'group/subgroup/app' } }));

    const result = await adapter.validate('https://gitlab.com/group/subgroup/app');

    expect(result).toMatchObject({
      valid: true,
      sourceType: 'gitlab',
      normalizedUrl: 'https://gitlab.com/group/subgroup/app',
    });
    expect(getSpy).toHaveBeenCalledWith('https://gitlab.com/api/v4/projects/group%2Fsubgroup%2Fapp');
  });

  it('maps GitLab release links into normalized artifacts', async () => {
    const adapter = new GitLabSourceAdapter();
    mockClientGet(adapter, async () => ({
      data: [
        {
          tag_name: 'v2.0.0',
          description: 'Release notes',
          released_at: '2026-04-14T00:00:00.000Z',
          assets: {
            links: [
              {
                name: 'mobile-v2.0.0.aab',
                url: 'https://gitlab.com/example/mobile-v2.0.0.aab',
              },
            ],
          },
        },
      ],
    }));

    const releases = await adapter.listReleases('https://gitlab.com/group/subgroup/app');

    expect(releases).toHaveLength(1);
    expect(releases[0]).toMatchObject({
      version: 'v2.0.0',
      tag: 'v2.0.0',
      artifacts: [
        {
          name: 'mobile-v2.0.0.aab',
          type: 'aab',
          platform: 'android',
          verificationStatus: 'unverified',
        },
      ],
    });
  });

  it('blocks play-store verification when GitLab artifact is APK-only', async () => {
    const adapter = new GitLabSourceAdapter();
    const release: SourceRelease = {
      version: 'v2.0.0',
      tag: 'v2.0.0',
      publishedAt: '2026-04-14T00:00:00.000Z',
      artifacts: [],
    };
    const artifact = {
      name: 'mobile-v2.0.0.apk',
      type: 'apk' as const,
      platform: 'android' as const,
      url: 'https://gitlab.com/example/mobile-v2.0.0.apk',
      size: 12,
      verificationStatus: 'unverified' as const,
    };

    const result = await adapter.verifyArtifact(release, artifact, {
      platform: 'android',
      distribution: 'play-store',
      preferredArtifact: 'aab',
    });

    expect(result.status).toBe('blocked');
    expect(String(result.reason)).toContain('distribution policy requirements');
  });
});
