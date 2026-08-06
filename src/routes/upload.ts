import { Router, Request, Response } from 'express';
import { ProcessUploadUseCase } from '../application/useCases/ProcessUploadUseCase';
import { GetUploadStatusUseCase } from '../application/useCases/GetUploadStatusUseCase';
import { IStorageProvider } from '../domain/contracts/IStorageProvider';
import { IDocumentRepository } from '../domain/contracts/IDocumentRepository';
import uploadToTemp from '../config/multer';
import { logger } from '../utils/logger';

export interface UploadRouteDeps {
  processUploadUseCase: ProcessUploadUseCase;
  getUploadStatusUseCase: GetUploadStatusUseCase;
  storageProvider: IStorageProvider;
  documentRepo?: IDocumentRepository;
}

export function createUploadRoutes(deps: UploadRouteDeps): Router {
  const router = Router();

  router.get('/', (_req: Request, res: Response) => {
    res.status(200).json({ message: 'Upload service is running!' });
  });

  router.post('/api/v1/uploads', async (req: Request, res: Response): Promise<void> => {
    await runUploadRequest(req, res, deps, {
      applicationField: 'application',
      retentionField: 'persistence',
      deprecated: false,
    });
  });

  router.post('/upload', async (req: Request, res: Response): Promise<void> => {
    await runUploadRequest(req, res, deps, {
      applicationField: 'applicationFolderName',
      retentionField: 'retentionDays',
      deprecated: true,
    });
  });

  router.get('/api/v1/uploads/:correlationId', async (req: Request, res: Response): Promise<void> => {
    const document = await deps.getUploadStatusUseCase.execute(String(req.params.correlationId));
    if (!document) {
      res.status(404).json({ error: 'Upload not found.' });
      return;
    }

    res.status(200).json({
      correlationId: document.correlationId,
      status: document.status,
      fileUrl: document.fileUrl || null,
    });
  });

  router.delete('/api/v1/uploads', async (req: Request, res: Response): Promise<void> => {
    const { fileUrl } = req.body;
    if (!fileUrl) {
      res.status(400).json({ error: 'fileUrl é obrigatório' });
      return;
    }

    try {
      if (deps.documentRepo) {
         const doc = await deps.documentRepo.findByFileUrl(fileUrl);
         if (doc) {
             await deps.storageProvider.deleteFile(doc.filePath);
             await deps.documentRepo.delete(doc.id);
             res.status(200).json({ message: 'Arquivo removido com sucesso' });
             return;
         }
      }

      res.status(404).json({ error: 'Arquivo não encontrado no banco de dados' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao remover arquivo' });
    }
  });

  return router;
}

async function runUploadRequest(
  req: Request,
  res: Response,
  deps: UploadRouteDeps,
  options: { applicationField: string; retentionField: string; deprecated: boolean }
): Promise<void> {
  try {
    await parseMultipartUpload(req, res);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Upload inválido.' });
    return;
  }

  await handleUpload(req, res, deps, options);
}

function parseMultipartUpload(req: Request, res: Response): Promise<void> {
  return new Promise((resolve, reject) => {
    uploadToTemp.single('file')(req, res, (error: unknown) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

async function handleUpload(
  req: Request,
  res: Response,
  deps: UploadRouteDeps,
  options: { applicationField: string; retentionField: string; deprecated: boolean }
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Nenhum arquivo enviado.' });
      return;
    }

    const applicationFolderName = req.body[options.applicationField];
    const retentionDays = parseRetentionDays(req.body[options.retentionField]);

    if (!applicationFolderName) {
      res.status(400).json({ error: `${options.applicationField} é obrigatório no corpo da requisição.` });
      return;
    }

    if (retentionDays === 'INVALID') {
      await deps.storageProvider.deleteFile(req.file.path);
      res.status(400).json({ error: `${options.retentionField} deve ser um inteiro positivo.` });
      return;
    }

    const correlationId = await deps.processUploadUseCase.execute({
      applicationFolderName,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      retentionDays,
      tempFilePath: req.file.path,
    });

    if (options.deprecated) {
      res.setHeader('Deprecation', 'true');
      res.setHeader('Link', '</api/v1/uploads>; rel="successor-version"');
    }

    res.status(202).json({
      message: 'Upload aceito e enviado para processamento na fila.',
      correlationId,
      status: 'QUEUED',
    });
  } catch (error: any) {
    logger.error({ err: error }, 'Erro na rota de upload');

    if (req.file?.path) {
      try {
        await deps.storageProvider.deleteFile(req.file.path);
      } catch (cleanupError) {
        logger.error({ err: cleanupError }, 'Falha ao remover arquivo temporário órfão');
      }
    }

    if (error.message === 'Application not found or inactive') {
      res.status(403).json({ error: 'Aplicação não autorizada ou inexistente.' });
      return;
    }

    res.status(500).json({ error: 'Erro interno do servidor ao processar o upload.' });
  }
}

function parseRetentionDays(value: unknown): number | undefined | 'INVALID' {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed <= 0 || String(parsed) !== String(value)) {
    return 'INVALID';
  }

  return parsed;
}
