import { ValidationError } from '../../errors/ApplicationErrors';

const FOLDER_NAME_PATTERN = /^[a-z0-9_-]{3,100}$/;

export function normalizeApplicationName(name: unknown): string {
  if (typeof name !== 'string' || !name.trim()) {
    throw new ValidationError('name is required.');
  }

  const normalized = name.trim();
  if (normalized.length > 255) {
    throw new ValidationError('name must be at most 255 characters.');
  }

  return normalized;
}

export function normalizeFolderName(folderName: unknown): string {
  if (typeof folderName !== 'string' || !folderName.trim()) {
    throw new ValidationError('folderName is required.');
  }

  const normalized = folderName.trim().toLowerCase();
  if (!FOLDER_NAME_PATTERN.test(normalized)) {
    throw new ValidationError('folderName must contain 3-100 lowercase letters, numbers, hyphens or underscores.');
  }

  return normalized;
}

export function normalizeIsActive(isActive: unknown, defaultValue: boolean): boolean {
  if (isActive === undefined) {
    return defaultValue;
  }

  if (typeof isActive !== 'boolean') {
    throw new ValidationError('isActive must be a boolean.');
  }

  return isActive;
}
