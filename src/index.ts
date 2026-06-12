import 'reflect-metadata';
import express from "express";
import { AppDataSource } from "./infrastructure/database/data-source";
import { BullMQWorker } from "./infrastructure/messaging/BullMQWorker";
import { CronJobService } from "./infrastructure/jobs/CronJobService";
import { logger } from "./utils/logger";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import uploadRoutes from "./routes/upload";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3020;

const limiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 100,
  message: { error: "Muitas requisições deste IP, tente novamente mais tarde." }
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(limiter);
app.use(uploadRoutes);

AppDataSource.initialize()
  .then(() => {
    logger.info("Banco de dados conectado com sucesso via TypeORM.");
    
    // Inicia os serviços de Background e Cron Jobs
    new BullMQWorker();
    const cronService = new CronJobService();
    cronService.startJobs();

    app.listen(PORT, () => {
      logger.info(`Uploading service running on port ${PORT}`);
    });
  })
  .catch((error) => logger.error({ err: error }, "Erro ao conectar no banco de dados"));
