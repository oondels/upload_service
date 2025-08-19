const express = require("express");
const upload = require("../config/multer");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const { notifyService } = require("../queues/uploadQueue");
const dotenv = require("../config/dotenv");

const router = express.Router();

router.post("/", upload.array("files"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const payload = req.body.data;
    const serviceName = req.headers["x-service"] || req.query.service;
    if (!serviceName) {
      return res.status(400).json({ error: "O nome do serviço é obrigatório! Use o cabeçalho 'x-service'." });
    }
    const dassOffice = req.headers["x-dass-office"] || req.query.dassOffice;
    if (!dassOffice) {
      return res.status(400).json({ error: "O cabeçalho 'x-dass-office' é obrigatório!" });
    }

    const files = req.files.map((file) => ({
      correlationId: uuidv4(),
      timesTamp: new Date().toISOString(),
      fileSize: file.size,
      filePath: file.path,
      fileUrl: dotenv.FILE_URL_PATH + file.path.split(dotenv.UPLOAD_FOLDER)[1], // FILE_URL_PATH -> Pasta do arquivo configurada para servir no apache
      fileName: file.filename,
      title: path.basename(file.path),
    }));

    const message = {
      serviceName,
      payload,
      files,
      dassOffice
    };

    console.log(files);

    await notifyService(message);

    res.json({
      message: "Uploads enfileirados para processamento!",
      files,
      serviceName,
    });
  } catch (error) {
    console.error("Erro ao enfileirar upload:", error);
    res.status(500).json({ message: "Erro ao processar a requisição" });
  }
});

router.get("/", (req, res) => {
  res.json({ message: "Upload service" });
});

module.exports = router;
