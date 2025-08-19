const multer = require("multer");
const path = require("path");
const fs = require("fs");
const dotenv = require("./dotenv");
const { v4: uuidv4 } = require("uuid");

const uploadDir = dotenv.UPLOAD_FOLDER;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      let data;
      if (req.body.data) {
        data = JSON.parse(req.body.data);
      }
      // Obtém o nome do serviço: pode vir pelo cabeçalho, query ou no corpo (se existir o JSON em req.body.data)
      let serviceName = req.headers["x-service"] || req.query.service;
      if (!serviceName && req.body.data) {
        serviceName = data.nome;
      }

      if (!serviceName) {
        return cb(new Error('O nome do serviço é obrigatório! Use o cabeçalho "x-service", parâmetro "service" ou no corpo da requisição.'));
      }
      // Normalize service name
      serviceName = serviceName.replace(/\s+/g, "_").toUpperCase();

      // Obtém o subdiretório: pode vir pelo cabeçalho ou query ou no corpo (req.body.data)
      let subFolder = req.headers["x-subfolder"] || req.query.subFolder;
      if (!subFolder && req.body.data) {
        try {
          subFolder = data.subFolder;
        } catch (error) {
          console.error();
        }
      }
      // Se houver subpasta, normaliza também
      if (subFolder) {
        subFolder = subFolder.replace(/\s+/g, "_").toUpperCase();
      }

      const finalDir = subFolder ? path.join(uploadDir, serviceName, subFolder) : path.join(uploadDir, serviceName);
      if (!fs.existsSync(finalDir)) {
        fs.mkdirSync(finalDir, { recursive: true });
      }

      cb(null, finalDir);
    } catch (error) {
      console.error("Erro ao processar o nome do serviço ou subpasta: ", error);
      cb(new Error("Erro ao processar o nome do serviço ou subpasta."));
    }
  },
  filename: (req, file, cb) => {
    const fileId = uuidv4();
    cb(null, `${fileId}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = dotenv.ALLOWED_FILE_TYPES.split(",");
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (allowedTypes.some((type) => extname.includes(type) || mimetype.includes(type))) {
    cb(null, true);
  } else {
    cb(new Error("Apenas imagens são permitidas!"), false);
  }
};

// Adiciona limite de 5mb
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = upload;
