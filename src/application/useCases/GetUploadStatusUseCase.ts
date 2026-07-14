import { IDocumentRepository } from '../../domain/contracts/IDocumentRepository';
import { UploadedDocument } from '../../domain/entities/UploadedDocument';

export class GetUploadStatusUseCase {
  constructor(private documentRepository: IDocumentRepository) {}

  async execute(correlationId: string): Promise<UploadedDocument | null> {
    return this.documentRepository.findByCorrelationId(correlationId);
  }
}
