import path from "path";
import dotenv from "dotenv";

const envFile = process.env.DEV_ENV === "development" ? ".env" : ".env.production";

dotenv.config({
  path: path.resolve(__dirname, "../../", envFile),
});

interface EnvVars {
  REDIS_URL: string;
  UPLOAD_FOLDER: string;
  FILE_URL_PATH: string;
  MAX_FILE_SIZE: string;
  ALLOWED_FILE_TYPES: string;
  DEV_ENV?: string;
  DB_HOST?: string;
  DB_PORT?: string;
  DB_USER?: string;
  DB_PASSWORD?: string;
  DB_NAME?: string;
  OTL_TRACE_EXPORTER_URL?:string;
  OTL_METRICS_EXPORTER_URL?:string;
}

const vars: EnvVars = {
  REDIS_URL: process.env.REDIS_URL || "",
  UPLOAD_FOLDER: process.env.UPLOAD_FOLDER || "",
  FILE_URL_PATH: process.env.FILE_URL_PATH || "http://localhost/uploads/",
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || "",
  ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES || "",
  DEV_ENV: process.env.DEV_ENV,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  OTL_METRICS_EXPORTER_URL: process.env.OTL_METRICS_EXPORTER_URL,
  OTL_TRACE_EXPORTER_URL: process.env.OTL_TRACE_EXPORTER_URL,
};

export default vars;
