const path = require("path");
const envFile = process.env.DEV_ENV === 'development' ? ".env" : ".env.production";
require("dotenv").config({
  path: path.resolve(__dirname, "../../", envFile),
});

const vars = {
  RABBITMQ_URL: process.env.RABBITMQ_URL,
  UPLOAD_FOLDER: process.env.UPLOAD_FOLDER || "/app/uploads",
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES,
  DEV_ENV: process.env.DEV_ENV,
};

module.exports = vars;
