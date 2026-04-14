import { afterEach, vi } from 'vitest';
import request from 'supertest';
import { getSourceAdapter } from '../services/source-registry';
import app from '../index';

describe('Backend API contracts', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns standardized validation error payload', async () => {
    const response = await request(app).post('/api/apps').send({ name: 'Only Name' });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      code: 'VALIDATION_ERROR',
    });
    expect(typeof response.body.message).toBe('string');
    expect(typeof response.body.traceId).toBe('string');
  });

  it('creates an app and returns it from list endpoint', async () => {
    const createResponse = await request(app).post('/api/apps').send({
      name: 'Test App',
      description: 'Integration test app',
      url: 'https://example.com',
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.id).toBeDefined();

    const listResponse = await request(app).get('/api/apps');
    expect(listResponse.status).toBe(200);
    expect(Array.isArray(listResponse.body)).toBe(true);
    expect(listResponse.body.length).toBeGreaterThan(0);
  });

  it('returns blocked update result when app has no sources', async () => {
    const createResponse = await request(app).post('/api/apps').send({
      name: 'No Source App',
      description: 'No source configured',
      url: 'https://example.org',
    });

    const appId = createResponse.body.id as string;

    const updatesResponse = await request(app).get(`/api/apps/${appId}/updates?platform=android`);
    expect(updatesResponse.status).toBe(200);
    expect(updatesResponse.body).toMatchObject({
      appId,
      status: 'blocked',
    });
    expect(typeof updatesResponse.body.reason).toBe('string');
  });

  it('validates source URL format and returns standardized error payload', async () => {
    const response = await request(app).post('/api/sources/validate').send({ sourceType: 'github', sourceUrl: 'not-a-url' });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      code: 'VALIDATION_ERROR',
    });
    expect(typeof response.body.traceId).toBe('string');
  });

  it('blocks build when critical APK readiness requirements are missing', async () => {
    const createResponse = await request(app).post('/api/apps').send({
      name: 'Blocked Build App',
      description: 'Build should be blocked due to missing readiness',
      url: 'https://example.com',
      features: {
        packaging: {
          strategy: 'twa',
          distribution: 'play-store',
          preferredArtifact: 'apk',
          readiness: {
            httpsEnabled: false,
            validWebManifest: false,
            digitalAssetLinksReady: false,
            signingKeyReady: false,
            targetApiCompliant: false,
          },
        },
      },
    });

    const appId = createResponse.body.id as string;

    const buildResponse = await request(app).post(`/api/apps/${appId}/build`).send({ platform: 'android' });
    expect(buildResponse.status).toBe(400);
    expect(buildResponse.body).toMatchObject({
      code: 'APK_READINESS_FAILED',
    });
    expect(Array.isArray(buildResponse.body.details?.missingRequirements)).toBe(true);
  });

  it('starts build when required APK readiness requirements are met', async () => {
    const createResponse = await request(app).post('/api/apps').send({
      name: 'Ready Build App',
      description: 'Build should start',
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

    const appId = createResponse.body.id as string;

    const buildResponse = await request(app).post(`/api/apps/${appId}/build`).send({ platform: 'android' });
    expect(buildResponse.status).toBe(201);
    expect(buildResponse.body).toMatchObject({
      appId,
      status: 'building',
      platform: 'android',
    });
  });

  it('rejects starting a second build while one is already running', async () => {
    const createResponse = await request(app).post('/api/apps').send({
      name: 'Concurrency Guard App',
      description: 'Prevent overlapping builds',
      url: 'https://example.net',
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

    const appId = createResponse.body.id as string;
    const firstBuild = await request(app).post(`/api/apps/${appId}/build`).send({ platform: 'android' });
    expect(firstBuild.status).toBe(201);

    const secondBuild = await request(app).post(`/api/apps/${appId}/build`).send({ platform: 'android' });
    expect(secondBuild.status).toBe(409);
    expect(secondBuild.body).toMatchObject({
      code: 'CONFLICT',
      details: {
        appId,
      },
    });
  });

  it('rejects app names longer than guardrail limit', async () => {
    const response = await request(app).post('/api/apps').send({
      name: 'x'.repeat(121),
      description: 'Too long name should fail',
      url: 'https://example.com',
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      code: 'VALIDATION_ERROR',
    });
    expect(String(response.body.message)).toContain('at most 120');
  });

  it('returns integrity and trustSignals in update payload artifact', async () => {
    const customAdapter = getSourceAdapter('custom');

    vi.spyOn(customAdapter, 'validate').mockResolvedValue({
      valid: true,
      sourceType: 'custom',
      normalizedUrl: 'https://updates.example.com/manifest.json',
    });

    vi.spyOn(customAdapter, 'fetchMetadata').mockResolvedValue({
      title: 'Custom Updates',
      description: 'Integration-test custom source',
      homepage: 'https://updates.example.com',
    });

    vi.spyOn(customAdapter, 'listReleases').mockResolvedValue([
      {
        version: 'v1.2.3',
        tag: 'v1.2.3',
        publishedAt: '2026-04-14T00:00:00.000Z',
        artifacts: [
          {
            name: 'app-v1.2.3.apk',
            type: 'apk',
            platform: 'android',
            url: 'https://updates.example.com/app-v1.2.3.apk',
            size: 1200,
            checksum: 'abc123',
            integrity: {
              algorithm: 'sha256',
              value: 'abc123',
              source: 'custom-manifest',
            },
            verificationStatus: 'unverified',
          },
        ],
      },
    ]);

    const createResponse = await request(app).post('/api/apps').send({
      name: 'Trust Field App',
      description: 'Update payload trust fields integration test',
      url: 'https://example.com',
    });
    const appId = createResponse.body.id as string;

    const attachResponse = await request(app).post(`/api/apps/${appId}/sources`).send({
      sourceType: 'custom',
      sourceUrl: 'https://updates.example.com/manifest.json',
    });
    expect(attachResponse.status).toBe(201);

    const updatesResponse = await request(app).get(`/api/apps/${appId}/updates?platform=android`);

    expect(updatesResponse.status).toBe(200);
    expect(updatesResponse.body).toMatchObject({
      appId,
      status: 'update_available',
      artifact: {
        verificationStatus: 'verified',
        integrity: {
          algorithm: 'sha256',
          value: 'abc123',
          source: 'custom-manifest',
        },
      },
    });

    expect(updatesResponse.body.artifact?.trustSignals).toMatchObject({
      installable: true,
      checksumPresent: true,
      sourceMetadataCoherent: true,
      policyCompatible: true,
    });
  });
});
