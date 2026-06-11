import multer from "multer";
import path from "path";
import fs from "fs";
import env from "./env";
import { v4 as uuidv4 } from "uuid";
import { Request } from "express";

const uploadDir = env.UPLOAD_FOLDER;

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    try {
      let data: any;
      if (req.body.data) {
        data = JSON.parse(req.body.data);
      }
      
      let serviceName = (req.headers["x-service"] as string) || (req.query.service as string);
      if (!serviceName && req.body.data && data) {
        serviceName = data.nome;
      }

      if (!serviceName) {
        return cb(new Error('O nome do serviço é obrigatório! Use o cabeçalho "x-service", parâmetro "service" ou no corpo da requisição.'), "");
      }
      
      serviceName = serviceName.replace(/\s+/g, "_").toUpperCase();

      let subFolder = (req.headers["x-subfolder"] as string) || (req.query.subFolder as string);
      if (!subFolder && req.body.data && data) {
        try {
          subFolder = data.subFolder;
        } catch (error) {
          console.error("Erro ao ler subFolder do body.data: ", error);
        }
      }
      
      if (subFolder) {
        subFolder = subFolder.replace(/\s+/g, "_").toUpperCase();
      }

      const finalDir = subFolder ? path.join(uploadDir, serviceName, subFolder) : path.join(uploadDir, serviceName);
      if (!fs.existsSync(finalDir)) {
        fs.mkdirSync(finalDir, { recursive: true });
      }

      cb(null, finalDir);
    } catch (error: any) {
      console.error("Erro ao processar o nome do serviço ou subpasta: ", error);
      cb(new Error("Erro ao processar o nome do serviço ou subpasta."), "");
    }
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const fileId = uuidv4();
    cb(null, `${fileId}-${file.originalname}`);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = env.ALLOWED_FILE_TYPES.split(",");
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (allowedTypes.some((type) => extname.includes(type) || mimetype.includes(type))) {
    cb(null, true);
  } else {
    cb(new Error("Apenas imagens são permitidas!"));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

export default upload;
