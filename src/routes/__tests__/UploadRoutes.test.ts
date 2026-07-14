import express from 'express';
import request from 'supertest';
import fs from 'fs/promises';
import path from 'path';
import { createUploadRoutes } from '../upload';

describe('upload routes', () => {
  const fixtureDir = path.join('/tmp', 'upload-service-route-tests');
  const fixturePath = path.join(fixtureDir, 'pixel.png');

  beforeAll(async () => {
    await fs.mkdir(fixtureDir, { recursive: true });
    await fs.writeFile(fixturePath, Buffer.from('not-a-real-image'));
  });

  beforeEach(async () => {
    await fs.mkdir(path.join(process.cwd(), 'tmp'), { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(path.join(process.cwd(), 'tmp'), { recursive: true, force: true });
  });

  afterAll(async () => {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  });

  function buildApp() {
    const app = express();
    app.use(express.json());
    app.use(createUploadRoutes({
      processUploadUseCase: {
        execute: jest.fn().mockResolvedValue('correlation-1'),
      } as any,
      getUploadStatusUseCase: {
        execute: jest.fn().mockResolvedValue({
          correlationId: 'correlation-1',
          status: 'SAVED',
          fileUrl: 'http://localhost/uploads/app/correlation-1.webp',
        }),
      } as any,
      storageProvider: {
        deleteFile: jest.fn().mockResolvedValue(undefined),
        moveToFinalDestination: jest.fn(),
        saveBufferToFinalDestination: jest.fn(),
      },
    }));
    return app;
  }

  it('accepts v1 upload requests', async () => {
    const app = buildApp();

    const response = await request(app)
      .post('/api/v1/uploads')
      .field('application', 'pense-e-aja')
      .attach('file', fixturePath);

    expect(response.status).toBe(202);
    expect(response.body).toMatchObject({ correlationId: 'correlation-1', status: 'QUEUED' });
  });

  it('keeps deprecated /upload alias with deprecation header', async () => {
    const app = buildApp();

    const response = await request(app)
      .post('/upload')
      .field('applicationFolderName', 'pense-e-aja')
      .attach('file', fixturePath);

    expect(response.status).toBe(202);
    expect(response.headers.deprecation).toBe('true');
  });

  it('returns upload status by correlationId', async () => {
    const app = buildApp();

    const response = await request(app).get('/api/v1/uploads/correlation-1');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      correlationId: 'correlation-1',
      status: 'SAVED',
      fileUrl: 'http://localhost/uploads/app/correlation-1.webp',
    });
  });
});
