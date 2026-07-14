import { Worker, Job } from 'bullmq';
import env from '../../config/env';
import Redis from 'ioredis';
import fs from 'fs/promises';
import sharp from 'sharp';
import { DocumentRepository } from '../database/repositories/DocumentRepository';
import { LocalDiskStorageProvider } from '../storage/LocalDiskStorageProvider';
import { ApplicationRepository } from '../database/repositories/ApplicationRepository';
import { logger } from '../../utils/logger';

export class BullMQWorker {
  private worker: Worker;
  private redisConnection: Redis;
  private documentRepo: DocumentRepository;
  private storageProvider: LocalDiskStorageProvider;
  private applicationRepo: ApplicationRepository;

  constructor() {
    const redisUrl = env.REDIS_URL || 'redis://localhost:6379';
    this.redisConnection = new Redis(redisUrl, { maxRetriesPerRequest: null });

    this.documentRepo = new DocumentRepository();
    this.storageProvider = new LocalDiskStorageProvider();
    this.applicationRepo = new ApplicationRepository();

    this.worker = new Worker('document_uploads', this.processJob.bind(this), {
      connection: this.redisConnection as any
    });

    this.worker.on('completed', (job) => {
      logger.info({ jobId: job.id }, '[Worker] Job completed successfully.');
    });

    this.worker.on('failed', (job, err) => {
      logger.error({ jobId: job?.id, error: err.message }, '[Worker] Job failed with error');
    });
  }

  private async processJob(job: Job): Promise<void> {
    const { correlationId, tempFilePath } = job.data;
    logger.info({ correlationId }, '[Worker] Processing upload job');

    const document = await this.documentRepo.findByCorrelationId(correlationId);
    if (!document) {
      throw new Error(`Document with correlationId ${correlationId} not found in database.`);
    }

    const application = await this.applicationRepo.findById(document.applicationId);
    if (!application) {
      throw new Error(`Application ${document.applicationId} not found.`);
    }

    try {
      await this.documentRepo.updateStatus(document.id, 'COMPACTING');

      const compressedBuffer = await sharp(tempFilePath)
        .rotate()
        .resize({
          width: parsePositiveInteger(env.IMAGE_MAX_WIDTH),
          height: parsePositiveInteger(env.IMAGE_MAX_HEIGHT),
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: parseWebpQuality(env.IMAGE_WEBP_QUALITY) })
        .toBuffer();

      const { filePath, fileUrl } = await this.storageProvider.saveBufferToFinalDestination(
        compressedBuffer,
        application.folderName,
        document.fileName
      );

      await this.documentRepo.updatePaths(document.id, filePath, fileUrl, 'image/webp');
      await this.documentRepo.updateStatus(document.id, 'SAVED');
      await this.storageProvider.deleteFile(tempFilePath);

      logger.info({ filePath }, '[Worker] Upload compressed and saved');
    } catch (error) {
      await this.documentRepo.updateStatus(document.id, 'FAILED');
      await this.safeDeleteTempFile(tempFilePath);
      throw error;
    }
  }

  private async safeDeleteTempFile(tempFilePath: string): Promise<void> {
    try {
      await fs.unlink(tempFilePath);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        logger.error({ err: error, tempFilePath }, '[Worker] Failed to remove temp file');
      }
    }
  }
}

function parsePositiveInteger(value: string): number | undefined {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function parseWebpQuality(value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return 80;
  }

  return Math.min(Math.max(parsed, 1), 100);
}
