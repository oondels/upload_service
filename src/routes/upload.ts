import { Router, Request, Response } from 'express';
import multer from 'multer';
import { ProcessUploadUseCase } from '../application/useCases/ProcessUploadUseCase';
import { ApplicationRepository } from '../infrastructure/database/repositories/ApplicationRepository';
import { DocumentRepository } from '../infrastructure/database/repositories/DocumentRepository';
import { BullMQQueueProvider } from '../infrastructure/messaging/BullMQQueueProvider';
import { logger } from '../utils/logger';

const router = Router();
const upload = multer({ dest: 'tmp/' }); // Armazenamento temporário inicial

// Inicializa as dependências (Injeção de Dependência manual)
const applicationRepo = new ApplicationRepository();
const documentRepo = new DocumentRepository();
const queueProvider = new BullMQQueueProvider();
const processUploadUseCase = new ProcessUploadUseCase(applicationRepo, documentRepo, queueProvider);

router.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Upload service is running!"
  })
})

router.post('/upload', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      logger.warn("Nenhum arquivo enviado.")
      res.status(400).json({ error: 'Nenhum arquivo enviado.' });
      return;
    }

    const { applicationFolderName, retentionDays } = req.body;

    if (!applicationFolderName) {
      res.status(400).json({ error: 'applicationFolderName é obrigatório no corpo da requisição.' });
      return;
    }

    const correlationId = await processUploadUseCase.execute({
      applicationFolderName,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      retentionDays: retentionDays ? parseInt(retentionDays, 10) : undefined,
      tempFilePath: req.file.path
    });

    res.status(202).json({
      message: 'Upload aceito e enviado para processamento na fila.',
      correlationId
    });
  } catch (error: any) {
    console.error('Erro na rota de upload:', error);
    
    if (error.message === 'Application not found or inactive') {
      res.status(403).json({ error: 'Aplicação não autorizada ou inexistente.' });
      return;
    }

    res.status(500).json({ error: 'Erro interno do servidor ao processar o upload.' });
  }
});

export default router;
