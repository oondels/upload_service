import path from "path";
import dotenv from "dotenv";

const envFile = process.env.DEV_ENV === "development" ? ".env" : ".env.production";

dotenv.config({
  path: path.resolve(__dirname, "../../", envFile),
});

interface EnvVars {
  REDIS_URL: string;
  REDIS_HOST?: string;
  REDIS_PORT?: string;
  UPLOAD_FOLDER: string;
  FILE_URL_PATH: string;
  MAX_FILE_SIZE: string;
  ALLOWED_FILE_TYPES: string;
  IMAGE_WEBP_QUALITY: string;
  IMAGE_MAX_WIDTH: string;
  IMAGE_MAX_HEIGHT: string;
  DEV_ENV?: string;
  DB_HOST?: string;
  DB_PORT?: string;
  DB_USER?: string;
  DB_PASSWORD?: string;
  DB_NAME?: string;
  OTL_TRACE_EXPORTER_URL?: string;
  OTL_METRICS_EXPORTER_URL?: string;
  SERVICE_VERSION: string;
}

function resolveRedisUrl(): string {
  const redisUrl = process.env.REDIS_URL || "";

  if (!redisUrl || (!process.env.REDIS_HOST && !process.env.REDIS_PORT)) {
    return redisUrl;
  }

  try {
    const parsedUrl = new URL(redisUrl);

    if (process.env.REDIS_HOST) {
      parsedUrl.hostname = process.env.REDIS_HOST;
    }

    if (process.env.REDIS_PORT) {
      parsedUrl.port = process.env.REDIS_PORT;
    }

    return parsedUrl.toString();
  } catch {
    return redisUrl;
  }
}

const vars: EnvVars = {
  REDIS_URL: resolveRedisUrl(),
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  UPLOAD_FOLDER: process.env.UPLOAD_FOLDER || "",
  FILE_URL_PATH: process.env.FILE_URL_PATH || "http://localhost/uploads/",
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || "5",
  ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES || ".jpg,.jpeg,.png,.webp",
  IMAGE_WEBP_QUALITY: process.env.IMAGE_WEBP_QUALITY || "80",
  IMAGE_MAX_WIDTH: process.env.IMAGE_MAX_WIDTH || "1920",
  IMAGE_MAX_HEIGHT: process.env.IMAGE_MAX_HEIGHT || "1080",
  DEV_ENV: process.env.DEV_ENV,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  OTL_METRICS_EXPORTER_URL: process.env.OTL_METRICS_EXPORTER_URL,
  OTL_TRACE_EXPORTER_URL: process.env.OTL_TRACE_EXPORTER_URL,
  SERVICE_VERSION: process.env.SERVICE_VERSION || "1.0.0",
};

export default vars;
