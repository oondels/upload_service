import { Repository, LessThan } from 'typeorm';
import { IDocumentRepository } from '../../../domain/contracts/IDocumentRepository';
import { UploadedDocument, DocumentStatus } from '../../../domain/entities/UploadedDocument';
import { UploadedDocumentEntity } from '../entities/UploadedDocumentEntity';
import { AppDataSource } from '../data-source';

export class DocumentRepository implements IDocumentRepository {
  private repo: Repository<UploadedDocumentEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(UploadedDocumentEntity);
  }

  async create(document: UploadedDocument): Promise<void> {
    const entity = this.repo.create({
      id: document.id,
      correlationId: document.correlationId,
      applicationId: document.applicationId,
      originalName: document.originalName,
      fileName: document.fileName,
      filePath: document.filePath,
      fileUrl: document.fileUrl,
      mimeType: document.mimeType,
      sizeBytes: document.sizeBytes,
      retentionDays: document.retentionDays,
      expiresAt: document.expiresAt,
      status: document.status,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
    await this.repo.save(entity);
  }

  async updateStatus(id: string, status: DocumentStatus): Promise<void> {
    await this.repo.update(id, { status, updatedAt: new Date() });
  }

  async updatePaths(id: string, filePath: string, fileUrl: string): Promise<void> {
    await this.repo.update(id, { filePath, fileUrl, updatedAt: new Date() });
  }

  async findByCorrelationId(correlationId: string): Promise<UploadedDocument | null> {
    const entity = await this.repo.findOne({ where: { correlationId } });
    return entity ? entity.toDomain() : null;
  }

  async findExpiredDocuments(referenceDate: Date): Promise<UploadedDocument[]> {
    const entities = await this.repo.find({
      where: {
        status: 'SAVED',
        expiresAt: LessThan(referenceDate)
      }
    });
    return entities.map(e => e.toDomain());
  }
}
