import { Queue } from 'bullmq';
import { IQueueProvider } from '../../domain/contracts/IQueueProvider';
import env from '../../config/env';
import Redis from 'ioredis';

export class BullMQQueueProvider implements IQueueProvider {
  private uploadQueue: Queue;
  private redisConnection: Redis;

  constructor() {
    const redisUrl = env.REDIS_URL || 'redis://localhost:6379';
    this.redisConnection = new Redis(redisUrl, { maxRetriesPerRequest: null });
    
    this.uploadQueue = new Queue('document_uploads', { connection: this.redisConnection as any });
  }

  async publishUploadJob(correlationId: string, payload?: any): Promise<void> {
    await this.uploadQueue.add('process_upload', {
      correlationId,
      ...payload
    }, {
      jobId: correlationId,
      removeOnComplete: true,
      removeOnFail: false
    });
  }
}
