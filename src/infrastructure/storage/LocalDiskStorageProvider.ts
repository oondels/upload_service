import fs from 'fs/promises';
import path from 'path';
import { IStorageProvider } from '../../domain/contracts/IStorageProvider';
import env from '../../config/env';

export class LocalDiskStorageProvider implements IStorageProvider {
  private baseStoragePath: string;
  private baseUrl: string;

  constructor() {
    this.baseStoragePath = env.UPLOAD_FOLDER || path.join(__dirname, '../../../../uploads');
    this.baseUrl = env.FILE_URL_PATH || 'http://localhost:3020/uploads/';
  }

  async moveToFinalDestination(tempPath: string, appFolderName: string, finalFileName: string): Promise<{ filePath: string; fileUrl: string; }> {
    const appFolder = path.join(this.baseStoragePath, appFolderName);
    
    await fs.mkdir(appFolder, { recursive: true });

    const finalPath = path.join(appFolder, finalFileName);
    
    await fs.rename(tempPath, finalPath);

    const fileUrl = `${this.baseUrl}${appFolderName}/${finalFileName}`;
    
    return { filePath: finalPath, fileUrl };
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
}
