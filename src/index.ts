import express from "express";
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

app.listen(PORT, () => {
  console.log(`Uploading service running on port ${PORT}`);
});
