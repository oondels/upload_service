import fs from 'fs/promises';
import path from 'path';
import { IStorageProvider } from '../../domain/contracts/IStorageProvider';
import env from '../../config/env';

export class LocalDiskStorageProvider implements IStorageProvider {
  private baseStoragePath: string;
  private baseUrl: string;

  constructor() {
    this.baseStoragePath = path.resolve(env.UPLOAD_FOLDER || path.join(__dirname, '../../../../uploads'));
    this.baseUrl = env.FILE_URL_PATH || 'http://localhost:3020/uploads/';
  }

  async moveToFinalDestination(tempPath: string, appFolderName: string, finalFileName: string): Promise<{ filePath: string; fileUrl: string; }> {
    const { appFolder, finalPath } = await this.resolveFinalPath(appFolderName, finalFileName);
    await fs.mkdir(appFolder, { recursive: true });
    await fs.rename(tempPath, finalPath);

    return { filePath: finalPath, fileUrl: this.buildFileUrl(appFolderName, finalFileName) };
  }

  async saveBufferToFinalDestination(buffer: Buffer, appFolderName: string, finalFileName: string): Promise<{ filePath: string; fileUrl: string; }> {
    const { appFolder, finalPath } = await this.resolveFinalPath(appFolderName, finalFileName);
    await fs.mkdir(appFolder, { recursive: true });
    await fs.writeFile(finalPath, buffer);

    return { filePath: finalPath, fileUrl: this.buildFileUrl(appFolderName, finalFileName) };
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  private async resolveFinalPath(appFolderName: string, finalFileName: string): Promise<{ appFolder: string; finalPath: string }> {
    const appFolder = path.resolve(this.baseStoragePath, appFolderName);
    const finalPath = path.resolve(appFolder, finalFileName);

    if (!this.isInsideBasePath(appFolder) || !this.isInsideBasePath(finalPath)) {
      throw new Error('Invalid storage path.');
    }

    return { appFolder, finalPath };
  }

  private isInsideBasePath(targetPath: string): boolean {
    const relativePath = path.relative(this.baseStoragePath, targetPath);
    return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath));
  }

  private buildFileUrl(appFolderName: string, finalFileName: string): string {
    return `${this.baseUrl.replace(/\/$/, '')}/${appFolderName}/${finalFileName}`;
  }
}
