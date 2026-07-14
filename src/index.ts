import 'reflect-metadata';
import './infrastructure/observability/instrumentation';
import { AppDataSource } from './infrastructure/database/data-source';
import { BullMQWorker } from './infrastructure/messaging/BullMQWorker';
import { CronJobService } from './infrastructure/jobs/CronJobService';
import { logger } from './utils/logger';
import { createApp } from './app';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3020;

AppDataSource.initialize()
  .then(() => {
    logger.info('Banco de dados conectado com sucesso via TypeORM.');

    new BullMQWorker();
    const cronService = new CronJobService();
    cronService.startJobs();

    const app = createApp();
    app.listen(PORT, () => {
      logger.info(`Uploading service running on port ${PORT}`);
    });
  })
  .catch((error) => logger.error({ err: error }, 'Erro ao conectar no banco de dados'));
