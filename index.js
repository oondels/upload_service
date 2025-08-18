const express = require("express");
const helmet = require("helmet");
const dotenv = require("./src/config/dotenv")
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const uploadRoutes = require("./src/routes/upload");

const app = express();
const PORT = 9923;

const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutos
  max: 10, // Máximo de 10 requisições por IP
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(limiter);
app.use(uploadRoutes);

app.listen(PORT, () => {
  console.log(`Uploading service running on port ${PORT}`);
});
