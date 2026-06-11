import { Router, Request, Response, RequestHandler } from "express";
import upload from "../config/multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { notifyService } from "../queues/uploadQueue";
import env from "../config/env";

const router = Router();

const uploadHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ error: "Nenhum arquivo enviado" });
      return;
    }

    const payload = req.body.data;
    const serviceName = (req.headers["x-service"] as string) || (req.query.service as string);
    if (!serviceName) {
      res.status(400).json({ error: "O nome do serviço é obrigatório! Use o cabeçalho 'x-service'." });
      return;
    }
    
    const dassOffice = (req.headers["x-dass-office"] as string) || (req.query.dassOffice as string);
    if (!dassOffice) {
      res.status(400).json({ error: "O cabeçalho 'x-dass-office' é obrigatório!" });
      return;
    }

    const mappedFiles = files.map((file) => ({
      correlationId: uuidv4(),
      timesTamp: new Date().toISOString(),
      fileSize: file.size,
      filePath: file.path,
      fileUrl: env.FILE_URL_PATH + file.path.split(env.UPLOAD_FOLDER)[1],
      fileName: file.filename,
      title: path.basename(file.path),
    }));

    const message = {
      serviceName,
      payload,
      files: mappedFiles,
      dassOffice
    };

    console.log(mappedFiles);

    await notifyService(message);

    res.json({
      message: "Uploads enfileirados para processamento!",
      files: mappedFiles,
      serviceName,
    });
  } catch (error) {
    console.error("Erro ao enfileirar upload:", error);
    res.status(500).json({ message: "Erro ao processar a requisição" });
  }
};

router.post("/", upload.array("files"), uploadHandler);

router.get("/", (req: Request, res: Response) => {
  res.json({ message: "Upload service is running" });
});

export default router;
