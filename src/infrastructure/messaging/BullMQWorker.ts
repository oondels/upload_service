import { Worker, Job } from 'bullmq';
import env from '../../config/env';
import Redis from 'ioredis';
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
      logger.info({ jobId: job.id }, `[Worker] Job completed successfully.`);
    });

    this.worker.on('failed', (job, err) => {
      logger.error({ jobId: job?.id, error: err.message }, `[Worker] Job failed with error`);
    });
  }

  private async processJob(job: Job): Promise<void> {
    const { correlationId, tempFilePath } = job.data;
    logger.info({ correlationId }, `[Worker] Processing upload job`);

    const document = await this.documentRepo.findByCorrelationId(correlationId);
    if (!document) {
      throw new Error(`Document with correlationId ${correlationId} not found in database.`);
    }

    const application = await this.applicationRepo.findById(document.applicationId);
    if (!application) {
      throw new Error(`Application ${document.applicationId} not found.`);
    }

    try {
      // Move o arquivo da pasta temporária para o destino final (Storage de Disco)
      const { filePath, fileUrl } = await this.storageProvider.moveToFinalDestination(
        tempFilePath,
        application.folderName,
        document.fileName
      );

      // TODO: Lógica Sharp/Compressão - Futuro
      
      // Atualiza as rotas definitivas e o Status no banco de dados para SAVED
      await this.documentRepo.updatePaths(document.id, filePath, fileUrl);
      await this.documentRepo.updateStatus(document.id, 'SAVED');

      logger.info({ filePath }, `[Worker] Upload processado e salvo`);
    } catch (error: any) {
      await this.documentRepo.updateStatus(document.id, 'FAILED');
      throw error;
    }
  }
}
