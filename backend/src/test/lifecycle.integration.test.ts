import { spawnSync } from 'child_process';
import path from 'path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import app from '../index';
import { getSourceAdapter } from '../services/source-registry';

async function waitForBuildCompletion(buildId: string): Promise<request.Response> {
  let lastResponse: request.Response | null = null;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    lastResponse = await request(app).get(`/api/builds/${buildId}`);
    if (lastResponse.body.status === 'completed') {
      return lastResponse;
    }

    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  throw new Error(`Build ${buildId} did not complete. Last status: ${lastResponse?.body?.status ?? 'unknown'}`);
}

describe('Lifecycle smoke flow', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('covers app creation through wrapper validation', async () => {
    const customAdapter = getSourceAdapter('custom');

    vi.spyOn(customAdapter, 'validate').mockResolvedValue({
      valid: true,
      sourceType: 'custom',
      normalizedUrl: 'https://updates.example.com/manifest.json',
    });

    vi.spyOn(customAdapter, 'fetchMetadata').mockResolvedValue({
      title: 'Lifecycle Source',
      description: 'Lifecycle test source',
      homepage: 'https://updates.example.com',
    });

    vi.spyOn(customAdapter, 'listReleases').mockResolvedValue([
      {
        version: 'v2.4.0',
        tag: 'v2.4.0',
        publishedAt: '2026-04-24T00:00:00.000Z',
        artifacts: [
          {
            name: 'lifecycle-v2.4.0.apk',
            type: 'apk',
            platform: 'android',
            url: 'https://updates.example.com/lifecycle-v2.4.0.apk',
            size: 2048,
            checksum: 'abcdef12',
            integrity: {
              algorithm: 'sha256',
              value: 'abcdef12',
              source: 'custom-manifest',
            },
            verificationStatus: 'unverified',
          },
        ],
      },
    ]);

    const createResponse = await request(app).post('/api/apps').send({
      name: 'Lifecycle App',
      description: 'E2E lifecycle smoke coverage',
      url: 'https://example.com',
      features: {
        packaging: {
          strategy: 'webview',
          distribution: 'local-sideload',
          preferredArtifact: 'apk',
          readiness: {
            httpsEnabled: true,
            signingKeyReady: true,
          },
        },
      },
    });

    expect(createResponse.status).toBe(201);
    const appId = createResponse.body.id as string;

    const attachResponse = await request(app).post(`/api/apps/${appId}/sources`).send({
      sourceType: 'custom',
      sourceUrl: 'https://updates.example.com/manifest.json',
    });
    expect(attachResponse.status).toBe(201);

    const updateResponse = await request(app).post(`/api/apps/${appId}/updates/check`).send({ platform: 'android' });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toMatchObject({
      appId,
      status: 'update_available',
      artifact: {
        name: 'lifecycle-v2.4.0.apk',
        verificationStatus: 'verified',
      },
    });

    const buildResponse = await request(app).post(`/api/apps/${appId}/build`).send({ platform: 'android' });
    expect(buildResponse.status).toBe(201);

    const completedBuildResponse = await waitForBuildCompletion(buildResponse.body.id as string);
    expect(completedBuildResponse.body).toMatchObject({
      appId,
      status: 'completed',
    });

    const buildsResponse = await request(app).get(`/api/apps/${appId}/builds`);
    expect(buildsResponse.status).toBe(200);
    expect(buildsResponse.body[0]).toMatchObject({
      id: buildResponse.body.id,
      status: 'completed',
    });

    const logsResponse = await request(app).get(`/api/builds/${buildResponse.body.id}/logs`);
    expect(logsResponse.status).toBe(200);
    expect(logsResponse.body.map((entry: { message: string }) => entry.message)).toEqual([
      'Build job started',
      'Build job finished',
    ]);

    const validateScript = path.resolve(process.cwd(), '../wrapper-template/scripts/validate-wrapper.mjs');
    const validateResult = spawnSync('node', [validateScript, '--platform', 'android'], {
      encoding: 'utf-8',
      env: {
        ...process.env,
        EXPO_PUBLIC_APP_URL: 'https://example.com',
        EXPO_PUBLIC_APP_NAME: 'Lifecycle App',
        EXPO_PUBLIC_APP_SLUG: 'lifecycle-app',
        EXPO_PUBLIC_PRIMARY_COLOR: '#10a37f',
        EXPO_PUBLIC_ACCENT_COLOR: '#ffffff',
        EXPO_PUBLIC_ENABLE_WRAPPER_DEBUG: 'true',
        EXPO_PUBLIC_DEBUG_ENDPOINT: 'https://debug.example.com',
      },
    });

    expect(validateResult.status).toBe(0);
    expect(validateResult.stdout).toContain('PASS  App URL is set');
    expect(validateResult.stdout).toContain('[android] Suggested validation flow');
  });
});
