import multer from 'multer';
import path from 'path';
import fs from 'fs';
import env from './env';

function getAllowedTypes(): string[] {
  return env.ALLOWED_FILE_TYPES
    .split(',')
    .map((type) => type.trim().toLowerCase())
    .filter(Boolean);
}

function getMaxFileSizeBytes(): number {
  const megabytes = Number.parseInt(env.MAX_FILE_SIZE, 10);
  return (Number.isFinite(megabytes) && megabytes > 0 ? megabytes : 5) * 1024 * 1024;
}

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowedTypes = getAllowedTypes();
  const extension = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype.toLowerCase();

  const isAllowed = allowedTypes.some((type) => {
    const normalized = type.startsWith('.') ? type : `.${type}`;
    return extension === normalized || mimeType.includes(type.replace(/^\./, ''));
  });

  if (!isAllowed) {
    cb(new Error('File type is not allowed.'));
    return;
  }

  cb(null, true);
};

const tempUploadDir = 'tmp/';
fs.mkdirSync(tempUploadDir, { recursive: true });

export const uploadToTemp = multer({
  dest: tempUploadDir,
  fileFilter,
  limits: { fileSize: getMaxFileSizeBytes() },
});

export default uploadToTemp;
