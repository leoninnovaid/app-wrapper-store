import request from 'supertest';
import app from '../index';

describe('Backend API contracts', () => {
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
    const response = await request(app)
      .post('/api/sources/validate')
      .send({ sourceType: 'github', sourceUrl: 'not-a-url' });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      code: 'VALIDATION_ERROR',
    });
    expect(typeof response.body.traceId).toBe('string');
  });
});
