const path = require("path");
const envFile = process.env.DEV_ENV === 'development' ? ".env" : ".env.production";
require("dotenv").config({
  path: path.resolve(__dirname, "../../", envFile),
});

const vars = {
  RABBITMQ_URL: process.env.RABBITMQ_URL,
  UPLOAD_FOLDER: process.env.UPLOAD_FOLDER || "",
  FILE_URL_PATH: process.env.FILE_URL_PATH || "http://localhost/uploads/",
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES,
  DEV_ENV: process.env.DEV_ENV,
};

module.exports = vars;
