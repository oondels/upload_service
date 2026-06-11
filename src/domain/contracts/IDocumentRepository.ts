import { UploadedDocument, DocumentStatus } from '../entities/UploadedDocument';

export interface IDocumentRepository {
  create(document: UploadedDocument): Promise<void>;
  updateStatus(id: string, status: DocumentStatus): Promise<void>;
  updatePaths(id: string, filePath: string, fileUrl: string): Promise<void>;
  findByCorrelationId(correlationId: string): Promise<UploadedDocument | null>;
  findExpiredDocuments(referenceDate: Date): Promise<UploadedDocument[]>;
}
