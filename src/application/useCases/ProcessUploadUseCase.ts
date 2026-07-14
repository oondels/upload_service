import { IApplicationRepository } from '../../domain/contracts/IApplicationRepository';
import { IDocumentRepository } from '../../domain/contracts/IDocumentRepository';
import { IQueueProvider } from '../../domain/contracts/IQueueProvider';
import { UploadedDocument } from '../../domain/entities/UploadedDocument';
import { randomUUID } from 'crypto';

export class ProcessUploadUseCase {
  constructor(
    private applicationRepository: IApplicationRepository,
    private documentRepository: IDocumentRepository,
    private queueProvider: IQueueProvider
  ) {}

  async execute(params: {
    applicationFolderName: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    retentionDays?: number;
    tempFilePath: string;
  }): Promise<string> {
    const app = await this.applicationRepository.findByFolderName(params.applicationFolderName);

    if (!app || !app.isActive) {
      throw new Error('Application not found or inactive');
    }

    const correlationId = randomUUID();
    const fileName = `${correlationId}.webp`;
    const retentionDays = params.retentionDays ?? null;
    const expiresAt = retentionDays ? new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000) : null;

    const document = new UploadedDocument(
      randomUUID(),
      correlationId,
      app.id,
      params.originalName,
      fileName,
      params.tempFilePath,
      '',
      params.mimeType,
      params.sizeBytes,
      retentionDays,
      expiresAt,
      'QUEUED',
      new Date(),
      new Date()
    );

    await this.documentRepository.create(document);
    await this.queueProvider.publishUploadJob(correlationId, { tempFilePath: params.tempFilePath });

    return correlationId;
  }
}
