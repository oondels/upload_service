import cron from 'node-cron';
import { CleanupExpiredDocumentsUseCase } from '../../application/useCases/CleanupExpiredDocumentsUseCase';
import { DocumentRepository } from '../database/repositories/DocumentRepository';
import { LocalDiskStorageProvider } from '../storage/LocalDiskStorageProvider';

export class CronJobService {
  private cleanupUseCase: CleanupExpiredDocumentsUseCase;

  constructor() {
    const documentRepo = new DocumentRepository();
    const storageProvider = new LocalDiskStorageProvider();
    this.cleanupUseCase = new CleanupExpiredDocumentsUseCase(documentRepo, storageProvider);
  }

  public startJobs(): void {
    // Roda todos os dias às 02:00 AM (expressão cron)
    cron.schedule('0 2 * * *', async () => {
      console.log('[CronJob] Iniciando limpeza de documentos expirados...');
      try {
        const deletedCount = await this.cleanupUseCase.execute();
        console.log(`[CronJob] Limpeza finalizada. ${deletedCount} documentos removidos do disco de forma permanente.`);
      } catch (error) {
        console.error('[CronJob] Erro durante a limpeza de documentos expirados:', error);
      }
    });

    console.log('[CronJob] Serviço de Cron Jobs iniciado e aguardando horários programados.');
  }
}
