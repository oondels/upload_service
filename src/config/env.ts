import path from "path";
import dotenv from "dotenv";

const envFile = process.env.DEV_ENV === "development" ? ".env" : ".env.production";

dotenv.config({
  path: path.resolve(__dirname, "../../", envFile),
});

interface EnvVars {
  RABBITMQ_URL: string;
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
}

const vars: EnvVars = {
  RABBITMQ_URL: process.env.RABBITMQ_URL || "",
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
};

export default vars;
