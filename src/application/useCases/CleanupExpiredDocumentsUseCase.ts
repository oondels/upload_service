import { IDocumentRepository } from '../../domain/contracts/IDocumentRepository';
import { IStorageProvider } from '../../domain/contracts/IStorageProvider';

export class CleanupExpiredDocumentsUseCase {
  constructor(
    private documentRepository: IDocumentRepository,
    private storageProvider: IStorageProvider
  ) {}

  async execute(): Promise<number> {
    const expiredDocs = await this.documentRepository.findExpiredDocuments(new Date());
    let deletedCount = 0;

    for (const doc of expiredDocs) {
      try {
        await this.storageProvider.deleteFile(doc.filePath);
        await this.documentRepository.updateStatus(doc.id, 'EXPIRED_DELETED');
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete expired document ${doc.id}:`, error);
        // Continua deletando os próximos mesmo se um falhar
      }
    }

    return deletedCount;
  }
}
