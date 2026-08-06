import express from 'express';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { ApplicationRepository } from './infrastructure/database/repositories/ApplicationRepository';
import { DocumentRepository } from './infrastructure/database/repositories/DocumentRepository';
import { BullMQQueueProvider } from './infrastructure/messaging/BullMQQueueProvider';
import { LocalDiskStorageProvider } from './infrastructure/storage/LocalDiskStorageProvider';
import { ProcessUploadUseCase } from './application/useCases/ProcessUploadUseCase';
import { GetUploadStatusUseCase } from './application/useCases/GetUploadStatusUseCase';
import { CreateApplicationUseCase } from './application/useCases/applications/CreateApplicationUseCase';
import { DeactivateApplicationUseCase } from './application/useCases/applications/DeactivateApplicationUseCase';
import { GetApplicationUseCase } from './application/useCases/applications/GetApplicationUseCase';
import { ListApplicationsUseCase } from './application/useCases/applications/ListApplicationsUseCase';
import { UpdateApplicationUseCase } from './application/useCases/applications/UpdateApplicationUseCase';
import { createApplicationRoutes } from './routes/applications';
import { createUploadRoutes } from './routes/upload';

export function createApp() {
  const app = express();

  const limiter = rateLimit({
    windowMs: 2 * 60 * 1000,
    max: 100,
    message: { error: 'Muitas requisições deste IP, tente novamente mais tarde.' },
  });

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(cors());
  app.use(express.json());
  app.use(limiter);

  const uploadPath = process.env.UPLOAD_FOLDER || path.resolve(__dirname, '../../uploads');
  app.use('/uploads', express.static(uploadPath, {
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
  }));

  const applicationRepo = new ApplicationRepository();
  const documentRepo = new DocumentRepository();
  const queueProvider = new BullMQQueueProvider();
  const storageProvider = new LocalDiskStorageProvider();

  app.use(createApplicationRoutes({
    createApplicationUseCase: new CreateApplicationUseCase(applicationRepo),
    listApplicationsUseCase: new ListApplicationsUseCase(applicationRepo),
    getApplicationUseCase: new GetApplicationUseCase(applicationRepo),
    updateApplicationUseCase: new UpdateApplicationUseCase(applicationRepo),
    deactivateApplicationUseCase: new DeactivateApplicationUseCase(applicationRepo),
  }));

  app.use(createUploadRoutes({
    processUploadUseCase: new ProcessUploadUseCase(applicationRepo, documentRepo, queueProvider),
    getUploadStatusUseCase: new GetUploadStatusUseCase(documentRepo),
    storageProvider,
    documentRepo,
  }));

  return app;
}
